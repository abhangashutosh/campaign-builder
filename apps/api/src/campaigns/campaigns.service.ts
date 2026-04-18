import { Injectable, BadRequestException } from '@nestjs/common'
import { CampaignsRepository } from './campaigns.repository'
import { Campaign } from './entities/campaign.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DeliveryEvent } from './entities/delivery-event.entity'

@Injectable()
export class CampaignsService {
  constructor(
    private readonly repo: CampaignsRepository,
    @InjectRepository(DeliveryEvent)
    private readonly deliveryEventRepo: Repository<DeliveryEvent>,
  ) {}

  async findAll(tenantId: string): Promise<Campaign[]> {
    return this.repo.findAll(tenantId)
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
    const campaign = await this.repo.findOneOrFail(tenantId, id)
    const checks: { name: string; points: number; passed: boolean; type: 'blocker' | 'warning' }[] = [
      { name: 'Campaign has name', points: 10, passed: !!campaign.name, type: 'warning' },
      { name: 'At least one channel', points: 15, passed: campaign.channels.length > 0, type: 'blocker' },
      { name: 'Segment assigned', points: 15, passed: campaign.type === 'transactional' || !!campaign.audienceSegmentId, type: 'blocker' },
      { name: 'Template assigned', points: 15, passed: !!campaign.templateId, type: 'blocker' },
      { name: 'Channel config active', points: 15, passed: true, type: 'blocker' },
      { name: 'Template approved', points: 10, passed: false, type: 'warning' },
      { name: 'Segment estimate > 0', points: 10, passed: false, type: 'warning' },
      { name: 'Subject line (email)', points: 10, passed: !campaign.channels.includes('email') || true, type: 'warning' },
    ]
    const score = checks.filter((c) => c.passed).reduce((sum, c) => sum + c.points, 0)
    const blockers = checks.filter((c) => !c.passed && c.type === 'blocker').map((c) => c.name)
    const warnings = checks.filter((c) => !c.passed && c.type === 'warning').map((c) => c.name)
    return { score, ready: score >= 80 && blockers.length === 0, blockers, warnings, checks }
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
