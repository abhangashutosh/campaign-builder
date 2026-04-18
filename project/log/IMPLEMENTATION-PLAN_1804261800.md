# Change Log — IMPLEMENTATION-PLAN.md Update

**File:** `docs/IMPLEMENTATION-PLAN.md`
**Date:** 18 Apr 2026 · 18:00
**Trigger:** Updated design file `project/design/Campaign Builder — Engage Plugin.html`
**Status:** DONE

---

## Changes Applied

### 1. Color Token Correction
- **Changed:** Navy from `#1A3C6B` (PRD.md) → `#1B4DFF` (design HTML)
- **Reason:** Design HTML `--navy` CSS variable is the visual source of truth
- **Added:** Full CSS variable set with all variants (navy-50, navy-700, navy-800, teal-50, orange-50, etc.)
- **Affects:** Task 6.1 globals.css spec, Architecture Snapshot

### 2. Campaign Types Expanded (One-time → 6 types)
- **Added:** `transactional`, `journey`, `api_triggered` to type enum
- **DB:** `campaigns.type` CHECK constraint updated
- **Service:** `CampaignReadinessValidator` skips consent/segment for `transactional` type
- **UI:** Step 1 now shows 6 type cards with descriptions

### 3. Step 1 New Form Fields
- **Added DB columns:** `description TEXT`, `workspace TEXT DEFAULT 'default'`, `folder TEXT`, `ab_test_enabled BOOL DEFAULT false`
- **Added UI:** Starting Templates section (5 cards pre-fill template_id), owner readonly field

### 4. Step 4 New Sections
- **UTM Parameters:** `utm_params JSONB` on campaigns; 4 inputs (source, medium, campaign, content)
- **A/B Test Config:** `ab_test_config JSONB`; goal, windowDays, attribution model (conditional on ab_test_enabled)
- **Throttling Preview:** readonly info card (segment size ÷ 24h)

### 5. Campaign Versioning
- **Added:** `version INT NOT NULL DEFAULT 1` on campaigns
- **Service:** `publish()` increments version before status transition
- **UI:** Publish button shows `"Publish v{N+1}"`; test send shows team count

### 6. Reports — Failure Breakdown
- **Service:** `getReports()` now returns `failureBreakdown: { hardBounce, spamComplaint, invalidAddress }`
- **UI:** New `failure-reasons-list.tsx` component below delivery funnel

### 7. Settings — Domain Verification Table
- **New component:** `domain-verification-table.tsx` with SPF/DKIM/DMARC per domain
- **Columns:** Domain, SPF, DKIM, DMARC, Score (0-100 colored), Action (Details/Fix)

### 8. New Task 5.4 — DomainVerificationService
- **File:** `apps/api/src/settings/domain-verification.service.ts`
- **Stack:** `dns.promises.resolveTxt()` (native Node, no external library)
- **Cache:** Redis TTL 3600s; `POST /verify` bypasses cache
- **Endpoints:** `GET /settings/domains`, `POST /settings/domains/:domain/verify`
- **Security:** Hostname regex validation before DNS query (SSRF prevention)

### 9. Zod Schemas Updated (packages/shared)
- Step 1 schema: all 6 types, new optional fields
- Step 4 schema: utm_params, ab_test_config, metadata timezone

### 10. Self-Audit Block Updated
- Added `last_updated` and `updated_reason` fields
- Added Design Delta table listing all 10 changes

---

## Files Modified
- `docs/IMPLEMENTATION-PLAN.md` — 10 targeted edits applied
- `project/log/IMPLEMENTATION-PLAN_1804261800.md` — this file (created)
