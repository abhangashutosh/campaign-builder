# Campaign Builder — Apps

This directory contains the two runnable applications:

```
apps/
  api/   — NestJS 10 backend (port 4000)
  web/   — Next.js 14 frontend (port 3000)
```

---

## Quick Start

> Prerequisites: Docker Desktop running, Node 20+, pnpm 9+

```bash
# 1. Start infrastructure (Postgres + Redis)
cd infra && docker compose up -d
cd ..

# 2. Install dependencies
pnpm install

# 3. Load environment variables
cp .env.example .env   # already done if .env exists

# 4. Run database migrations
cd apps/api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campaign_dev" \
  node_modules/.bin/ts-node --transpile-only -r tsconfig-paths/register -e "
  const { DataSource } = require('typeorm');
  const ds = new DataSource({ type:'postgres', url:process.env.DATABASE_URL,
    migrations:[__dirname+'/src/database/migrations/*{.ts,.js}'], synchronize:false });
  ds.initialize().then(() => ds.runMigrations()).then(() => ds.destroy());
  "

# 5. Seed demo data
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campaign_dev" \
  node_modules/.bin/ts-node --transpile-only -r tsconfig-paths/register \
  src/database/seeds/demo.seed.ts

# 6. Start API (new terminal)
set -a && source ../../.env && set +a
node_modules/.bin/ts-node --transpile-only -r tsconfig-paths/register \
  -r dotenv/config src/main.ts

# 7. Start frontend (new terminal)
cd apps/web
node_modules/.bin/next dev -p 3000
```

---

## Demo Data

The seed script (`apps/api/src/database/seeds/demo.seed.ts`) inserts:

| Table | Count | Details |
|---|---|---|
| `contacts` | 25 | Mix of active_customer, lead, subscriber, churned. All Indian names, real email format |
| `segments` | 4 | Newsletter Subscribers · Active Customers · High-Value Leads · Re-engagement Targets |
| `templates` | 6 | Welcome Email · Cart Abandonment · Monthly Newsletter · OTP (WhatsApp) · Product Launch · Win-Back |
| `channel_configs` | 1 | Email via Resend (demo API key, active) |
| `campaigns` | 6 | Q2 Newsletter (completed) · Welcome Series (running) · Cart Recovery (running) · Product Launch (scheduled) · Re-engagement (draft) · OTP (transactional/running) |
| `journeys` | 2 | Onboarding Journey (active, 6 nodes) · Win-Back Journey (draft, 4 nodes) |
| `campaign_deliveries` | 27 | For Q2 Newsletter + Welcome campaigns with realistic statuses |
| `delivery_events` | ~80 | sent → delivered → opened → clicked chain per delivery |

**Tenant ID used:** `demo`

To re-seed (wipes and re-inserts demo tenant only):

```bash
cd apps/api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campaign_dev" \
  node_modules/.bin/ts-node --transpile-only -r tsconfig-paths/register \
  src/database/seeds/demo.seed.ts
```

---

## Testing the API

### Base URL

```
http://localhost:4000/api/v1
```

All responses follow the envelope: `{ success, data, meta: { requestId, timestamp } }`

### Health check

```bash
curl http://localhost:4000/api/v1/health
# → { "success": true, "data": { "status": "ok", "info": { "database": { "status": "up" } } } }
```

### List contacts (demo tenant)

```bash
curl -H "x-tenant-id: demo" http://localhost:4000/api/v1/contacts
```

### List segments

```bash
curl -H "x-tenant-id: demo" http://localhost:4000/api/v1/segments
```

### List templates

```bash
curl -H "x-tenant-id: demo" http://localhost:4000/api/v1/templates
```

### List campaigns

```bash
curl -H "x-tenant-id: demo" http://localhost:4000/api/v1/campaigns
```

### Get campaign readiness score

```bash
# Replace <CAMPAIGN_ID> with an ID from the list above
curl -H "x-tenant-id: demo" http://localhost:4000/api/v1/campaigns/<CAMPAIGN_ID>/readiness
# → { score: 0-100, ready: bool, blockers: [], warnings: [] }
```

### Get campaign reports (completed campaign)

```bash
curl -H "x-tenant-id: demo" http://localhost:4000/api/v1/campaigns/<CAMPAIGN_ID>/reports
# → { sent, delivered, opened, clicked, bounced, failed, failureBreakdown: { hardBounce, spamComplaint, invalidAddress } }
```

### Domain verification

```bash
curl -H "x-tenant-id: demo" http://localhost:4000/api/v1/settings/domains
curl -X POST -H "x-tenant-id: demo" http://localhost:4000/api/v1/settings/domains/yourdomain.com/verify
```

---

## Creating a Campaign (Step-by-Step)

### Option A — Using the UI (recommended for demo)

1. Open **http://localhost:3000** in your browser
2. The campaign builder is a 5-step wizard:

| Step | What you fill in |
|---|---|
| **Step 1 — Type & Setup** | Choose campaign type (One-time / Recurring / Triggered / Transactional / Journey / API-triggered). Add name, description, workspace, folder. Toggle A/B test if needed. |
| **Step 2 — Audience** | Pick a segment (e.g. "Newsletter Subscribers"). The audience estimate shows live contact count. |
| **Step 3 — Template** | Choose an email/WhatsApp template. Preview renders with sample variable values. |
| **Step 4 — Delivery Rules** | Set schedule/trigger. Add UTM parameters. Configure A/B test variants (if toggled). Set quiet hours + frequency cap. |
| **Step 5 — Review & Publish** | Readiness score bar (must be ≥ 80 to publish). Fix blockers/warnings. Click **Publish v{N}**. |

### Option B — Using the REST API

```bash
TENANT="demo"
BASE="http://localhost:4000/api/v1"

# Step 1 — Create draft campaign
CAMPAIGN=$(curl -s -X POST "$BASE/campaigns" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT" \
  -d '{
    "name": "Test Campaign",
    "type": "one_time",
    "channels": ["email"],
    "createdBy": "you@example.com"
  }')

CAMPAIGN_ID=$(echo $CAMPAIGN | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
echo "Campaign ID: $CAMPAIGN_ID"

# Step 2 — Assign segment (get ID from /segments)
SEGMENT_ID=$(curl -s -H "x-tenant-id: $TENANT" "$BASE/segments" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])")

curl -X PUT "$BASE/campaigns/$CAMPAIGN_ID" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT" \
  -d "{\"audienceSegmentId\": \"$SEGMENT_ID\"}"

# Step 3 — Assign template (get ID from /templates)
TEMPLATE_ID=$(curl -s -H "x-tenant-id: $TENANT" "$BASE/templates" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])")

curl -X PUT "$BASE/campaigns/$CAMPAIGN_ID" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT" \
  -d "{\"templateId\": \"$TEMPLATE_ID\"}"

# Step 4 — Check readiness
curl -H "x-tenant-id: $TENANT" "$BASE/campaigns/$CAMPAIGN_ID/readiness"

# Step 5 — Publish (requires score >= 80 and no blockers)
curl -X POST -H "x-tenant-id: $TENANT" "$BASE/campaigns/$CAMPAIGN_ID/publish"
```

---

## Postman Collection

Import `project/postman/campaign-builder.postman_collection.json` and `project/postman/campaign-builder.postman_environment.json` into Postman.

Set `baseUrl = http://localhost:4000` and `tenantId = demo` in the environment. The collection has 8 folders with 28 pre-built requests covering all endpoints.

---

## Useful URLs

| Service | URL | Purpose |
|---|---|---|
| Frontend | http://localhost:3000 | Campaign Builder UI |
| API | http://localhost:4000 | NestJS REST API |
| API Health | http://localhost:4000/api/v1/health | DB + Redis status |
| Adminer | http://localhost:8080 | Postgres DB browser |
| Redis Commander | http://localhost:8081 | Redis key browser |

**Adminer login:**
- System: PostgreSQL
- Server: `postgres` (docker service name) or `localhost`
- Username: `postgres`
- Password: `postgres`
- Database: `campaign_dev`

---

## Running Tests

```bash
# API unit tests
cd apps/api && pnpm test

# API tests with coverage
cd apps/api && pnpm test:coverage

# Frontend tests
cd apps/web && pnpm test

# Watch mode
pnpm test:watch
```

---

## Common Issues

| Problem | Fix |
|---|---|
| `DATABASE_URL is required` | Run `set -a && source .env && set +a` before starting |
| Redis connection refused | Docker Redis is on port **6380** (not 6379). Check `REDIS_URL=redis://localhost:6380` in `.env` |
| Migrations already ran | Migrations are idempotent — safe to re-run |
| Seed wipes data | Seed only wipes `tenant_id = 'demo'` rows, not other tenants |
| TypeScript errors on `nest start` | Use `ts-node --transpile-only` for dev. Type errors don't affect runtime |
