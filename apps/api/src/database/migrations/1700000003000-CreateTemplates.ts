import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTemplates1700000003000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('email','whatsapp')),
        channel TEXT,
        subject TEXT,
        preheader TEXT,
        html_body TEXT,
        text_body TEXT,
        variables TEXT[] NOT NULL DEFAULT '{}',
        approval_status TEXT NOT NULL CHECK (approval_status IN ('draft','pending','approved','rejected')) DEFAULT 'draft',
        category TEXT NOT NULL CHECK (category IN ('marketing','transactional')) DEFAULT 'marketing',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_templates_tenant_type ON templates (tenant_id, type) WHERE deleted_at IS NULL`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE templates`)
  }
}
