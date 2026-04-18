import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('channel_configs')
export class ChannelConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column()
  channel!: string

  @Column()
  provider!: string

  @Column({ type: 'bytea' })
  credentials!: Buffer

  @Column({ name: 'is_active', default: false })
  isActive!: boolean

  @Column({ name: 'health_status', default: 'unknown' })
  healthStatus!: string

  @Column({ name: 'last_checked_at', nullable: true })
  lastCheckedAt?: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
