import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { CampaignDelivery } from '../campaigns/entities/campaign-delivery.entity'

export interface OverviewStats {
  totalCampaigns: number
  activeCampaigns: number
  deliveryRate: number
  openRate: number
  clickRate: number
}

@Injectable()
export class OverviewService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignDelivery)
    private readonly deliveryRepo: Repository<CampaignDelivery>,
  ) {}

  async getStats(tenantId: string): Promise<OverviewStats> {
    // Single-pass aggregate via QueryBuilder
    const [totalCampaigns, activeCampaigns] = await Promise.all([
      this.campaignRepo.count({ where: { tenantId, deletedAt: null } as any }),
      this.campaignRepo.count({ where: { tenantId, status: 'running', deletedAt: null } as any }),
    ])

    const deliveryStats = await this.deliveryRepo
      .createQueryBuilder('d')
      .select([
        'COUNT(*) FILTER (WHERE d.status = \'sent\' OR d.status = \'delivered\' OR d.status = \'opened\' OR d.status = \'clicked\') AS sent',
        'COUNT(*) FILTER (WHERE d.status = \'delivered\' OR d.status = \'opened\' OR d.status = \'clicked\') AS delivered',
        'COUNT(*) FILTER (WHERE d.status = \'opened\' OR d.status = \'clicked\') AS opened',
        'COUNT(*) FILTER (WHERE d.status = \'clicked\') AS clicked',
        'COUNT(*) AS total',
      ])
      .where('d.tenant_id = :tenantId', { tenantId })
      .getRawOne<{ sent: string; delivered: string; opened: string; clicked: string; total: string }>()

    const sent = parseInt(deliveryStats?.sent ?? '0', 10)
    const delivered = parseInt(deliveryStats?.delivered ?? '0', 10)
    const opened = parseInt(deliveryStats?.opened ?? '0', 10)
    const clicked = parseInt(deliveryStats?.clicked ?? '0', 10)

    const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100 * 10) / 10 : 0
    const openRate = delivered > 0 ? Math.round((opened / delivered) * 100 * 10) / 10 : 0
    const clickRate = opened > 0 ? Math.round((clicked / opened) * 100 * 10) / 10 : 0

    return { totalCampaigns, activeCampaigns, deliveryRate, openRate, clickRate }
  }
}
