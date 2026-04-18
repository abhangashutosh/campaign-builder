import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QUEUE_NAMES } from './queue.constants'
import { CampaignDispatchProcessor } from './processors/campaign-dispatch.processor'
import { EmailSendProcessor } from './processors/email-send.processor'
import { WhatsAppSendProcessor } from './processors/whatsapp-send.processor'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { CampaignDelivery } from '../campaigns/entities/campaign-delivery.entity'
import { DeliveryEvent } from '../campaigns/entities/delivery-event.entity'
import { Contact } from '../contacts/entities/contact.entity'
import { EmailService } from '../channels/email/email.service'
import { WhatsAppService } from '../channels/whatsapp/whatsapp.service'

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.CAMPAIGN_DISPATCH },
      { name: QUEUE_NAMES.EMAIL_SEND },
      { name: QUEUE_NAMES.WHATSAPP_SEND },
    ),
    TypeOrmModule.forFeature([Campaign, CampaignDelivery, DeliveryEvent, Contact]),
  ],
  providers: [
    CampaignDispatchProcessor,
    EmailSendProcessor,
    WhatsAppSendProcessor,
    EmailService,
    WhatsAppService,
  ],
  exports: [
    BullModule,
    EmailService,
    WhatsAppService,
  ],
})
export class QueueModule {}
