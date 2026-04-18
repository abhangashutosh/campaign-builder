import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Journey } from './entities/journey.entity'
import { JourneyNode } from '@campaign/shared'

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

  async findOneOrFail(tenantId: string, id: string): Promise<Journey> {
    const journey = await this.findOne(tenantId, id)
    if (!journey) throw new NotFoundException(`Journey ${id} not found`)
    return journey
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

  async publish(tenantId: string, id: string): Promise<Journey> {
    const journey = await this.findOneOrFail(tenantId, id)

    if (this.hasCycle(journey.nodes)) {
      throw new UnprocessableEntityException('Journey contains a cycle')
    }

    const hasTrigger = journey.nodes.some((n) => n.type === 'trigger')
    if (!hasTrigger) {
      throw new UnprocessableEntityException('Journey must have an entry trigger node')
    }

    journey.status = 'active'
    return this.repo.save(journey)
  }

  /**
   * DFS-based cycle detection on the journey node graph.
   * Each node has `next: string[]` listing IDs of successor nodes.
   */
  private hasCycle(nodes: JourneyNode[]): boolean {
    const adjacency = new Map<string, string[]>()
    for (const node of nodes) {
      adjacency.set(node.id, node.next ?? [])
    }

    const WHITE = 0, GRAY = 1, BLACK = 2
    const color = new Map<string, number>()
    for (const node of nodes) color.set(node.id, WHITE)

    const dfs = (nodeId: string): boolean => {
      color.set(nodeId, GRAY)
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        if (color.get(neighbor) === GRAY) return true   // back edge → cycle
        if (color.get(neighbor) === WHITE && dfs(neighbor)) return true
      }
      color.set(nodeId, BLACK)
      return false
    }

    for (const node of nodes) {
      if (color.get(node.id) === WHITE && dfs(node.id)) return true
    }
    return false
  }
}
