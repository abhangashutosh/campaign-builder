import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm'

@Entity('contacts')
@Index(['tenantId'], { where: '"deleted_at" IS NULL' })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column({ name: 'external_id' })
  externalId!: string

  @Column({ name: 'first_name', nullable: true })
  firstName?: string

  @Column({ name: 'last_name', nullable: true })
  lastName?: string

  @Column({ nullable: true })
  email?: string

  @Column({ nullable: true })
  phone?: string

  @Column({ type: 'jsonb', default: {} })
  attributes!: Record<string, unknown>

  @Column({ name: 'consent_email', nullable: true })
  consentEmail?: boolean

  @Column({ name: 'consent_whatsapp', nullable: true })
  consentWhatsapp?: boolean

  @Column({ name: 'lifecycle_stage', default: 'subscriber' })
  lifecycleStage!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
