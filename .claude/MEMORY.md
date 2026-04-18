# MEMORY.md — Agent Cross-Session Memory

> Append-only. Never delete entries. Mark superseded with [SUPERSEDED by #N - date].
> Read at every session start. Write at every session end.
> Format: ## [#N] YYYY-MM-DD — Category: Title

---

<!-- Categories: Decision | Pattern | Mistake+Fix | Constraint | Warning | Preference | Performance -->

## [#1] 2026-04-18 — Constraint: Navy Color Token is #1B4DFF (NOT #1A3C6B or #1E3A5F)

The design HTML is the source of truth for all color tokens. PRD.md says `#1A3C6B` but that is WRONG — the design HTML uses `--navy: #1B4DFF`. A previous session wrote `#1E3A5F` into globals.css which was also incorrect. The correct value is `#1B4DFF`. Always check `project/design/Campaign Builder — Engage Plugin.html` CSS vars when implementing color tokens.

## [#2] 2026-04-18 — Decision: @nestjs/bull (bull v4) for queue, not raw bullmq

The project uses `@nestjs/bull` (which wraps `bull` v4) for queue processors. Both `@nestjs/bull` and `bullmq` are in package.json — use `@nestjs/bull` for the `@Processor`, `@Process`, `@InjectQueue` decorators and `bull` Job type. `bullmq` is installed but not used in processors (it's a peer/future migration path).

## [#3] 2026-04-18 — Pattern: Queue processor idempotency via status check

Every send processor (email, whatsapp) checks `delivery.status !== 'queued'` before processing. This prevents double-sends when jobs are retried. Never skip this guard.

## [#4] 2026-04-18 — Pattern: TenantScopedRepository base has create/update

The base `TenantScopedRepository` now has `create()` and `update()` base methods. Child repositories (ContactsRepository, SegmentsRepository, etc.) can override these but don't have to. Always assert tenantId in all write paths.

## [#5] 2026-04-18 — Decision: Overview module at /api/v1/overview/stats

Added `OverviewModule` with `GET /api/v1/overview/stats` endpoint. Returns `{ totalCampaigns, activeCampaigns, deliveryRate, openRate, clickRate }`. Frontend `use-overview.ts` hook queries this path.

## [#7] 2026-04-19 — Mistake+Fix: Seed used TENANT_ID = 'default' instead of UUID

`apps/api/src/database/seeds/demo.seed.ts` had `const TENANT_ID = 'default'` which caused all seeded data (10 templates, 10 campaigns, 4 journeys, 108 deliveries) to be stored under a non-UUID tenant. The API queries with UUID tenant headers (`00000000-0000-0000-0000-000000000001`), so all API calls returned empty arrays. Fix: change constant to `'00000000-0000-0000-0000-000000000001'` and reseed.

## [#8] 2026-04-19 — Mistake+Fix: Stale .next chunks cause React hydration failure (isLoading stuck)

After code changes, if the Next.js dev server is restarted without clearing `.next/`, the browser receives new HTML pointing to new chunk hashes but may have stale cached JS with old hashes. This causes 404s for JS chunks → React hydration fails → `isLoading` from TanStack Query stays `true` forever. Fix: always `rm -rf apps/web/.next` before restarting the dev server after significant CSS/component changes.

## [#9] 2026-04-19 — Constraint: CSS tokens --border-2 and --hover must be defined in :root

The design system CSS classes (`.card`, `.table-filters`, `.chip`, etc.) use `--border-2` (#EDF1F6) and `--hover` (#F1F5F9). These tokens were NOT in the original `:root` block — they had to be explicitly added. Any new design class that references CSS custom properties must have those properties defined in `:root` or they silently fall back to `initial`.

## [#6] 2026-04-18 — Pattern: Journey DFS cycle detection before publish

Journey.publish() runs DFS (white/gray/black tri-color marking) on nodes array using `node.next[]` adjacency. Throws `UnprocessableEntityException('Journey contains a cycle')` if cycle found. Also requires at least one `type: 'trigger'` node.
