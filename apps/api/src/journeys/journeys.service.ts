import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Journey } from './entities/journey.entity'

@Injectable()
export class JourneysService {
  constructor(
    @InjectRepository(Journey)
    private readonly repo: Repository<Journey>,
  ) {}

  async findAll(tenantId: string): Promise<Journey[]> {
    return this.repo.find({ where: { tenantId, deletedAt: null } as any })
  }

  async findOne(tenantId: string, id: string): Promise<Journey | null> {
    return this.repo.findOne({ where: { id, tenantId, deletedAt: null } as any })
  }

  async create(tenantId: string, data: Partial<Journey>): Promise<Journey> {
    const journey = this.repo.create({ ...data, tenantId, status: 'draft' })
    return this.repo.save(journey)
  }

  async update(tenantId: string, id: string, data: Partial<Journey>): Promise<Journey | null> {
    const journey = await this.findOne(tenantId, id)
    if (!journey) return null
    Object.assign(journey, data)
    await this.repo.save(journey)
    return this.findOne(tenantId, id)
  }
}
