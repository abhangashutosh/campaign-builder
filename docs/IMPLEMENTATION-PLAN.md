# Implementation Plan — Campaign Builder (Generic Engage Plugin)

## Context

**Why:** Building a generic Email + WhatsApp Campaign Builder plugin (modeled on CleverTap/Customer.io) that embeds into any SaaS product. Referenced in `project/PRD.md` and `project/design/Campaign Builder — Engage Plugin.html`. The system must be tenant-isolated, provider-swappable, and UI-embeddable.

**Intended outcome:** A fully functional monorepo (NestJS API + Next.js web + shared types) with Docker Compose dev + test environments, complete DB schema, all API endpoints, all frontend screens, and a per-step test suite. Every step produces a changelog log file in `logs/{area}/{phase}.{seq}-{slug}_DDMMYYHHSS.md` format.

**Greenfield status:** `apps/` is empty. `infra/docker-compose.yml` has Postgres + Redis. All code must be built from scratch.

---

## Architecture Snapshot

```
monorepo/
├── apps/api/          NestJS 10 — REST API, BullMQ, TypeORM, Resend
├── apps/web/          Next.js 14 App Router — 6 screens, shadcn/ui, TanStack Query
├── packages/shared/   Zod schemas + TypeScript types shared across apps
├── infra/             docker-compose.yml (dev) + docker-compose.test.yml (CI)
└── .github/workflows/ ci.yml + build-check.yml
```

**Color tokens (PRD):** Navy `#1A3C6B` · Orange `#E85D04` · Teal `#00C9A7` · BG `#F7F9FC` · Text `#0F172A`

---

## HLD — Database Schema

All tables include `tenant_id TEXT NOT NULL` — every query is scoped to this column. No cross-tenant access is possible if all repositories extend `TenantScopedRepository`.

### `contacts`
```sql
id UUID PK, tenant_id TEXT NOT NULL, external_id TEXT NOT NULL,
first_name TEXT, last_name TEXT, email TEXT, phone TEXT (E.164),
attributes JSONB DEFAULT '{}', consent_email BOOL, consent_whatsapp BOOL,
lifecycle_stage TEXT DEFAULT 'subscriber', created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ
UNIQUE(tenant_id, external_id)
INDEX: (tenant_id) WHERE deleted_at IS NULL
INDEX gin(attributes)
```

### `segments`
```sql
id UUID PK, tenant_id TEXT NOT NULL, name TEXT NOT NULL,
rules JSONB DEFAULT '{"include":[],"exclude":[]}',
  -- Shape: { include: Group[], exclude: Group[] }
  -- Group: { logic: "AND"|"OR"|"ANY", conditions: Condition[] }
  -- Condition: { field, op: "eq"|"neq"|"contains"|"gt"|"lt"|"in"|"exists", value }
audience_estimate INT, refresh_cadence TEXT DEFAULT 'on_demand',
created_at, updated_at, deleted_at
INDEX: (tenant_id) WHERE deleted_at IS NULL
```

### `templates`
```sql
id UUID PK, tenant_id TEXT NOT NULL, name TEXT NOT NULL,
type TEXT CHECK IN ('email','whatsapp'), channel TEXT,
subject TEXT, preheader TEXT, html_body TEXT, text_body TEXT,
variables TEXT[] DEFAULT '{}',
approval_status TEXT CHECK IN ('draft','pending','approved','rejected') DEFAULT 'draft',
category TEXT CHECK IN ('marketing','transactional') DEFAULT 'marketing',
created_at, updated_at, deleted_at
INDEX: (tenant_id, type) WHERE deleted_at IS NULL
```

### `channel_configs`
```sql
id UUID PK, tenant_id TEXT NOT NULL,
channel TEXT CHECK IN ('email','whatsapp'), provider TEXT,
credentials BYTEA NOT NULL,  -- AES-256-GCM encrypted JSONB, key from ENCRYPTION_KEY env
is_active BOOL DEFAULT false,
health_status TEXT CHECK IN ('healthy','degraded','down','unknown') DEFAULT 'unknown',
last_checked_at TIMESTAMPTZ
UNIQUE(tenant_id, channel)
```

### `campaigns`
```sql
id UUID PK, tenant_id TEXT NOT NULL, name TEXT NOT NULL,
type TEXT CHECK IN ('one_time','scheduled','recurring','triggered'),
status TEXT CHECK IN ('draft','scheduled','running','paused','completed','failed','needs_review') DEFAULT 'draft',
channels TEXT[] DEFAULT '{}',
audience_segment_id UUID FK segments(id) ON DELETE SET NULL,
template_id UUID FK templates(id) ON DELETE SET NULL,
scheduled_for TIMESTAMPTZ, tags TEXT[] DEFAULT '{}', created_by TEXT NOT NULL,
metadata JSONB DEFAULT '{}',  -- { frequencyCapPerDay, quietHoursStart, quietHoursEnd, quietHoursTimezone }
created_at, updated_at, deleted_at
INDEX: (tenant_id, status) WHERE deleted_at IS NULL
INDEX: (scheduled_for) WHERE status='scheduled'
```

### `journeys`
```sql
id UUID PK, tenant_id TEXT NOT NULL, name TEXT NOT NULL,
status TEXT CHECK IN ('draft','active','paused','archived') DEFAULT 'draft',
nodes JSONB DEFAULT '[]',       -- JourneyNode[]  { id, type, config, next: string[] }
entry_trigger JSONB DEFAULT '{}',
created_at, updated_at, deleted_at
```

### `campaign_deliveries`
```sql
id UUID PK, tenant_id TEXT NOT NULL,
campaign_id UUID FK campaigns(id) ON CASCADE DELETE,
contact_id UUID FK contacts(id) ON CASCADE DELETE,
channel TEXT CHECK IN ('email','whatsapp'),
status TEXT CHECK IN ('queued','sent','delivered','opened','clicked','replied','bounced','failed') DEFAULT 'queued',
sent_at TIMESTAMPTZ, error_reason TEXT, provider_msg_id TEXT,
created_at, updated_at
UNIQUE(campaign_id, contact_id, channel)
INDEX: (tenant_id, status), (campaign_id), (contact_id)
```

### `delivery_events`
```sql
id UUID PK, tenant_id TEXT NOT NULL,
delivery_id UUID FK campaign_deliveries(id) ON CASCADE DELETE,
event_type TEXT,   -- sent|delivered|opened|clicked|bounced|failed|complained
occurred_at TIMESTAMPTZ DEFAULT now(), metadata JSONB DEFAULT '{}'
INDEX: (delivery_id), (tenant_id, event_type, occurred_at DESC)
```

**Migration order (dependency-safe):**
1. contacts → 2. segments → 3. templates → 4. channel_configs → 5. campaigns → 6. journeys → 7. campaign_deliveries → 8. delivery_events

---

## Phase 0 — Monorepo + Infrastructure Foundation

**Agent:** Architect + DevOps (parallel after 0.1)
**Goal:** `make dev` starts all 5 services; `make test-infra` starts isolated test env.

### Task 0.1 — pnpm workspace + root package.json + tsconfigs
**Agent:** Architect | **Log:** `logs/infra/0.1-monorepo-workspace_DDMMYYHHSS.md`
**Skills:** workflow-ship-faster

**What to build:**
- `pnpm-workspace.yaml` declaring `apps/*`, `packages/*`
- Root `package.json` scripts: `dev`, `dev:infra`, `test`, `lint`, `build`, `type-check`
- Root `tsconfig.json`: `strict: true`, `noImplicitAny`, `strictNullChecks`, project references
- `apps/api/tsconfig.json`: `experimentalDecorators: true`, `emitDecoratorMetadata: true`, `module: commonjs`
- `apps/web/tsconfig.json`: `moduleResolution: bundler`, `jsx: preserve`, `@/*` path alias
- `packages/shared/tsconfig.json`: `composite: true`, `declaration: true`

**Acceptance criteria:**
- [ ] `tsc -b` at root exits 0
- [ ] `strict: true` confirmed in root tsconfig
- [ ] `emitDecoratorMetadata: true` in API tsconfig (NestJS DI requirement)

**Tests:** `tsc --noEmit` exits 0 across all 3 packages.
**Changelog:** `logs/infra/0.1-monorepo-workspace_DDMMYYHHSS.md`

---

### Task 0.2 — apps/api scaffold: package.json + Dockerfile.dev
**Agent:** Backend Dev | **Depends on:** 0.1 | **Log:** `logs/infra/0.2-api-scaffold_DDMMYYHHSS.md`

**What to build:**
`apps/api/package.json` with all NestJS + TypeORM + BullMQ + Resend + React Email deps.
Key deps: `@nestjs/*`, `typeorm`, `pg`, `bullmq`, `resend`, `@react-email/components`, `@react-email/render`, `class-validator`, `class-transformer`, `reflect-metadata`.
Dev deps: `@nestjs/cli`, `vitest`, `@vitest/coverage-v8`, `typescript`.
`apps/api/Dockerfile.dev`: FROM node:20-alpine, install pnpm, WORKDIR /app, EXPOSE 4000, CMD pnpm run dev.

**Acceptance criteria:**
- [ ] `docker build -f apps/api/Dockerfile.dev apps/api` exits 0
- [ ] No Jest — Vitest only
- [ ] `@react-email/render` listed alongside React peer dep

**Changelog:** `logs/infra/0.2-api-scaffold_DDMMYYHHSS.md`

---

### Task 0.3 — apps/web scaffold: package.json + Dockerfile.dev
**Agent:** Frontend Dev | **Depends on:** 0.1 | **Log:** `logs/infra/0.3-web-scaffold_DDMMYYHHSS.md`

**What to build:**
`apps/web/package.json`: next@14, react, react-dom, next-auth, @tanstack/react-query, zustand, react-hook-form, @hookform/resolvers, zod, date-fns, tailwindcss, lucide-react, @radix-ui/*, class-variance-authority, clsx, tailwind-merge.
`apps/web/Dockerfile.dev`: FROM node:20-alpine, EXPOSE 3000, CMD pnpm run dev.
`packages/shared/package.json` + `packages/shared/src/index.ts` barrel export.

**Acceptance criteria:**
- [ ] No `@mui`, `lodash`, `moment` in web package.json
- [ ] shadcn/ui is NOT an npm dep (it is a CLI copy tool)
- [ ] `@campaign/shared: workspace:*` in both api and web package.json

**Changelog:** `logs/infra/0.3-web-scaffold_DDMMYYHHSS.md`

---

### Task 0.4 — Dev Docker Compose upgrade (api + web + Adminer + Redis Commander)
**Agent:** DevOps | **Depends on:** 0.2, 0.3 | **Log:** `logs/infra/0.4-dev-compose_DDMMYYHHSS.md`

**What to build:**
Update `infra/docker-compose.yml`:
- Add bridge network `campaign_network` to all services
- Uncomment/complete Adminer on port 8080
- Add `redis-commander` (image: `rediscommander/redis-commander`) on port 8081 with `REDIS_HOSTS=local:redis:6379`
- Add `api` service under `profiles: [dev]`: build from `apps/api/Dockerfile.dev`, hot-reload volumes, `depends_on` postgres+redis healthy, EXPOSE 4000
- Add `web` service under `profiles: [dev]`: build from `apps/web/Dockerfile.dev`, hot-reload volumes, `depends_on` api healthy, EXPOSE 3000
- Create `infra/docker-compose.override.yml` stub with usage comments

**Acceptance criteria:**
- [ ] `docker compose -f infra/docker-compose.yml up -d` starts postgres, redis, adminer, redis-commander (4 services, no profile needed)
- [ ] `docker compose -f infra/docker-compose.yml --profile dev up` starts all 6 services
- [ ] Adminer at localhost:8080, Redis Commander at localhost:8081
- [ ] All services have healthchecks with `depends_on` conditions
- [ ] `.gitignore` includes `infra/docker-compose.local.yml`

**Changelog:** `logs/infra/0.4-dev-compose_DDMMYYHHSS.md`

---

### Task 0.5 — Test Docker Compose (isolated, ephemeral)
**Agent:** DevOps | **Depends on:** 0.4 | **Log:** `logs/infra/0.5-test-compose_DDMMYYHHSS.md`

**What to build:**
Create `infra/docker-compose.test.yml`:
- `postgres_test` on port 5433 (no volumes, ephemeral), DB name `campaign_test`
- `redis_test` on port 6380 (no volumes)
- Separate bridge network `campaign_test_network`
- `migrate_test` one-shot service: runs TypeORM migrations against `postgres_test`, exits 0
- `infra/scripts/init-test-db.sh` mounted to postgres init dir
- Create `.env.test` with test-safe values (DATABASE_URL port 5433, REDIS_URL port 6380)

**Acceptance criteria:**
- [ ] `docker compose -f infra/docker-compose.test.yml up -d` starts 3 containers (postgres_test, redis_test, migrate_test)
- [ ] `migrate_test` exits 0 after running migrations
- [ ] Dev and test environments can coexist without port conflicts
- [ ] `docker compose -f infra/docker-compose.test.yml down` leaves no named volumes

**Changelog:** `logs/infra/0.5-test-compose_DDMMYYHHSS.md`

---

### Task 0.6 — Makefile + GitHub Actions CI
**Agent:** DevOps | **Depends on:** 0.4, 0.5 | **Log:** `logs/infra/0.6-makefile-ci_DDMMYYHHSS.md`

**What to build:**
Makefile targets: `dev`, `dev-infra`, `test`, `test-infra`, `test-down`, `migrate`, `migrate-test`, `seed`, `clean`, `logs-api`, `logs-web`.
`.github/workflows/ci.yml`: pnpm install → start test infra → wait for healthcheck → migrate-test → type-check → lint → backend tests → frontend tests → always: test-down.
`.github/workflows/build-check.yml`: push to main only → build api → build web.

**Acceptance criteria:**
- [ ] `make help` lists all targets
- [ ] `make test` chains: test-infra → migrate-test → vitest api → vitest web → test-down
- [ ] CI uses `pnpm install --frozen-lockfile`
- [ ] `if: always()` on test-down step

**Changelog:** `logs/infra/0.6-makefile-ci_DDMMYYHHSS.md`

---

## Phase 1 — NestJS Foundation + DB Schema

**Agent:** Backend Dev
**Goal:** NestJS bootstrapped with config, JWT guard, tenant interceptor, health check, all 8 TypeORM entities, and all 8 migrations runnable.

### Task 1.1 — NestJS bootstrap + global config + JWT guard
**Log:** `logs/backend/1.1-api-bootstrap_DDMMYYHHSS.md`
**Skills:** workflow-ship-faster, backend-patterns, security-review

**Files:**
- `apps/api/src/main.ts` — bootstrap with helmet, compression, global validation pipe (whitelist, forbidNonWhitelisted), global HTTP exception filter
- `apps/api/src/common/config/*.config.ts` — @nestjs/config with Joi validation, startup error if required var missing
- `apps/api/src/common/guards/jwt-auth.guard.ts` — Passport JWT AuthGuard
- `apps/api/src/common/guards/roles.guard.ts` — reads roles from JWT claim
- `apps/api/src/common/decorators/tenant.decorator.ts` — @TenantId() param decorator
- `apps/api/src/common/interceptors/tenant-context.interceptor.ts` — AsyncLocalStorage per request
- `apps/api/src/common/filters/http-exception.filter.ts` — returns `{ code, message, statusCode, traceId }`
- `apps/api/src/health/health.controller.ts` — GET /api/v1/health → checks DB + Redis

**Acceptance criteria:**
- [ ] `GET /api/v1/health` returns 200 `{ status: "ok", checks: { db, redis } }`
- [ ] Protected endpoint returns 401 without JWT, 403 with wrong role
- [ ] Removing `DATABASE_URL` from env causes startup failure with exact var name in error
- [ ] All responses have `traceId` UUID in error shape

**Tests (unit):**
- `jwt-auth.guard.spec.ts`: valid token passes, missing token throws 401, expired token throws 401
- `roles.guard.spec.ts`: correct role passes, wrong role throws 403
- `http-exception.filter.spec.ts`: error shape contains code, message, statusCode, traceId

**Changelog:** `logs/backend/1.1-api-bootstrap_DDMMYYHHSS.md`

---

### Task 1.2 — TypeORM entities + migrations (contacts, segments, templates, channel_configs)
**Log:** `logs/backend/1.2-entities-group1_DDMMYYHHSS.md`
**Skills:** workflow-ship-faster, backend-patterns

**Files:**
- `apps/api/src/contacts/entities/contact.entity.ts`
- `apps/api/src/segments/entities/segment.entity.ts` (with `SegmentRules` JSONB interface)
- `apps/api/src/templates/entities/template.entity.ts`
- `apps/api/src/settings/entities/channel-config.entity.ts` (credentials as `bytea` Buffer)
- `apps/api/src/database/migrations/1700000001-CreateContacts.ts`
- `apps/api/src/database/migrations/1700000002-CreateSegments.ts`
- `apps/api/src/database/migrations/1700000003-CreateTemplates.ts`
- `apps/api/src/database/migrations/1700000004-CreateChannelConfigs.ts`
- `apps/api/src/database/data-source.ts`

**Acceptance criteria:**
- [ ] `typeorm migration:run` applies all 4 migrations without error
- [ ] `typeorm migration:revert` ×4 rolls back cleanly
- [ ] TypeScript strict compile passes on all entity files (no `any`)
- [ ] `SegmentRules` interface typed: `{ include: SegmentGroup[], exclude: SegmentGroup[] }`

**Tests:**
- Migration up → check tables/indexes exist via pg query
- Migration down → check tables are dropped

**Changelog:** `logs/backend/1.2-entities-group1_DDMMYYHHSS.md`

---

### Task 1.3 — TypeORM entities + migrations (campaigns, journeys, deliveries, events)
**Log:** `logs/backend/1.3-entities-group2_DDMMYYHHSS.md`

**Files:**
- `apps/api/src/campaigns/entities/campaign.entity.ts` (with `CampaignMetadata` JSONB interface)
- `apps/api/src/journeys/entities/journey.entity.ts` (with `JourneyNode[]` interface)
- `apps/api/src/campaigns/entities/campaign-delivery.entity.ts`
- `apps/api/src/campaigns/entities/delivery-event.entity.ts`
- Migrations 5–8 in order

**Acceptance criteria:**
- [ ] All 8 migrations run cleanly in sequence
- [ ] FK constraints verified: delivery cascade-deletes on campaign delete
- [ ] `UNIQUE(campaign_id, contact_id, channel)` on `campaign_deliveries`
- [ ] `CampaignMetadata` interface: `{ frequencyCapPerDay?, quietHoursStart?, quietHoursEnd?, quietHoursTimezone? }`

**Tests:** Full migration run + rollback cycle on test DB.
**Changelog:** `logs/backend/1.3-entities-group2_DDMMYYHHSS.md`

---

### Task 1.4 — TenantScopedRepository base class
**Log:** `logs/backend/1.4-tenant-scoped-repo_DDMMYYHHSS.md`
**Skills:** security-review

**File:** `apps/api/src/common/repositories/tenant-scoped.repository.ts`

Abstract base: `findAll(tenantId, opts?)`, `findOne(tenantId, id)`, `create(tenantId, data)`, `update(tenantId, id, data)`, `softDelete(tenantId, id)`. All methods call `assertTenant(tenantId)` — throws if empty. Every `find*` injects `where: { tenantId }`.

**Acceptance criteria:**
- [ ] Calling any method with empty string tenantId throws
- [ ] Integration test: tenant A data not returned for tenant B query
- [ ] No raw `this.repo.find()` without tenant filter (ESLint custom rule)

**Tests (integration, test DB):**
- Insert contacts for tenant-A and tenant-B → `findAll('tenant-A')` returns only tenant-A rows
- `findOne('tenant-A', tenant-B-id)` throws EntityNotFoundError

**Changelog:** `logs/backend/1.4-tenant-scoped-repo_DDMMYYHHSS.md`

---

## Phase 2 — Contacts + Segments Modules

### Task 2.1 — Contacts module: repository, service, controller, DTOs
**Log:** `logs/backend/2.1-contacts-module_DDMMYYHHSS.md`
**Skills:** workflow-ship-faster, backend-patterns, tdd-workflow

**Files:**
- `apps/api/src/contacts/contacts.repository.ts` — extends TenantScopedRepository
  - `bulkUpsert(tenantId, dtos)`: `INSERT ... ON CONFLICT (tenant_id, external_id) DO UPDATE`
  - `findByIds(tenantId, ids[])`: batch lookup
- `apps/api/src/contacts/contacts.service.ts`
- `apps/api/src/contacts/contacts.controller.ts`
- `apps/api/src/contacts/dto/bulk-upsert-contacts.dto.ts` — `@ArrayMaxSize(500)`, `@IsEmail()`, phone `@Matches(E.164)`
- `apps/api/src/contacts/dto/update-consent.dto.ts`

**Endpoints:**
```
POST  /api/v1/contacts           bulk upsert, max 500
GET   /api/v1/contacts           cursor-paginated, ?segment_id filter
PATCH /api/v1/contacts/:id/consent
```

**Acceptance criteria:**
- [ ] POST with 501 items → 400 `"contacts must contain at most 500 elements"`
- [ ] POST twice with same external_id → no duplicate rows (idempotent upsert)
- [ ] GET returns only calling tenant's contacts

**Tests:**
- Unit: bulkUpsert deduplicates on (tenant_id, external_id)
- Unit: DTO rejects invalid email format
- Integration: POST 10 contacts, GET returns 10, POST same 10 → still 10

**Changelog:** `logs/backend/2.1-contacts-module_DDMMYYHHSS.md`

---

### Task 2.2 — SegmentEvaluator: rules → SQL WHERE
**Log:** `logs/backend/2.2-segment-evaluator_DDMMYYHHSS.md`
**Skills:** workflow-ship-faster, tdd-workflow

**File:** `apps/api/src/segments/segment-evaluator/segment-evaluator.service.ts`

Converts `SegmentRules` JSONB → TypeORM `SelectQueryBuilder` `WHERE` clause against `contacts` table. Operator mapping: `eq→=`, `neq→<>`, `contains→ILIKE`, `gt→>`, `lt→<`, `in→=ANY()`, `exists→IS NOT NULL`. Field paths: top-level columns directly; `attributes.{key}` → `contacts.attributes->>'key'`. INCLUDE groups joined by `UNION`, EXCLUDE groups as `EXCEPT`.

**Acceptance criteria:**
- [ ] `{ include: [{ logic: "AND", conditions: [{ field: "lifecycle_stage", op: "eq", value: "customer" }] }] }` → SQL includes `lifecycle_stage = $2` with `tenant_id = $1`
- [ ] `attributes.plan` field → SQL `attributes->>'plan' = $2`
- [ ] Unknown operator throws `InvalidSegmentOperatorError`
- [ ] Empty rules returns all contacts for tenant

**Tests (unit — 8 cases):**
- eq on top-level field
- eq on JSONB attribute field
- in operator with array value
- exists operator (no value)
- AND logic across two conditions
- OR logic
- EXCLUDE group removes contacts
- Empty rules → match all

**Changelog:** `logs/backend/2.2-segment-evaluator_DDMMYYHHSS.md`

---

### Task 2.3 — Segments module: repository, service, controller, DTOs
**Log:** `logs/backend/2.3-segments-module_DDMMYYHHSS.md`

**Files:**
- `apps/api/src/segments/segments.repository.ts`
- `apps/api/src/segments/segments.service.ts`
  - `estimate(tenantId, id)` → `{ total, emailReachable, whatsappReachable }`
  - `preview(tenantId, id)` → 100 sample contacts
- `apps/api/src/segments/segments.controller.ts`
- `apps/api/src/segments/dto/create-segment.dto.ts` — `@IsSegmentRules()` custom validator

**Endpoints:**
```
POST  /api/v1/segments
GET   /api/v1/segments
GET   /api/v1/segments/:id
PATCH /api/v1/segments/:id
GET   /api/v1/segments/:id/estimate
POST  /api/v1/segments/:id/preview
```

**Acceptance criteria:**
- [ ] POST with `rules.include[0].logic = "XOR"` → 400
- [ ] GET /estimate returns `{ total: N, emailReachable: M, whatsappReachable: K }`
- [ ] POST /preview returns max 100 contacts

**Tests:**
- Unit: estimate runs two sub-queries for consent counts
- Integration: create segment with rules, add contacts matching rules, estimate returns correct count

**Changelog:** `logs/backend/2.3-segments-module_DDMMYYHHSS.md`

---

## Phase 3 — Templates + Channel Integrations

### Task 3.1 — Templates module
**Log:** `logs/backend/3.1-templates-module_DDMMYYHHSS.md`

**Files:**
- `apps/api/src/templates/templates.service.ts`
  - Auto-extract variables via regex `/\{\{\s*(\w+)\s*\}\}/g` on save
  - `validate(id, sampleVars)` → `{ valid, missing[], extra[] }`
- `apps/api/src/templates/templates.controller.ts`
- DTOs for create/update/validate

**Endpoints:**
```
POST  /api/v1/templates
GET   /api/v1/templates  ?channel=email|whatsapp&category=marketing
GET   /api/v1/templates/:id
PATCH /api/v1/templates/:id
POST  /api/v1/templates/:id/validate
```

**Tests:**
- Template body `"Hello {{ first_name }}, plan: {{ plan }}"` → `variables = ['first_name', 'plan']`
- Validate with all vars present → `{ valid: true, missing: [], extra: [] }`
- Validate missing var → `{ valid: false, missing: ['plan'] }`

**Changelog:** `logs/backend/3.1-templates-module_DDMMYYHHSS.md`

---

### Task 3.2 — Email channel: Resend integration + React Email template
**Log:** `logs/backend/3.2-email-channel_DDMMYYHHSS.md`
**Skills:** security-review

**Files:**
- `apps/api/src/channels/email/email.service.ts` — wraps Resend SDK
- `apps/api/src/channels/email/templates/campaign-email.tsx` — React Email component
  - Props: `{ recipientName, subject, preheader, ctaUrl, ctaLabel, unsubscribeUrl }`
  - **CRITICAL:** bodyHtml is NEVER from user input; dynamic values are React props (HTML-escaped by React)
- `apps/api/src/channels/email/email.types.ts`

**Retry policy (in BullMQ processor, not service):** 4xx → fail immediately, no retry. 5xx → BullMQ exponential backoff ×3 (1s, 5s, 25s) then mark failed.

**Acceptance criteria:**
- [ ] `render()` produces HTML string; never interpolates raw user HTML
- [ ] Resend 4xx → throws `EmailSendError` with `retryable: false`
- [ ] `unsubscribeUrl` always included in rendered output

**Tests:**
- Mock Resend 200 → messageId returned
- Mock Resend 500 × 3 then 200 → 3 retry log entries, then sent
- Mock Resend 400 → fails immediately, no retry

**Changelog:** `logs/backend/3.2-email-channel_DDMMYYHHSS.md`

---

### Task 3.3 — WhatsApp channel stub + ChannelConfig encryption
**Log:** `logs/backend/3.3-whatsapp-channel-encryption_DDMMYYHHSS.md`
**Skills:** security-review

**Files:**
- `apps/api/src/channels/whatsapp/whatsapp.service.ts` — implements `IWhatsAppProvider` interface; factory pattern for provider selection
- `apps/api/src/settings/settings.service.ts` — AES-256-GCM encrypt/decrypt for credentials BYTEA

**Encryption spec:** `encrypt(plaintext): Buffer = concat(12-byte random IV, 16-byte authTag, ciphertext)`. Decrypt splits the buffer. Key = `ENCRYPTION_KEY` env (32 bytes / 64 hex chars).

**Acceptance criteria:**
- [ ] Encrypt + decrypt round-trip produces original string
- [ ] Different IVs for same plaintext
- [ ] `GET /settings/channels/email` response omits credentials field
- [ ] WhatsApp factory: unknown provider throws `UnsupportedProviderError`

**Tests:**
- AES round-trip
- Different IVs per call
- Factory resolves `meta_cloud_api` correctly
- Factory unknown provider throws

**Changelog:** `logs/backend/3.3-whatsapp-channel-encryption_DDMMYYHHSS.md`

---

## Phase 4 — BullMQ Queue Architecture

### Task 4.1 — Queue module setup + processors
**Log:** `logs/backend/4.1-queue-setup_DDMMYYHHSS.md`
**Skills:** workflow-ship-faster, backend-patterns

**Files:**
- `apps/api/src/queue/queue.module.ts` — BullModule.forRootAsync, 3 queues: CAMPAIGN_DISPATCH, EMAIL_SEND, WHATSAPP_SEND
- `apps/api/src/queue/queue.constants.ts` — queue name enums
- `apps/api/src/queue/processors/campaign-dispatch.processor.ts`
  1. Load campaign+segment+template (assert tenantId on each)
  2. Resolve contacts via SegmentEvaluatorService
  3. Apply frequency cap (check last 24h deliveries per contact)
  4. Apply quiet hours (delay job if in quiet window)
  5. Batch 100 contacts → insert delivery rows → enqueue per-delivery jobs
  6. Update campaign.status = 'running'
  - `concurrency: 1` to prevent status race conditions
- `apps/api/src/queue/processors/email-send.processor.ts`
  - Assert delivery.status = 'queued' (idempotency)
  - Call EmailService.send() → update status, set provider_msg_id, insert delivery_event
  - BullMQ options: `{ attempts: 4, backoff: { type: 'exponential', delay: 1000 } }`
- `apps/api/src/queue/processors/whatsapp-send.processor.ts` — mirrors email processor

**Acceptance criteria:**
- [ ] Dispatch job fans out N delivery jobs (one per contact × channel)
- [ ] Frequency-capped contacts get skipped (not queued)
- [ ] Job in quiet hours: delayed until quietHoursEnd
- [ ] Email job fails 3× then succeeds on 4th → status = 'sent'

**Tests:**
- Unit: dispatch processor calculates frequency cap correctly
- Unit: quiet hours deferral sets correct delay
- Integration: dispatch 5 contacts → 5 delivery rows created with status='queued'
- Integration: email send job success → delivery status='sent', delivery_event created
- Integration: email send job 3× fail → status='failed', error_reason set

**Changelog:** `logs/backend/4.1-queue-setup_DDMMYYHHSS.md`

---

## Phase 5 — Campaigns + Journeys + Settings + Overview

### Task 5.1 — CampaignReadinessValidator
**Log:** `logs/backend/5.1-campaign-readiness_DDMMYYHHSS.md`

**File:** `apps/api/src/campaigns/validators/campaign-readiness.validator.ts`

Scoring (100 points total):
| Check | Points | Blocker |
|---|---|---|
| Campaign has name | 10 | No |
| At least one channel | 15 | Yes |
| Segment assigned | 15 | Yes |
| Template assigned | 15 | Yes |
| Channel config active | 15 | Yes |
| Template approved | 10 | No (warning) |
| Segment estimate > 0 | 10 | No (warning) |
| Subject line (email) | 10 | No (warning) |

Returns: `{ score: 0-100, ready: score >= 80, warnings: Warning[], blockers: Blocker[] }`

**Tests:**
- No segment → `{ ready: false, blockers: [{ code: 'NO_SEGMENT' }] }`
- All checks pass → `{ ready: true, score: 100 }`
- Template not approved → `{ ready: true, warnings: [{ code: 'TEMPLATE_NOT_APPROVED' }] }`

**Changelog:** `logs/backend/5.1-campaign-readiness_DDMMYYHHSS.md`

---

### Task 5.2 — Campaigns module: service + controller
**Log:** `logs/backend/5.2-campaigns-module_DDMMYYHHSS.md`

**Key service methods:**
- `create(tenantId, dto, userId)` — creates draft
- `publish(tenantId, id)` — runs ReadinessValidator (throws if blockers), transitions status, enqueues dispatch job
- `pause(tenantId, id)` — status → 'paused'
- `sendTest(tenantId, id, dto)` — direct email send with [TEST] prefix, no delivery row
- `getStats(tenantId, id)` — aggregate deliveries by status
- `getReports(tenantId, id)` — time-series delivery events

**All service methods:** `findOneOrFail({ where: { id, tenantId } })` — tenant isolation guarantee.

**Endpoints:**
```
POST  /api/v1/campaigns                       @Roles('OWNER','ADMIN')
GET   /api/v1/campaigns                       ?status=&type=&channel=&cursor=&limit=
GET   /api/v1/campaigns/:id
PATCH /api/v1/campaigns/:id                   draft only
POST  /api/v1/campaigns/:id/publish           @Roles('OWNER')
POST  /api/v1/campaigns/:id/pause
POST  /api/v1/campaigns/:id/send-test
GET   /api/v1/campaigns/:id/validation
GET   /api/v1/campaigns/:id/reports
```

**Tests:**
- PATCH on running campaign → 409
- Publish with blockers → 422 with blockers array
- GET /:id with wrong tenant JWT → 404
- send-test → no delivery row in DB
- GET /reports → time-series array grouped by event_type

**Changelog:** `logs/backend/5.2-campaigns-module_DDMMYYHHSS.md`

---

### Task 5.3 — Journeys + Settings + Overview modules
**Log:** `logs/backend/5.3-journeys-settings-overview_DDMMYYHHSS.md`

**Journeys:** CRUD + publish (DAG cycle detection via DFS). Publish throws `CyclicJourneyError` if cycle detected.
**Settings:** GET/PUT channel config (encrypt on write, omit credentials on read), GET health (probe provider API, update health_status).
**Overview:** Aggregate stats (totalCampaigns, activeCampaigns, deliveryRate, openRate, clickRate) via single-pass QueryBuilder `COUNT(*) FILTER (WHERE status='sent')`.

**Tests:**
- Journey with cycle → 422 "Journey contains a cycle"
- PUT channel config → credentials encrypted in DB (bytea column)
- GET channel config → no credentials field in response
- GET /overview/stats → all values non-negative numbers

**Changelog:** `logs/backend/5.3-journeys-settings-overview_DDMMYYHHSS.md`

---

## Phase 6 — Frontend Foundation

**Agent:** Frontend Dev
**Goal:** Next.js 14 bootstrapped, design system installed, plugin shell (sidebar + header) rendering.

### Task 6.1 — Next.js init + Tailwind + shadcn/ui + design tokens
**Log:** `logs/frontend/6.1-nextjs-init_DDMMYYHHSS.md`
**Skills:** ui-intelligence, frontend-patterns

**Files:**
- `apps/web/src/app/globals.css` — CSS custom properties for all color tokens from PRD
- `apps/web/tailwind.config.ts` — extend with custom colors mapped to CSS vars
- `apps/web/src/app/layout.tsx` — root layout, TanStack Query provider, Zustand hydration
- Run `npx shadcn-ui@latest init` to install primitives (Button, Card, Badge, Table, Dialog, Select, Input, Textarea, Tabs, Sheet, Dropdown, Popover, Tooltip, Separator)
- `apps/web/src/lib/api-client.ts` — fetch wrapper with base URL from env + auth header injection

**Acceptance criteria:**
- [ ] Primary navy `#1A3C6B` available as `bg-primary` via CSS var
- [ ] All 10 shadcn primitives installed in `src/components/ui/`
- [ ] TanStack Query `QueryClientProvider` wraps app in root layout
- [ ] No glassmorphism, no neon, no gratuitous gradients in globals.css

**Changelog:** `logs/frontend/6.1-nextjs-init_DDMMYYHHSS.md`

---

### Task 6.2 — Plugin shell: Sidebar + Header + route layout
**Log:** `logs/frontend/6.2-plugin-shell_DDMMYYHHSS.md`
**Skills:** ui-intelligence, frontend-patterns

**Files:**
- `apps/web/src/app/(plugin)/layout.tsx` — plugin shell server component; slot for sidebar + header + main
- `apps/web/src/components/layout/sidebar.tsx` — 232px fixed sidebar; logo, tenant switcher, nav items with active state, usage meter (shows quota %)
- `apps/web/src/components/layout/sidebar-nav-item.tsx` — link item with icon + label + optional badge count
- `apps/web/src/components/layout/header.tsx` — 56px sticky; breadcrumbs, global search input, notifications bell, user menu
- Nav items: Overview, Audience, Templates, Campaigns (badge: active count), Journeys, Reports, Settings

**Acceptance criteria:**
- [ ] Sidebar is 232px, collapses on mobile (Sheet drawer)
- [ ] Active nav item highlighted with navy primary color
- [ ] Breadcrumbs reflect current route path
- [ ] "Enterprise B2B" aesthetic: no consumer-app styling

**Tests:**
- Sidebar renders all 7 nav items
- Active item has correct aria-current="page"
- Mobile: sidebar hidden, hamburger visible

**Changelog:** `logs/frontend/6.2-plugin-shell_DDMMYYHHSS.md`

---

### Task 6.3 — Shared component library: StatusBadge, DataTable, KPICard, EmptyState, PageHeader
**Log:** `logs/frontend/6.3-shared-components_DDMMYYHHSS.md`
**Skills:** ui-intelligence

**Files:**
- `apps/web/src/components/shared/status-badge.tsx` — chip with color by status: Draft(grey), Running(teal), Scheduled(blue), Paused(orange), Failed(red), Completed(green)
- `apps/web/src/components/shared/data-table.tsx` — TanStack Table wrapper: sortable columns, pagination, row selection, column visibility
- `apps/web/src/components/shared/kpi-card.tsx` — metric + label + trend arrow + comparison %
- `apps/web/src/components/shared/empty-state.tsx` — icon + title + description + optional CTA
- `apps/web/src/components/shared/page-header.tsx` — title + subtitle + right-slot for action buttons

**Acceptance criteria:**
- [ ] StatusBadge renders correct color for each of 7 statuses
- [ ] DataTable supports column sorting, row click, and pagination controls
- [ ] KPICard handles undefined trend gracefully
- [ ] All components TypeScript-strict, no `any`

**Tests (Vitest + @testing-library/react):**
- StatusBadge: each status renders with correct class
- DataTable: renders rows, sort click changes sort indicator
- KPICard: shows trend arrow only when trend prop provided

**Changelog:** `logs/frontend/6.3-shared-components_DDMMYYHHSS.md`

---

### Task 6.4 — TanStack Query hooks + Zustand stores
**Log:** `logs/frontend/6.4-query-hooks-stores_DDMMYYHHSS.md`

**Files:**
- `apps/web/src/hooks/use-campaigns.ts` — `useCampaigns(filters)`, `useCampaign(id)`, `useCreateCampaign()`, `usePublishCampaign()`, `usePauseCampaign()`
- `apps/web/src/hooks/use-segments.ts` — `useSegments()`, `useSegmentEstimate(id)`, `useCreateSegment()`
- `apps/web/src/hooks/use-templates.ts` — `useTemplates(channel)`, `useTemplate(id)`
- `apps/web/src/hooks/use-overview.ts` — `useOverviewStats()`, `useDeliveryHealth()`
- `apps/web/src/stores/campaign-builder.store.ts` — Zustand: multi-step state (currentStep, formData per step, validation errors)
- `apps/web/src/stores/segment-builder.store.ts` — Zustand: rules state (include/exclude groups, pending edits)

**Acceptance criteria:**
- [ ] All hooks use TanStack Query v5 `useQuery`/`useMutation` patterns
- [ ] Campaign builder store persists state across step navigation
- [ ] Cache keys are namespaced: `['campaigns', filters]`, `['segments', id, 'estimate']`
- [ ] Optimistic updates on publish mutation

**Tests:**
- Mock API → useCampaigns returns data
- Builder store: setStep advances step, formData preserved on step back

**Changelog:** `logs/frontend/6.4-query-hooks-stores_DDMMYYHHSS.md`

---

## Phase 7 — Frontend Screens

### Task 7.1 — Overview Dashboard screen
**Log:** `logs/frontend/7.1-overview-screen_DDMMYYHHSS.md`
**Skills:** ui-intelligence, frontend-patterns

**File:** `apps/web/src/app/(plugin)/overview/page.tsx` + sub-components in `src/components/overview/`

Components:
- `kpi-summary.tsx` — 4 KPICards: Sent, Delivered, Open Rate, CTR
- `engagement-trend-chart.tsx` — Recharts LineChart, 7-day rolling, 3 series (sent/delivered/opened)
- `delivery-health-panel.tsx` — channel health cards (Email: healthy/degraded, WhatsApp: healthy/down)
- `active-campaigns-table.tsx` — DataTable of next 7 days campaigns
- `top-templates-list.tsx` — ranked list with open rate

**Acceptance criteria:**
- [ ] Page uses RSC for initial data, client components only where interactivity needed
- [ ] Recharts chart is `"use client"`, wrapped in Suspense
- [ ] Delivery health cards show correct status color
- [ ] Empty state shown when no campaigns exist

**Changelog:** `logs/frontend/7.1-overview-screen_DDMMYYHHSS.md`

---

### Task 7.2 — Audience/Segments screen with rule builder
**Log:** `logs/frontend/7.2-audience-screen_DDMMYYHHSS.md`
**Skills:** ui-intelligence

**Files:**
- `apps/web/src/app/(plugin)/audience/page.tsx`
- `apps/web/src/components/segments/segment-list.tsx` — filterable DataTable
- `apps/web/src/components/segments/segment-rule-builder.tsx` — nested INCLUDE/EXCLUDE groups, AND/OR/ANY toggle, add/remove conditions, field selector, operator selector, value input
- `apps/web/src/components/segments/audience-estimate-panel.tsx` — total + emailReachable + whatsappReachable + consent breakdown
- `apps/web/src/components/segments/contact-preview-modal.tsx` — 100-row sample table

**Acceptance criteria:**
- [ ] Rule builder supports nested groups (INCLUDE with multiple conditions + EXCLUDE group)
- [ ] Estimate panel updates on rule change (debounced 500ms)
- [ ] Preview modal shows 100 contacts with first_name, email, lifecycle_stage
- [ ] Add/remove condition buttons accessible via keyboard

**Changelog:** `logs/frontend/7.2-audience-screen_DDMMYYHHSS.md`

---

### Task 7.3 — Templates screen
**Log:** `logs/frontend/7.3-templates-screen_DDMMYYHHSS.md`

**Files:**
- `apps/web/src/app/(plugin)/templates/page.tsx` — grid of template cards
- `apps/web/src/components/templates/template-card.tsx` — name, type badge, approval status, category
- `apps/web/src/components/templates/template-filter-bar.tsx` — channel + category filters
- `apps/web/src/components/templates/template-preview-modal.tsx` — rendered HTML preview (iframe) + variable list

**Acceptance criteria:**
- [ ] Template cards show approval status chip
- [ ] Filter by channel/category updates list client-side
- [ ] Preview modal renders HTML safely in sandboxed iframe (no XSS)

**Changelog:** `logs/frontend/7.3-templates-screen_DDMMYYHHSS.md`

---

### Task 7.4 — Campaign Builder: 5-step stepper
**Log:** `logs/frontend/7.4-campaign-builder_DDMMYYHHSS.md`
**Skills:** ui-intelligence, frontend-patterns

**Files:**
- `apps/web/src/app/(plugin)/campaigns/new/page.tsx`
- `apps/web/src/components/campaign-builder/builder-stepper.tsx` — step indicator, forward/back nav, step validation
- `apps/web/src/components/campaign-builder/steps/step1-type.tsx` — radio cards for One-time/Scheduled/Recurring/Triggered
- `apps/web/src/components/campaign-builder/steps/step2-audience.tsx` — segment picker + estimate panel
- `apps/web/src/components/campaign-builder/steps/step3-message.tsx` — channel tabs (Email/WhatsApp), device preview toggle (desktop/mobile), variable insertion toolbar
- `apps/web/src/components/campaign-builder/steps/step4-delivery.tsx` — frequency cap input, quiet hours time pickers + timezone selector, schedule mode selector (Now/Schedule/Smart-time), tags input
- `apps/web/src/components/campaign-builder/steps/step5-review.tsx` — readiness score gauge (0-100), warnings list, blockers list, test send button, publish button
- `apps/web/src/components/campaign-builder/email-editor.tsx` — block-based (Hero, Text, CTA, Footer blocks), variable `{{var}}` insertion
- `apps/web/src/components/campaign-builder/whatsapp-editor.tsx` — template selector + variable mapping inputs + media preview

**Form schemas (Zod, in `packages/shared/src/`):**
```typescript
campaignTypeSchema, campaignAudienceSchema, campaignMessageSchema,
campaignDeliverySchema, campaignReviewSchema
```

**Acceptance criteria:**
- [ ] Step progression is blocked if current step has validation errors
- [ ] Campaign builder Zustand store persists all form data when navigating steps
- [ ] Device preview toggle switches email render between 600px and 375px container
- [ ] Readiness score updates live when step 5 mounts (fetches /validation)
- [ ] Variables marked unmapped show warning inline in editor

**Tests:**
- Step 1: selecting campaign type updates store
- Step 2: selecting segment triggers estimate fetch
- Step 5: blockers shown → publish button disabled

**Changelog:** `logs/frontend/7.4-campaign-builder_DDMMYYHHSS.md`

---

### Task 7.5 — Journeys screen (canvas + inspector)
**Log:** `logs/frontend/7.5-journeys-screen_DDMMYYHHSS.md`

**Files:**
- `apps/web/src/app/(plugin)/journeys/page.tsx` — journey list
- `apps/web/src/components/journeys/journey-canvas.tsx` — SVG-based node graph, zoom/pan, node click selects for inspector
- `apps/web/src/components/journeys/node-palette.tsx` — draggable node types panel
- `apps/web/src/components/journeys/node-inspector.tsx` — selected node config panel

Node types: Trigger, Segment Check, Wait, Condition Split, Send Email, Send WhatsApp, Webhook, Goal.

**Acceptance criteria:**
- [ ] Canvas renders nodes connected by SVG lines
- [ ] Clicking a node opens inspector panel
- [ ] Journey list shows status chip for each journey
- [ ] Publish button only enabled when journey has an entry trigger node

**Changelog:** `logs/frontend/7.5-journeys-screen_DDMMYYHHSS.md`

---

### Task 7.6 — Reports screen
**Log:** `logs/frontend/7.6-reports-screen_DDMMYYHHSS.md`

**Files:**
- `apps/web/src/app/(plugin)/reports/page.tsx`
- `apps/web/src/components/reports/campaign-performance-table.tsx` — sent/delivered/opened/clicked/failed per campaign
- `apps/web/src/components/reports/engagement-chart.tsx` — Recharts BarChart for channel comparison
- `apps/web/src/components/reports/delivery-funnel.tsx` — funnel visualization

**Acceptance criteria:**
- [ ] Table sortable by open rate
- [ ] Chart filters by date range (7d/30d/90d)
- [ ] Empty state when no campaign has been sent

**Changelog:** `logs/frontend/7.6-reports-screen_DDMMYYHHSS.md`

---

### Task 7.7 — Settings screen (channel config UI)
**Log:** `logs/frontend/7.7-settings-screen_DDMMYYHHSS.md`

**Files:**
- `apps/web/src/app/(plugin)/settings/page.tsx`
- `apps/web/src/components/settings/channel-config-form.tsx` — per-channel config form with masked credential inputs, save button, health check trigger
- `apps/web/src/components/settings/health-status-badge.tsx` — healthy/degraded/down indicator with timestamp

**Acceptance criteria:**
- [ ] Credential inputs are `type="password"` with show/hide toggle
- [ ] Save succeeds → success toast; error → inline error message
- [ ] Health check button triggers GET /health and updates status badge

**Changelog:** `logs/frontend/7.7-settings-screen_DDMMYYHHSS.md`

---

## Phase 8 — End-to-End Tests + Tenant Isolation Hardening

### Task 8.1 — Backend E2E test suite
**Log:** `logs/backend/8.1-e2e-tests_DDMMYYHHSS.md`
**Skills:** tdd-workflow, security-review

**File:** `apps/api/test/` (one file per module)

**Critical isolation tests (must all pass before ship):**
- Contact from tenant A not visible to tenant B requests
- Campaign from tenant A → GET with tenant B JWT → 404 (not 403)
- Segment estimate only counts tenant's own contacts
- Overview stats aggregate only tenant's own data
- Delivery events never cross tenant boundary

**Campaign flow E2E:**
- Create campaign draft → validate → publish → dispatch job runs → delivery rows created → email send job → status='sent'
- Frequency cap: contact at 2/day cap → not included in delivery batch
- Quiet hours: campaign published during quiet hours → dispatch job delayed

**Changelog:** `logs/backend/8.1-e2e-tests_DDMMYYHHSS.md`

---

### Task 8.2 — Frontend E2E smoke tests (Playwright)
**Log:** `logs/frontend/8.2-playwright-smoke_DDMMYYHHSS.md`

**File:** `apps/web/e2e/`

Tests:
- Campaign builder: complete 5-step flow → publish → campaign appears in list with 'scheduled' status
- Segment builder: add rule → estimate updates → preview shows contacts
- Templates: filter by channel → correct templates shown
- Overview: KPI cards render with numeric values

**Changelog:** `logs/frontend/8.2-playwright-smoke_DDMMYYHHSS.md`

---

## Verification — How to Test End-to-End

1. `make dev-infra` — start Postgres + Redis
2. `make migrate` — run all 8 migrations
3. `make dev` — start API (port 4000) + Web (port 3000)
4. Create a tenant JWT: sign with `JWT_ACCESS_SECRET`, include `{ tenantId: "test-tenant", roles: ["OWNER"] }`
5. `POST /api/v1/contacts` — bulk upsert 10 test contacts
6. `POST /api/v1/segments` — create segment with rule `lifecycle_stage = 'customer'`
7. `GET /api/v1/segments/:id/estimate` — verify estimate > 0
8. `POST /api/v1/templates` — create email template with `{{ first_name }}`
9. `POST /api/v1/campaigns` → `PATCH` → `GET /validation` → verify readiness score
10. `POST /api/v1/campaigns/:id/publish` — triggers dispatch queue
11. Observe `campaign_deliveries` rows created (check via Adminer at localhost:8080)
12. Check Redis Commander at localhost:8081 for completed BullMQ jobs
13. Open localhost:3000 → verify Overview dashboard shows sent count
14. Run `make test` → all unit + integration tests pass

**CI verification:** Open a PR to `dev` → GitHub Actions runs ci.yml → all steps green.

---

## Changelog Entry Convention

Every task creates a log file **before** work begins:
```
logs/{area}/{phase}.{seq}-{slug}_DDMMYYHHSS.md
```
Examples using 18 April 2026, 14:30:
```
logs/infra/0.1-monorepo-workspace_180426143000.md
logs/backend/1.2-entities-group1_180426153000.md
logs/frontend/6.2-plugin-shell_190426090000.md
```
File contents follow `logs/LOG-TEMPLATE.md` exactly. Status flow: `PENDING → IN_PROGRESS → DONE`.

---

## Skill Self-Audit

```yaml
writing_plans_audit:
  skill: writing-plans
  tasks_are_atomic: true
  tasks_have_acceptance_criteria: true
  tasks_have_agent_assignments: true
  tasks_have_log_paths: true
  tasks_have_skill_assignments: true
  dependencies_explicit: true
  handoffs_identified: true
  overall: plan_ready
```
