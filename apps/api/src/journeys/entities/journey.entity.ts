import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'
import { JourneyNode } from '@campaign/shared'

@Entity('journeys')
export class Journey {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column()
  name!: string

  @Column({ default: 'draft' })
  status!: string

  @Column({ type: 'jsonb', default: [] })
  nodes!: JourneyNode[]

  @Column({ name: 'entry_trigger', type: 'jsonb', default: {} })
  entryTrigger!: Record<string, unknown>

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
