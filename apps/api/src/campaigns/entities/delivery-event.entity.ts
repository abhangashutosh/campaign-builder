import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { CampaignDelivery } from './campaign-delivery.entity'

@Entity('delivery_events')
export class DeliveryEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column({ name: 'delivery_id' })
  deliveryId!: string

  @ManyToOne(() => CampaignDelivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_id' })
  delivery!: CampaignDelivery

  @Column({ name: 'event_type' })
  eventType!: string

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt!: Date

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>
}
