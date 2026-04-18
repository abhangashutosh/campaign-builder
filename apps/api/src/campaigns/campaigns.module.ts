import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Campaign } from './entities/campaign.entity'
import { CampaignDelivery } from './entities/campaign-delivery.entity'
import { DeliveryEvent } from './entities/delivery-event.entity'
import { CampaignsRepository } from './campaigns.repository'
import { CampaignsService } from './campaigns.service'
import { CampaignsController } from './campaigns.controller'
import { SegmentsModule } from '../segments/segments.module'
import { TemplatesModule } from '../templates/templates.module'
import { EmailService } from '../channels/email/email.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, CampaignDelivery, DeliveryEvent]),
    SegmentsModule,
    TemplatesModule,
  ],
  providers: [CampaignsRepository, CampaignsService, EmailService],
  controllers: [CampaignsController],
  exports: [CampaignsService],
})
export class CampaignsModule {}
