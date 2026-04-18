import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Job } from 'bullmq'
import { CampaignDelivery } from '../../campaigns/entities/campaign-delivery.entity'
import { DeliveryEvent } from '../../campaigns/entities/delivery-event.entity'
import { WhatsAppService } from '../../channels/whatsapp/whatsapp.service'
import { QUEUE_NAMES, WhatsAppSendJobData } from '../queue.constants'

@Processor(QUEUE_NAMES.WHATSAPP_SEND)
export class WhatsAppSendProcessor {
  private readonly logger = new Logger(WhatsAppSendProcessor.name)

  constructor(
    @InjectRepository(CampaignDelivery)
    private readonly deliveryRepo: Repository<CampaignDelivery>,
    @InjectRepository(DeliveryEvent)
    private readonly eventRepo: Repository<DeliveryEvent>,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Process()
  async handle(job: Job<WhatsAppSendJobData>): Promise<void> {
    const { tenantId, deliveryId, to, templateName, languageCode, variables, provider, credentials } = job.data

    // Idempotency guard
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId, tenantId } as any,
    })
    if (!delivery) throw new Error(`Delivery ${deliveryId} not found`)
    if (delivery.status !== 'queued') {
      this.logger.debug(`Delivery ${deliveryId} already processed (status=${delivery.status}), skipping`)
      return
    }

    try {
      const result = await this.whatsappService.send(provider, credentials, {
        to,
        templateName,
        languageCode,
        variables,
      })

      await this.deliveryRepo.update(deliveryId, {
        status: 'sent',
        sentAt: new Date(),
        providerMsgId: result.messageId,
      } as any)

      await this.eventRepo.save(
        this.eventRepo.create({
          tenantId,
          deliveryId,
          eventType: 'sent',
          metadata: { messageId: result.messageId, provider: result.provider },
        }),
      )

      this.logger.log(`WhatsApp sent: deliveryId=${deliveryId}, messageId=${result.messageId}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error(`WhatsApp send failed: deliveryId=${deliveryId}, error=${message}`)

      if (job.attemptsMade >= (job.opts.attempts ?? 4) - 1) {
        await this.deliveryRepo.update(deliveryId, {
          status: 'failed',
          errorReason: message,
        } as any)

        await this.eventRepo.save(
          this.eventRepo.create({
            tenantId,
            deliveryId,
            eventType: 'failed',
            metadata: { error: message },
          }),
        )
      }

      throw err // Always re-throw for BullMQ retry
    }
  }
}
