import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDeliveryEvents1700000008000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE delivery_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        delivery_id UUID NOT NULL REFERENCES campaign_deliveries(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        metadata JSONB NOT NULL DEFAULT '{}'
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_delivery_events_delivery ON delivery_events (delivery_id)`)
    await queryRunner.query(`CREATE INDEX idx_delivery_events_tenant_type ON delivery_events (tenant_id, event_type, occurred_at DESC)`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE delivery_events`)
  }
}
