import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Segment } from './entities/segment.entity'
import { TenantScopedRepository } from '../common/repositories/tenant-scoped.repository'

@Injectable()
export class SegmentsRepository extends TenantScopedRepository<Segment> {
  protected repo: Repository<Segment>

  constructor(
    @InjectRepository(Segment)
    repo: Repository<Segment>,
  ) {
    super()
    this.repo = repo
  }

  async create(tenantId: string, data: Partial<Segment>): Promise<Segment> {
    this.assertTenant(tenantId)
    const segment = this.repo.create({ ...data, tenantId })
    return this.repo.save(segment)
  }

  async update(tenantId: string, id: string, data: Partial<Segment>): Promise<Segment> {
    const segment = await this.findOneOrFail(tenantId, id)
    Object.assign(segment, data)
    return this.repo.save(segment)
  }
}
