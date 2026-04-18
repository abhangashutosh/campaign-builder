import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Segment } from '../../segments/entities/segment.entity'
import { Template } from '../../templates/entities/template.entity'
import { CampaignMetadata, UtmParams, AbTestConfig } from '@campaign/shared'

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  description?: string

  @Column({ default: 'default' })
  workspace!: string

  @Column({ nullable: true })
  folder?: string

  @Column()
  type!: string

  @Column({ default: 'draft' })
  status!: string

  @Column({ type: 'text', array: true, default: [] })
  channels!: string[]

  @Column({ name: 'audience_segment_id', nullable: true })
  audienceSegmentId?: string

  @ManyToOne(() => Segment, { nullable: true })
  @JoinColumn({ name: 'audience_segment_id' })
  segment?: Segment

  @Column({ name: 'template_id', nullable: true })
  templateId?: string

  @ManyToOne(() => Template, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template?: Template

  @Column({ name: 'scheduled_for', nullable: true })
  scheduledFor?: Date

  @Column({ type: 'text', array: true, default: [] })
  tags!: string[]

  @Column({ name: 'created_by' })
  createdBy!: string

  @Column({ default: 1 })
  version!: number

  @Column({ name: 'ab_test_enabled', default: false })
  abTestEnabled!: boolean

  @Column({ name: 'ab_test_config', type: 'jsonb', default: {} })
  abTestConfig!: AbTestConfig

  @Column({ name: 'utm_params', type: 'jsonb', default: {} })
  utmParams!: UtmParams

  @Column({ type: 'jsonb', default: {} })
  metadata!: CampaignMetadata

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
