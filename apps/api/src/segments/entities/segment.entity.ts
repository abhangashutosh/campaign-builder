import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'
import { SegmentRules } from '@campaign/shared'

@Entity('segments')
export class Segment {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column()
  name!: string

  @Column({ type: 'jsonb', default: { include: [], exclude: [] } })
  rules!: SegmentRules

  @Column({ name: 'audience_estimate', nullable: true })
  audienceEstimate?: number

  @Column({ name: 'refresh_cadence', default: 'on_demand' })
  refreshCadence!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
