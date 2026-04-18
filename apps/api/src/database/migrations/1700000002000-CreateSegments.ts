import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSegments1700000002000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        rules JSONB NOT NULL DEFAULT '{"include":[],"exclude":[]}',
        audience_estimate INT,
        refresh_cadence TEXT NOT NULL DEFAULT 'on_demand',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_segments_tenant ON segments (tenant_id) WHERE deleted_at IS NULL`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE segments`)
  }
}
