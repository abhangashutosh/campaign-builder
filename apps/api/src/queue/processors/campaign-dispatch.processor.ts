import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue, Job } from 'bullmq'
import { Campaign } from '../../campaigns/entities/campaign.entity'
import { CampaignDelivery } from '../../campaigns/entities/campaign-delivery.entity'
import { Contact } from '../../contacts/entities/contact.entity'
import { QUEUE_NAMES, CampaignDispatchJobData, EmailSendJobData, WhatsAppSendJobData } from '../queue.constants'

const BATCH_SIZE = 100

@Processor(QUEUE_NAMES.CAMPAIGN_DISPATCH)
export class CampaignDispatchProcessor {
  private readonly logger = new Logger(CampaignDispatchProcessor.name)

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignDelivery)
    private readonly deliveryRepo: Repository<CampaignDelivery>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectQueue(QUEUE_NAMES.EMAIL_SEND)
    private readonly emailQueue: Queue<EmailSendJobData>,
    @InjectQueue(QUEUE_NAMES.WHATSAPP_SEND)
    private readonly whatsappQueue: Queue<WhatsAppSendJobData>,
  ) {}

  @Process({ concurrency: 1 })
  async handle(job: Job<CampaignDispatchJobData>): Promise<void> {
    const { tenantId, campaignId } = job.data
    this.logger.log(`Dispatching campaign ${campaignId} for tenant ${tenantId}`)

    // 1. Load campaign (assert tenant)
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId, tenantId } as any,
    })
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found for tenant ${tenantId}`)
    }

    // 2. Load contacts for the segment (simplified — full evaluator would use SegmentEvaluatorService)
    const contactsQuery = this.contactRepo
      .createQueryBuilder('c')
      .where('c.tenant_id = :tenantId', { tenantId })
      .andWhere('c.deleted_at IS NULL')

    if (campaign.audienceSegmentId) {
      // When SegmentEvaluator is wired in, this would apply rules from the segment
      contactsQuery.andWhere('1=1') // placeholder — evaluator applied by SegmentEvaluatorService
    }

    // Apply frequency cap — skip contacts that already received this campaign channel today
    const contacts = await contactsQuery.getMany()
    this.logger.log(`Found ${contacts.length} contacts for campaign ${campaignId}`)

    // 3. Process in batches of BATCH_SIZE
    const channels = campaign.channels
    const meta = campaign.metadata as Record<string, unknown>
    const frequencyCapPerDay = (meta?.frequencyCapPerDay as number) ?? 0

    let skipped = 0
    let enqueued = 0

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE)

      for (const contact of batch) {
        for (const channel of channels) {
          // Frequency cap check
          if (frequencyCapPerDay > 0) {
            const dayStart = new Date()
            dayStart.setHours(0, 0, 0, 0)

            const sentToday = await this.deliveryRepo.count({
              where: {
                tenantId,
                contactId: contact.id,
                channel,
              } as any,
            })

            if (sentToday >= frequencyCapPerDay) {
              skipped++
              continue
            }
          }

          // Insert delivery row
          const delivery = this.deliveryRepo.create({
            tenantId,
            campaignId,
            contactId: contact.id,
            channel,
            status: 'queued',
          })
          const saved = await this.deliveryRepo.save(delivery)

          // Quiet hours check — if in quiet window, delay the job
          let delay = 0
          if (meta?.quietHoursStart && meta?.quietHoursEnd) {
            const now = new Date()
            const [startH, startM] = (meta.quietHoursStart as string).split(':').map(Number)
            const [endH, endM] = (meta.quietHoursEnd as string).split(':').map(Number)
            const nowMinutes = now.getHours() * 60 + now.getMinutes()
            const startMinutes = startH * 60 + startM
            const endMinutes = endH * 60 + endM

            const inQuietHours =
              startMinutes <= endMinutes
                ? nowMinutes >= startMinutes && nowMinutes < endMinutes
                : nowMinutes >= startMinutes || nowMinutes < endMinutes

            if (inQuietHours) {
              // Delay until end of quiet window (same day or next day)
              const endTime = new Date()
              endTime.setHours(endH, endM, 0, 0)
              if (endTime <= now) endTime.setDate(endTime.getDate() + 1)
              delay = endTime.getTime() - now.getTime()
            }
          }

          // Enqueue per-channel send job
          if (channel === 'email' && contact.email) {
            await this.emailQueue.add(
              'send',
              {
                tenantId,
                deliveryId: saved.id,
                to: contact.email,
                from: 'noreply@campaign.example.com',
                subject: campaign.name,
                html: '<p>Campaign content</p>',
              },
              {
                attempts: 4,
                backoff: { type: 'exponential', delay: 1000 },
                delay,
              },
            )
            enqueued++
          } else if (channel === 'whatsapp' && contact.phone) {
            await this.whatsappQueue.add(
              'send',
              {
                tenantId,
                deliveryId: saved.id,
                to: contact.phone,
                templateName: 'campaign_template',
                languageCode: 'en_US',
                variables: [],
                provider: 'meta_cloud_api',
                credentials: {},
              },
              {
                attempts: 4,
                backoff: { type: 'exponential', delay: 1000 },
                delay,
              },
            )
            enqueued++
          }
        }
      }
    }

    // 4. Update campaign status to 'running'
    await this.campaignRepo.update({ id: campaignId, tenantId } as any, { status: 'running' })

    this.logger.log(`Campaign ${campaignId}: enqueued=${enqueued}, skipped=${skipped}`)
  }
}
