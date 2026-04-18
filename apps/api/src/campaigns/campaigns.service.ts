import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignsRepository } from './campaigns.repository'
import { Campaign } from './entities/campaign.entity'
import { DeliveryEvent } from './entities/delivery-event.entity'
import { SegmentsService } from '../segments/segments.service'
import { TemplatesService } from '../templates/templates.service'
import { EmailService } from '../channels/email/email.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CampaignsService {
  constructor(
    private readonly repo: CampaignsRepository,
    @InjectRepository(DeliveryEvent)
    private readonly deliveryEventRepo: Repository<DeliveryEvent>,
    private readonly segmentsService: SegmentsService,
    private readonly templatesService: TemplatesService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async findAll(tenantId: string): Promise<Campaign[]> {
    return this.repo.findAllWithRelations(tenantId)
  }

  async findOne(tenantId: string, id: string): Promise<Campaign> {
    return this.repo.findOneOrFail(tenantId, id)
  }

  async create(tenantId: string, data: Partial<Campaign>): Promise<Campaign> {
    return this.repo.create(tenantId, { ...data, status: 'draft', version: 1 })
  }

  async update(tenantId: string, id: string, data: Partial<Campaign>): Promise<Campaign> {
    return this.repo.update(tenantId, id, data)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    return this.repo.softDelete(tenantId, id)
  }

  async publish(tenantId: string, id: string): Promise<Campaign> {
    const campaign = await this.repo.findOneOrFail(tenantId, id)
    if (!campaign.channels.length) {
      throw new BadRequestException('Campaign must have at least one channel')
    }
    return this.repo.update(tenantId, id, {
      status: 'running',
      version: campaign.version + 1,
    })
  }

  async pause(tenantId: string, id: string): Promise<Campaign> {
    return this.repo.update(tenantId, id, { status: 'paused' })
  }

  async getReadiness(tenantId: string, id: string) {
    const campaign = await this.repo.findWithRelations(tenantId, id)

    const templateApproved = campaign.template?.approvalStatus === 'approved'

    let segmentHasContacts = false
    if (campaign.type === 'transactional') {
      segmentHasContacts = true
    } else if (campaign.audienceSegmentId) {
      try {
        const est = await this.segmentsService.estimate(tenantId, campaign.audienceSegmentId)
        segmentHasContacts = (est.total ?? 0) > 0
      } catch {
        segmentHasContacts = false
      }
    }

    const subjectLineSet =
      !campaign.channels.includes('email') ||
      !!(campaign.template?.subject && campaign.template.subject.trim().length > 0)

    const checks: { name: string; points: number; passed: boolean; type: 'blocker' | 'warning' }[] = [
      { name: 'Campaign has name',     points: 10, passed: !!campaign.name,                                                       type: 'warning' },
      { name: 'At least one channel',  points: 15, passed: campaign.channels.length > 0,                                          type: 'blocker' },
      { name: 'Segment assigned',      points: 15, passed: campaign.type === 'transactional' || !!campaign.audienceSegmentId,     type: 'blocker' },
      { name: 'Template assigned',     points: 15, passed: !!campaign.templateId,                                                 type: 'blocker' },
      { name: 'Channel config active', points: 15, passed: true,                                                                  type: 'blocker' },
      { name: 'Template approved',     points: 10, passed: templateApproved,                                                      type: 'warning' },
      { name: 'Segment estimate > 0',  points: 10, passed: segmentHasContacts,                                                    type: 'warning' },
      { name: 'Subject line (email)',  points: 10, passed: subjectLineSet,                                                        type: 'warning' },
    ]

    const score = checks.filter((c) => c.passed).reduce((sum, c) => sum + c.points, 0)
    const blockers = checks.filter((c) => !c.passed && c.type === 'blocker').map((c) => c.name)
    const warnings = checks.filter((c) => !c.passed && c.type === 'warning').map((c) => c.name)
    return { score, ready: score >= 80 && blockers.length === 0, blockers, warnings, checks }
  }

  async sendTest(tenantId: string, id: string, testEmail: string): Promise<{ messageId: string }> {
    const campaign = await this.repo.findWithRelations(tenantId, id)

    if (!campaign.templateId) {
      throw new BadRequestException('Campaign does not have a template assigned')
    }

    const template = campaign.template!
    const fromAddress = this.config.get<string>('app.emailFrom') ?? 'campaigns@example.com'
    const subject = template.subject?.trim()
      ? `[TEST] ${template.subject}`
      : `[TEST] ${campaign.name}`

    const result = await this.emailService.send({
      to: testEmail,
      from: fromAddress,
      subject,
      html: template.htmlBody ?? '<p>No HTML body configured for this template.</p>',
      ...(template.textBody ? { text: template.textBody } : {}),
      tags: { campaign_id: campaign.id, tenant_id: tenantId, send_type: 'test' },
    })

    return { messageId: result.messageId }
  }

  async getReports(tenantId: string, id: string) {
    await this.repo.findOneOrFail(tenantId, id)
    const events = await this.deliveryEventRepo
      .createQueryBuilder('de')
      .innerJoin('campaign_deliveries', 'cd', 'cd.id = de.delivery_id AND cd.campaign_id = :id', { id })
      .where('de.tenant_id = :tenantId', { tenantId })
      .getMany()

    const counts = { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 }
    const failureBreakdown = { hardBounce: 0, spamComplaint: 0, invalidAddress: 0 }

    for (const e of events) {
      const t = e.eventType as keyof typeof counts
      if (t in counts) counts[t]++
      if (e.eventType === 'bounced') {
        const meta = e.metadata as Record<string, string>
        if (meta?.bounce_type === 'hard') failureBreakdown.hardBounce++
        if (meta?.bounce_type === 'invalid') failureBreakdown.invalidAddress++
      }
      if (e.eventType === 'complained') failureBreakdown.spamComplaint++
    }

    return { ...counts, failureBreakdown }
  }
}
