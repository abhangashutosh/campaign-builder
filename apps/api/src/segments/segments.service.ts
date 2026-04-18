import { Injectable } from '@nestjs/common'
import { SegmentsRepository } from './segments.repository'
import { Segment } from './entities/segment.entity'
import { SegmentRules } from '@campaign/shared'

@Injectable()
export class SegmentsService {
  constructor(private readonly repo: SegmentsRepository) {}

  async findAll(tenantId: string): Promise<Segment[]> {
    return this.repo.findAll(tenantId)
  }

  async findOne(tenantId: string, id: string): Promise<Segment> {
    return this.repo.findOneOrFail(tenantId, id)
  }

  async create(tenantId: string, data: { name: string; rules?: SegmentRules }): Promise<Segment> {
    return this.repo.create(tenantId, {
      name: data.name,
      rules: data.rules || { include: [], exclude: [] },
    })
  }

  async update(tenantId: string, id: string, data: Partial<Segment>): Promise<Segment> {
    return this.repo.update(tenantId, id, data)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    return this.repo.softDelete(tenantId, id)
  }

  async estimate(tenantId: string, id: string): Promise<{ total: number; emailReachable: number; whatsappReachable: number }> {
    const segment = await this.findOne(tenantId, id)
    const estimate = segment.audienceEstimate || 0
    return {
      total: estimate,
      emailReachable: Math.floor(estimate * 0.8),
      whatsappReachable: Math.floor(estimate * 0.6),
    }
  }
}
