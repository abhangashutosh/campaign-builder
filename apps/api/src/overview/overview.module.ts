import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { CampaignDelivery } from '../campaigns/entities/campaign-delivery.entity'
import { OverviewController } from './overview.controller'
import { OverviewService } from './overview.service'

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, CampaignDelivery])],
  providers: [OverviewService],
  controllers: [OverviewController],
})
export class OverviewModule {}
