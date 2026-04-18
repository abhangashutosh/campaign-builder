import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Job } from 'bullmq'
import { CampaignDelivery } from '../../campaigns/entities/campaign-delivery.entity'
import { DeliveryEvent } from '../../campaigns/entities/delivery-event.entity'
import { EmailService } from '../../channels/email/email.service'
import { EmailSendError } from '../../channels/email/email.types'
import { QUEUE_NAMES, EmailSendJobData } from '../queue.constants'

@Processor(QUEUE_NAMES.EMAIL_SEND)
export class EmailSendProcessor {
  private readonly logger = new Logger(EmailSendProcessor.name)

  constructor(
    @InjectRepository(CampaignDelivery)
    private readonly deliveryRepo: Repository<CampaignDelivery>,
    @InjectRepository(DeliveryEvent)
    private readonly eventRepo: Repository<DeliveryEvent>,
    private readonly emailService: EmailService,
  ) {}

  @Process()
  async handle(job: Job<EmailSendJobData>): Promise<void> {
    const { tenantId, deliveryId, to, from, subject, html } = job.data

    // Idempotency: if already sent, skip
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId, tenantId } as any,
    })
    if (!delivery) throw new Error(`Delivery ${deliveryId} not found`)
    if (delivery.status !== 'queued') {
      this.logger.debug(`Delivery ${deliveryId} already processed (status=${delivery.status}), skipping`)
      return
    }

    try {
      const result = await this.emailService.send({ to, from, subject, html })

      // Mark sent
      await this.deliveryRepo.update(deliveryId, {
        status: 'sent',
        sentAt: new Date(),
        providerMsgId: result.messageId,
      } as any)

      // Insert delivery event
      await this.eventRepo.save(
        this.eventRepo.create({
          tenantId,
          deliveryId,
          eventType: 'sent',
          metadata: { messageId: result.messageId, provider: result.provider },
        }),
      )

      this.logger.log(`Email sent: deliveryId=${deliveryId}, messageId=${result.messageId}`)
    } catch (err: unknown) {
      const isEmailError = err instanceof EmailSendError
      const retryable = isEmailError ? err.retryable : true
      const message = err instanceof Error ? err.message : String(err)

      this.logger.error(`Email send failed: deliveryId=${deliveryId}, retryable=${retryable}, error=${message}`)

      // If not retryable OR last attempt — mark failed
      if (!retryable || job.attemptsMade >= (job.opts.attempts ?? 4) - 1) {
        await this.deliveryRepo.update(deliveryId, {
          status: 'failed',
          errorReason: message,
        } as any)

        await this.eventRepo.save(
          this.eventRepo.create({
            tenantId,
            deliveryId,
            eventType: 'failed',
            metadata: { error: message, retryable },
          }),
        )
      }

      if (retryable) {
        // Re-throw so BullMQ retries with exponential backoff
        throw err
      }
      // Non-retryable: don't re-throw (job ends as failed, no retry)
    }
  }
}
