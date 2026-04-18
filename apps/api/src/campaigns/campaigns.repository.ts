import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Campaign } from './entities/campaign.entity'
import { TenantScopedRepository } from '../common/repositories/tenant-scoped.repository'

@Injectable()
export class CampaignsRepository extends TenantScopedRepository<Campaign> {
  protected repo: Repository<Campaign>

  constructor(
    @InjectRepository(Campaign)
    repo: Repository<Campaign>,
  ) {
    super()
    this.repo = repo
  }

  async create(tenantId: string, data: Partial<Campaign>): Promise<Campaign> {
    this.assertTenant(tenantId)
    const campaign = this.repo.create({ ...data, tenantId })
    return this.repo.save(campaign)
  }

  async update(tenantId: string, id: string, data: Partial<Campaign>): Promise<Campaign> {
    const campaign = await this.findOneOrFail(tenantId, id)
    Object.assign(campaign, data)
    return this.repo.save(campaign)
  }

  async findWithRelations(tenantId: string, id: string): Promise<Campaign> {
    this.assertTenant(tenantId)
    const campaign = await this.repo.findOne({
      where: { id, tenantId, deletedAt: null } as any,
      relations: ['segment', 'template'],
    })
    if (!campaign) throw new NotFoundException(`Resource ${id} not found`)
    return campaign
  }

  async findAllWithRelations(tenantId: string): Promise<Campaign[]> {
    this.assertTenant(tenantId)
    return this.repo.find({
      where: { tenantId, deletedAt: null } as any,
      relations: ['segment', 'template'],
      order: { createdAt: 'DESC' },
    })
  }
}
