import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCampaigns1700000005000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        workspace TEXT NOT NULL DEFAULT 'default',
        folder TEXT,
        type TEXT NOT NULL CHECK (type IN ('one_time','scheduled','recurring','triggered','transactional','journey','api_triggered')),
        status TEXT NOT NULL CHECK (status IN ('draft','scheduled','running','paused','completed','failed','needs_review')) DEFAULT 'draft',
        channels TEXT[] NOT NULL DEFAULT '{}',
        audience_segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
        template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
        scheduled_for TIMESTAMPTZ,
        tags TEXT[] NOT NULL DEFAULT '{}',
        created_by TEXT NOT NULL,
        version INT NOT NULL DEFAULT 1,
        ab_test_enabled BOOLEAN NOT NULL DEFAULT false,
        ab_test_config JSONB NOT NULL DEFAULT '{}',
        utm_params JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_campaigns_tenant_status ON campaigns (tenant_id, status) WHERE deleted_at IS NULL`)
    await queryRunner.query(`CREATE INDEX idx_campaigns_scheduled ON campaigns (scheduled_for) WHERE status = 'scheduled'`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE campaigns`)
  }
}
