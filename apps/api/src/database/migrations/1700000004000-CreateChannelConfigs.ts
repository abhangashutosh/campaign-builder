import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateChannelConfigs1700000004000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE channel_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        channel TEXT NOT NULL CHECK (channel IN ('email','whatsapp')),
        provider TEXT NOT NULL,
        credentials BYTEA NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT false,
        health_status TEXT NOT NULL CHECK (health_status IN ('healthy','degraded','down','unknown')) DEFAULT 'unknown',
        last_checked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_channel_configs_tenant_channel UNIQUE (tenant_id, channel)
      )
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE channel_configs`)
  }
}
