import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tenant_id' })
  tenantId!: string

  @Column()
  name!: string

  @Column()
  type!: string

  @Column({ nullable: true })
  channel?: string

  @Column({ nullable: true })
  subject?: string

  @Column({ nullable: true })
  preheader?: string

  @Column({ name: 'html_body', type: 'text', nullable: true })
  htmlBody?: string

  @Column({ name: 'text_body', type: 'text', nullable: true })
  textBody?: string

  @Column({ type: 'text', array: true, default: [] })
  variables!: string[]

  @Column({ name: 'approval_status', default: 'draft' })
  approvalStatus!: string

  @Column({ default: 'marketing' })
  category!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
