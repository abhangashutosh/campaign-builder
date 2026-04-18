import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateContacts1700000001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        external_id TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        attributes JSONB NOT NULL DEFAULT '{}',
        consent_email BOOLEAN,
        consent_whatsapp BOOLEAN,
        lifecycle_stage TEXT NOT NULL DEFAULT 'subscriber',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ,
        CONSTRAINT uq_contacts_tenant_external UNIQUE (tenant_id, external_id)
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_contacts_tenant ON contacts (tenant_id) WHERE deleted_at IS NULL`)
    await queryRunner.query(`CREATE INDEX idx_contacts_attributes ON contacts USING gin (attributes)`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE contacts`)
  }
}
