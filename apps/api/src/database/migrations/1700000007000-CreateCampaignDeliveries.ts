import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCampaignDeliveries1700000007000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE campaign_deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        channel TEXT NOT NULL CHECK (channel IN ('email','whatsapp')),
        status TEXT NOT NULL CHECK (status IN ('queued','sent','delivered','opened','clicked','replied','bounced','failed')) DEFAULT 'queued',
        sent_at TIMESTAMPTZ,
        error_reason TEXT,
        provider_msg_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_deliveries_campaign_contact_channel UNIQUE (campaign_id, contact_id, channel)
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_deliveries_tenant_status ON campaign_deliveries (tenant_id, status)`)
    await queryRunner.query(`CREATE INDEX idx_deliveries_campaign ON campaign_deliveries (campaign_id)`)
    await queryRunner.query(`CREATE INDEX idx_deliveries_contact ON campaign_deliveries (contact_id)`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE campaign_deliveries`)
  }
}
