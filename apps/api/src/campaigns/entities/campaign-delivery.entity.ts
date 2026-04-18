import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Campaign } from './campaign.entity'
import { Contact } from '../../contacts/entities/contact.entity'

@Entity('campaign_deliveries')
export class CampaignDelivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column({ name: 'campaign_id' })
  campaignId!: string

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign

  @Column({ name: 'contact_id' })
  contactId!: string

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact!: Contact

  @Column()
  channel!: string

  @Column({ default: 'queued' })
  status!: string

  @Column({ name: 'sent_at', nullable: true })
  sentAt?: Date

  @Column({ name: 'error_reason', nullable: true })
  errorReason?: string

  @Column({ name: 'provider_msg_id', nullable: true })
  providerMsgId?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
