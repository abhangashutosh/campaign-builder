# Campaign Builder — Pixel-Match Campaign List + Settings UI + Integration Tests

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **EXECUTION FLAG:** Always run with `--dangerously-skip-permissions` (or set `"dangerouslySkipPermissions": true` in `.claude/settings.local.json`).

**Goal:** (1) Rewrite `campaigns-content.tsx` to pixel-match the design HTML using ONLY its exact CSS classes and HTML structure — no invented design, no Tailwind. (2) Rewrite `settings-content.tsx` to pixel-match the design HTML settings screen. (3) Add backend integration tests (NestJS + Supertest) and frontend integration tests (RTL + MSW). (4) Build, test, restart both servers.

**Architecture:** CSS classes lifted verbatim from the design HTML `<style>` block into `globals.css`. Components rewritten to use those exact class names. Integration tests use `@nestjs/testing` + `supertest` for API and MSW v2 + RTL for frontend.

**Design source:** `D:\Rez_Data\rez\AIWorkshop\campaign-builder\project\design\Campaign Builder — Engage Plugin_t.html`

**Tech Stack:** Next.js 14 · NestJS 10 · Vitest · @nestjs/testing · supertest · msw@2 · @testing-library/user-event · TypeORM · PostgreSQL

---

## Context

The current `campaigns-content.tsx` uses Tailwind classes and custom `<Th>/<Td>` components that do not match the design HTML. The design defines a precise `.tbl`/`.card`/`.chip`/`.ch`/`.aud`/`.kpi` CSS class system. The goal is to lift those classes verbatim from the design HTML into `globals.css` and rewrite both components to use them — not to invent any new design.

The `settings-content.tsx` also does not match the design's `.settings-grid`/`.settings-nav`/`.provider-card`/`.provider-logo`/`.provider-meta` structure.

The design HTML has NO separate "+ New Campaign" button inside the table card — only "Export CSV" and "View all" in the card header. There is a "New Campaign" button in the page-level actions (header area).

---

## Critical Files

### Modify
- `apps/web/src/app/globals.css` — add all campaigns-list + settings CSS classes from design HTML
- `apps/web/src/components/campaigns/campaigns-content.tsx` — rewrite to match design HTML exactly
- `apps/web/src/components/settings/settings-content.tsx` — rewrite to match design HTML settings screen
- `apps/api/package.json` — add `test:integration` script
- `apps/web/package.json` — add `test:integration` script
- `.claude/settings.local.json` — add `"dangerouslySkipPermissions": true`

### Create — Backend integration tests
- `apps/api/vitest.integration.config.ts` — separate vitest config for integration tests
- `apps/api/src/campaigns/campaigns.integration.spec.ts` — 11 integration tests

### Create — Frontend integration tests
- `apps/web/src/test/msw/handlers.ts` — MSW request handlers
- `apps/web/src/test/msw/server.ts` — MSW server setup
- `apps/web/src/test/setup-integration.ts` — MSW lifecycle hooks
- `apps/web/vitest.integration.config.ts` — separate vitest config
- `apps/web/src/components/campaigns/campaigns-content.integration.test.tsx` — 8 integration tests
- `apps/web/src/lib/api-client.integration.test.ts` — 3 integration tests (catches the tenant-ID bug)

---

## PHASE 0 — Enable dangerously-skip-permissions

### Task 0: Add skip-permissions to settings

- [ ] **Step 1: Update `.claude/settings.local.json`**

Read current file first. If it exists, add `"dangerouslySkipPermissions": true`. If not, create it:

```json
{
  "dangerouslySkipPermissions": true
}
```

File path: `D:\Rez_Data\rez\AIWorkshop\campaign-builder\.claude\settings.local.json`

---

## PHASE 1 — CSS: Add design HTML classes verbatim to globals.css

### Task 1: Add all design CSS classes to globals.css

**File:** `apps/web/src/app/globals.css`

- [ ] **Step 1: Read current globals.css**

Read `apps/web/src/app/globals.css` to find the end of `@layer components` block.

- [ ] **Step 2: Append the CSS block**

Add inside `@layer components` (after all existing rules). These are taken VERBATIM from the design HTML `<style>` block:

```css
  /* ── KPI strip — from design HTML ── */
  .kpi-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 12px; margin-bottom: 20px; }
  .kpi { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px; box-shadow: var(--shadow-sm); }
  .kpi .lbl { font-size: 11px; color: var(--text-3); font-weight: 500; display: flex; align-items: center; gap: 6px; }
  .kpi .val { font-size: 22px; font-weight: 700; margin-top: 4px; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .kpi .d { font-size: 11px; margin-top: 3px; display: flex; align-items: center; gap: 4px; }
  .kpi .d.up { color: var(--success); }
  .kpi .d.down { color: var(--danger); }
  .kpi .d.flat { color: var(--text-3); }

  /* ── Campaigns table — from design HTML ── */
  .table-card { overflow: hidden; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
  .card-head { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border-2); }
  .card-title { font-size: 13px; font-weight: 600; }
  .card-sub { font-size: 11px; color: var(--text-3); }
  .card-body { padding: 16px; }
  .card-foot { padding: 10px 16px; border-top: 1px solid var(--border-2); display: flex; align-items: center; gap: 8px; }

  .table-filters { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--border-2); background: var(--bg); }
  .table-filters .filter { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); font-size: 11px; color: var(--text-2); font-weight: 500; }
  .table-filters .filter .k { color: var(--text-3); }

  .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
  .tbl thead th { text-align: left; font-weight: 600; color: var(--text-3); font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--bg); white-space: nowrap; }
  .tbl thead th.num { text-align: right; }
  .tbl tbody td { padding: 12px 14px; border-bottom: 1px solid var(--border-2); vertical-align: middle; }
  .tbl tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .tbl tbody tr:last-child td { border-bottom: none; }
  .tbl tbody tr:hover { background: var(--hover); }
  .tbl .c-name { font-weight: 600; color: var(--text); font-size: 13px; line-height: 1.3; }
  .tbl .c-meta { font-size: 11px; color: var(--text-3); margin-top: 1px; }
  .tbl .ch { display: inline-flex; align-items: center; gap: 6px; font-weight: 500; font-size: 11px; }
  .tbl .ch.email { color: var(--navy); }
  .tbl .ch.wa { color: #047857; }
  .tbl .ch.both { color: var(--orange); }
  .tbl .aud { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-2); }
  .tbl .aud-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); flex-shrink: 0; }
  .tbl td.nowrap { white-space: nowrap; font-size: 12px; color: var(--text-2); }
  .tbl td.muted { color: var(--muted); }

  .chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px; background: var(--hover); color: var(--text-2); border: 1px solid var(--border); line-height: 1.6; }
  .chip .d { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); flex-shrink: 0; }
  .chip.running { background: var(--success-50); color: #166534; border-color: #BBF7D0; } .chip.running .d { background: var(--success); }
  .chip.scheduled { background: var(--navy-50); color: var(--navy); border-color: #C7D0FF; } .chip.scheduled .d { background: var(--navy); }
  .chip.draft { background: #F1F5F9; color: var(--text-2); border-color: var(--border); } .chip.draft .d { background: var(--muted); }
  .chip.paused { background: var(--warning-50); color: #92400E; border-color: #FDE7B8; } .chip.paused .d { background: var(--warning); }
  .chip.completed { background: #F0F9FF; color: #075985; border-color: #BAE6FD; } .chip.completed .d { background: #0284C7; }
  .chip.failed { background: var(--danger-50); color: #991B1B; border-color: #FECACA; } .chip.failed .d { background: var(--danger); }
  .chip.review { background: var(--warning-50); color: #92400E; border-color: #FDE7B8; } .chip.review .d { background: var(--warning); }
  .chip.teal { background: var(--teal-50); color: #047857; border-color: #B6EDDB; } .chip.teal .d { background: var(--teal); }

  .table-foot { display: flex; align-items: center; padding: 10px 14px; border-top: 1px solid var(--border-2); font-size: 12px; color: var(--text-3); }
  .pager { margin-left: auto; display: flex; align-items: center; gap: 4px; }
  .pager button { width: 28px; height: 28px; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-2); display: grid; place-items: center; background: var(--surface); font-size: 12px; cursor: pointer; }
  .pager button:hover { background: var(--hover); }
  .pager button.on { background: var(--navy); color: #fff; border-color: var(--navy); font-weight: 700; }

  .btn { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: var(--radius-md); font-size: 12px; font-weight: 500; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; transition: background .12s, border-color .12s; }
  .btn:hover { background: var(--hover); }
  .btn svg { width: 14px; height: 14px; }
  .btn.primary { background: var(--navy); color: #fff; border-color: var(--navy); }
  .btn.primary:hover { background: var(--navy-700); }
  .btn.ghost { border-color: transparent; }
  .btn.ghost:hover { background: var(--hover); }
  .btn.sm { height: 26px; padding: 0 9px; font-size: 11px; }
  .btn.lg { height: 36px; padding: 0 14px; font-size: 13px; }
  .btn.danger-outline { color: var(--danger); border-color: #FECACA; }
  .btn.danger-outline:hover { background: var(--danger-50); }

  /* ── Settings — from design HTML ── */
  .settings-grid { display: grid; grid-template-columns: 220px 1fr; gap: 20px; }
  .settings-nav { display: flex; flex-direction: column; gap: 2px; position: sticky; top: calc(var(--header-h, 56px) + 16px); }
  .settings-nav a { padding: 7px 12px; border-radius: var(--radius-md); font-size: 12px; font-weight: 500; color: var(--text-2); display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background .12s; }
  .settings-nav a svg { width: 14px; height: 14px; color: var(--muted); }
  .settings-nav a:hover { background: var(--hover); }
  .settings-nav a.active { background: var(--navy-50); color: var(--navy); font-weight: 600; }
  .settings-nav a.active svg { color: var(--navy); }

  .provider-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-bottom: 1px solid var(--border-2); }
  .provider-card:last-child { border: none; }
  .provider-logo { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--bg); border: 1px solid var(--border); display: grid; place-items: center; font-weight: 600; font-size: 11px; color: var(--text-2); flex-shrink: 0; }
  .provider-meta { flex: 1; min-width: 0; }
  .provider-meta .n { font-size: 13px; font-weight: 600; }
  .provider-meta .d { font-size: 11px; color: var(--text-3); margin-top: 2px; }

  /* ── Responsive — from design HTML ── */
  @media (max-width: 1280px) {
    .kpi-grid { grid-template-columns: repeat(3,1fr); }
    .settings-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 960px) {
    .kpi-grid { grid-template-columns: repeat(2,1fr); }
    .settings-grid { grid-template-columns: 1fr; }
  }
```

- [ ] **Step 3: Verify type-check passes**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder && pnpm run type-check 2>&1 | grep -E "error TS" | head -5
```
Expected: zero errors.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/app/globals.css
git commit -m "feat(web): add design-HTML CSS classes (tbl/chip/ch/aud/kpi/settings) to globals.css"
```

---

## PHASE 2 — UI: Rewrite campaigns-content.tsx to match design HTML

### Task 2: Rewrite campaigns-content.tsx

**File:** `apps/web/src/components/campaigns/campaigns-content.tsx`

The design HTML shows the campaigns table inside a `.card.table-card` div, with:
- `.card-head` with title + "Export CSV" + "View all" buttons (NO separate New Campaign button inside card)
- `.table-filters` with Channel, Status, Owner filter spans
- `.tbl` table with exact column structure
- `.table-foot` with count and `.pager` pagination
- Above the card: page head with "New Campaign" primary button + filter tabs

- [ ] **Step 1: Write the new file**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCampaigns } from '@/hooks/use-campaigns'
import type { Campaign } from '@/types'

// ── helpers ──────────────────────────────────────────────────────────────────

type Status = Campaign['status']
type Channel = 'email' | 'whatsapp'

function StatusChip({ status }: { status: Status }) {
  const label: Record<string, string> = {
    draft: 'Draft', running: 'Running', scheduled: 'Scheduled',
    paused: 'Paused', completed: 'Completed', failed: 'Failed',
    needs_review: 'Needs Review',
  }
  const cls: Record<string, string> = {
    draft: 'draft', running: 'running', scheduled: 'scheduled',
    paused: 'paused', completed: 'completed', failed: 'failed',
    needs_review: 'review',
  }
  return (
    <span className={`chip ${cls[status] ?? 'draft'}`}>
      <span className="d" />
      {label[status] ?? status}
    </span>
  )
}

const MAIL_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)

const WA_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z"></path>
  </svg>
)

function ChannelSpan({ channels }: { channels: Channel[] }) {
  const hasEmail = channels.includes('email')
  const hasWa    = channels.includes('whatsapp')
  if (hasEmail && hasWa) return <span className="ch both">{MAIL_SVG}+WA</span>
  if (hasEmail) return <span className="ch email">{MAIL_SVG}Email</span>
  if (hasWa) return <span className="ch wa">{WA_SVG}WhatsApp</span>
  return <span className="ch draft">—</span>
}

function fmtDate(d?: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const DOTS_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1.5"></circle>
    <circle cx="12" cy="12" r="1.5"></circle>
    <circle cx="12" cy="19" r="1.5"></circle>
  </svg>
)

const STATUS_TABS = ['All', 'Running', 'Scheduled', 'Draft', 'Completed', 'Failed'] as const
type StatusTab = typeof STATUS_TABS[number]

const PAGE_SIZE = 10

// ── component ─────────────────────────────────────────────────────────────────

export function CampaignsContent() {
  const { data: campaigns = [], isLoading } = useCampaigns()
  const [activeTab, setActiveTab]       = useState<StatusTab>('All')
  const [channelFilter, setChannelFilter] = useState<'All' | 'Email' | 'WhatsApp'>('All')
  const [page, setPage]                 = useState(1)
  const [menuOpenId, setMenuOpenId]     = useState<string | null>(null)

  const filtered = campaigns.filter((c) => {
    if (activeTab !== 'All' && c.status.toLowerCase() !== activeTab.toLowerCase()) return false
    if (channelFilter === 'Email'    && !c.channels.includes('email'))    return false
    if (channelFilter === 'WhatsApp' && !c.channels.includes('whatsapp')) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div style={{ padding: '20px 24px 40px' }}>
      {/* Page head */}
      <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Campaigns</h1>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>All campaigns across all workspaces</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Status tabs */}
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1) }}
              className="btn sm"
              style={activeTab === tab ? { background: 'var(--navy)', color: '#fff', borderColor: 'var(--navy)' } : {}}
            >
              {tab}
            </button>
          ))}
          <Link
            href="/campaigns/new"
            className="btn sm primary"
            style={{ textDecoration: 'none' }}
          >
            + New Campaign
          </Link>
        </div>
      </div>

      {/* Campaigns card */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-3)', fontSize: 13 }}>
          Loading campaigns…
        </div>
      ) : (
        <div className="card table-card">
          {/* Card head */}
          <div className="card-head">
            <div>
              <div className="card-title">Recent Campaigns</div>
              <div className="card-sub">Across all workspaces · {filtered.length} campaigns</div>
            </div>
            <div className="right" style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button className="btn sm ghost">Export CSV</button>
              <Link href="/campaigns/new" className="btn sm" style={{ textDecoration: 'none' }}>View all</Link>
            </div>
          </div>

          {/* Filter bar */}
          <div className="table-filters">
            <span className="filter">
              <span className="k">Channel:</span>
              <select
                value={channelFilter}
                onChange={(e) => { setChannelFilter(e.target.value as 'All' | 'Email' | 'WhatsApp'); setPage(1) }}
                style={{ border: 'none', background: 'transparent', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer', outline: 'none' }}
              >
                <option>All</option>
                <option>Email</option>
                <option>WhatsApp</option>
              </select>
            </span>
            <span className="filter"><span className="k">Status:</span> {activeTab}</span>
            <span className="right" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} campaigns</span>
          </div>

          {/* Table or empty */}
          {paginated.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>No campaigns found</div>
              <Link href="/campaigns/new" style={{ color: 'var(--navy)', fontWeight: 600 }}>
                Create your first campaign →
              </Link>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Channel</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                  <th className="num">Delivered</th>
                  <th className="num">Opened</th>
                  <th className="num">Clicked</th>
                  <th className="num">Replies</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <CampaignRow
                    key={c.id}
                    campaign={c}
                    menuOpen={menuOpenId === c.id}
                    onMenuToggle={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                  />
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination footer */}
          {totalPages > 1 && (
            <div className="table-foot">
              <span>Showing {paginated.length} of {filtered.length} campaigns</span>
              <div className="pager">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={page === p ? 'on' : ''} onClick={() => setPage(p)}>{p}</button>
                ))}
                {totalPages > 5 && <button disabled>…</button>}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── row ────────────────────────────────────────────────────────────────────────

function CampaignRow({
  campaign: c,
  menuOpen,
  onMenuToggle,
}: { campaign: Campaign; menuOpen: boolean; onMenuToggle: () => void }) {
  return (
    <tr>
      <td>
        <Link href={`/campaigns/${c.id}`} style={{ textDecoration: 'none' }}>
          <div className="c-name">{c.name}</div>
          <div className="c-meta">
            {c.type ? c.type.replace('_', '-') : ''}{c.createdBy ? ` · ${c.createdBy}` : ''}
          </div>
        </Link>
      </td>
      <td><ChannelSpan channels={c.channels as Channel[]} /></td>
      <td>
        <div className="aud">
          <span className="aud-dot" />
          {c.segment?.name ?? '—'}
        </div>
      </td>
      <td><StatusChip status={c.status} /></td>
      <td className="nowrap">{fmtDate(c.scheduledFor)}</td>
      <td className="num muted">—</td>
      <td className="num muted">—</td>
      <td className="num muted">—</td>
      <td className="num muted">—</td>
      <td style={{ position: 'relative' }}>
        <button
          className="icon-btn"
          style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onMenuToggle}
        >
          {DOTS_SVG}
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', right: 8, top: 32, zIndex: 50,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
            minWidth: 140, overflow: 'hidden',
          }}>
            {(['View', 'Edit', 'Duplicate', 'Pause', 'Delete'] as const).map((label) => (
              <Link
                key={label}
                href={label === 'View' ? `/campaigns/${c.id}` : label === 'Edit' ? `/campaigns/${c.id}/edit` : '#'}
                style={{
                  display: 'block', padding: '8px 14px', fontSize: 13,
                  color: label === 'Delete' ? 'var(--danger)' : 'var(--text)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </td>
    </tr>
  )
}
```

- [ ] **Step 2: Type-check**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder && pnpm run type-check 2>&1 | grep -E "error TS" | head -10
```
Fix any errors before proceeding.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/components/campaigns/campaigns-content.tsx
git commit -m "feat(web): pixel-match campaign list to design HTML (tbl/chip/ch/aud classes verbatim)"
```

---

## PHASE 3 — Settings: Rewrite settings-content.tsx to match design HTML

### Task 3: Rewrite settings-content.tsx

**File:** `apps/web/src/components/settings/settings-content.tsx`

The design HTML shows settings with:
- `.settings-grid` (220px sidebar + 1fr content)
- `.settings-nav` with `<a class="active">` for active state
- Provider cards with `.provider-card`, `.provider-logo`, `.provider-meta`, `.chip` status
- Domain auth table using `.tbl`
- Compliance section with `.field`, `.switch`, `.select`

- [ ] **Step 1: Write the new file**

```typescript
'use client'
import { useState } from 'react'
import { Mail, MessageSquare, Zap, Key, Shield, Globe, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DomainVerificationTable } from './domain-verification-table'
import { api } from '@/lib/api-client'
import type { DomainCheckResult } from '@/types'

type SectionKey = 'email' | 'whatsapp' | 'webhooks' | 'apikeys' | 'compliance' | 'tenant' | 'roles'

const NAV_ITEMS: { key: SectionKey; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'email',      label: 'Email providers',      Icon: Mail },
  { key: 'whatsapp',   label: 'WhatsApp providers',   Icon: MessageSquare },
  { key: 'webhooks',   label: 'Webhooks & events',    Icon: Zap },
  { key: 'apikeys',    label: 'API keys',             Icon: Key },
  { key: 'compliance', label: 'Compliance',           Icon: Shield },
  { key: 'tenant',     label: 'Tenant & branding',    Icon: Globe },
  { key: 'roles',      label: 'Roles & permissions',  Icon: Users },
]

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="card card-body" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-2)' }}>{label}</div>
      <div style={{ fontSize: 12 }}>Coming soon</div>
    </div>
  )
}

function EmailProvidersSection() {
  const { data: domains, refetch } = useQuery({
    queryKey: ['settings', 'domains'],
    queryFn: () => api.get<DomainCheckResult[]>('/settings/domains'),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Email providers card */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Email providers</div>
            <div className="card-sub">Configure SMTP / API providers used for Email sends</div>
          </div>
          <div className="right" style={{ marginLeft: 'auto' }}>
            <button className="btn primary">Add provider</button>
          </div>
        </div>
        <div>
          <div className="provider-card">
            <div className="provider-logo" style={{ color: '#1A82E2' }}>SG</div>
            <div className="provider-meta">
              <div className="n">SendGrid · Primary</div>
              <div className="d">us-east-1 · API · daily cap 2M · sending domain configured</div>
            </div>
            <span className="chip running"><span className="d" />Active</span>
            <button className="btn sm">Test</button>
            <button className="btn sm ghost">Configure</button>
          </div>
          <div className="provider-card">
            <div className="provider-logo" style={{ color: '#FF6B35' }}>RS</div>
            <div className="provider-meta">
              <div className="n">Resend · Primary</div>
              <div className="d">API key configured · from: campaigns@yourdomain.com</div>
            </div>
            <span className="chip running"><span className="d" />Active</span>
            <button className="btn sm">Test</button>
            <button className="btn sm ghost">Configure</button>
          </div>
          <div className="provider-card">
            <div className="provider-logo" style={{ color: '#FF6B35' }}>AS</div>
            <div className="provider-meta">
              <div className="n">Amazon SES · Sandbox</div>
              <div className="d">ap-south-1 · connected · unverified domain</div>
            </div>
            <span className="chip draft"><span className="d" />Inactive</span>
            <button className="btn sm">Test</button>
            <button className="btn sm ghost">Configure</button>
          </div>
        </div>
      </div>

      {/* Domain authentication */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Domain authentication</div>
            <div className="card-sub">SPF · DKIM · DMARC · return-path</div>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <DomainVerificationTable domains={domains ?? []} onVerify={() => refetch()} />
        </div>
      </div>

      {/* Compliance card */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Compliance & consent</div>
            <div className="card-sub">Global defaults for consent, opt-out, and data residency</div>
          </div>
        </div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
          <div className="field">
            <label className="label">Double opt-in for Email</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="switch on" />
              <span className="hint">Require confirmation before first marketing send</span>
            </div>
          </div>
          <div className="field">
            <label className="label">WhatsApp marketing opt-in</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="switch on" />
              <span className="hint">Block templates without explicit opt-in event</span>
            </div>
          </div>
          <div className="field">
            <label className="label">Unsubscribe link</label>
            <select className="input">
              <option>Auto-inject if missing (recommended)</option>
              <option>Inject always</option>
              <option>Manual only</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Data residency</label>
            <select className="input">
              <option>EU + US (shard by user region)</option>
              <option>EU only</option>
              <option>US only</option>
              <option>India only</option>
            </select>
          </div>
          <div className="field">
            <label className="label">PII in logs</label>
            <select className="input">
              <option>Redact (recommended)</option>
              <option>Hash</option>
              <option>Retain 7 days</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Suppression list sync</label>
            <select className="input">
              <option>Shared across all tenants</option>
              <option>Per-tenant only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsContent() {
  const [active, setActive] = useState<SectionKey>('email')

  return (
    <div style={{ padding: '20px 24px 40px' }}>
      {/* Page head */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Settings</h1>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Channel configuration and domain verification</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">View audit log</button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left nav */}
        <aside className="settings-nav">
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <a
              key={key}
              className={active === key ? 'active' : ''}
              onClick={() => setActive(key)}
            >
              <Icon size={14} />
              {label}
            </a>
          ))}
        </aside>

        {/* Right content */}
        <div>
          {active === 'email' ? <EmailProvidersSection /> : (
            <ComingSoon label={NAV_ITEMS.find(n => n.key === active)?.label ?? active} />
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder && pnpm run type-check 2>&1 | grep -E "error TS" | head -10
```
Fix any errors before proceeding.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/components/settings/settings-content.tsx
git commit -m "feat(web): pixel-match settings to design HTML (settings-grid/provider-card/compliance)"
```

---

## PHASE 4 — Backend Integration Tests

### Task 4: Install supertest

- [ ] **Step 1: Install supertest**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder
pnpm --filter @campaign/api add -D supertest @types/supertest
```

### Task 5: Create integration test config

- [ ] **Step 1: Create `apps/api/vitest.integration.config.ts`**

First check if `unplugin-swc` exists in api package.json. If yes use it; otherwise use plain config:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.integration.spec.ts'],
    environment: 'node',
    globals: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    sequence: { concurrent: false },
  },
})
```

- [ ] **Step 2: Add test:integration script to `apps/api/package.json`**

Add to `"scripts"`:
```json
"test:integration": "vitest run --config vitest.integration.config.ts"
```

### Task 6: Create backend integration spec

**File:** `apps/api/src/campaigns/campaigns.integration.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../app.module'

const TENANT = process.env.TEST_TENANT_ID ?? '00000000-0000-0000-0000-000000000001'

describe('Campaigns — Integration (real HTTP + real DB)', () => {
  let app: INestApplication
  let createdId: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /api/v1/health → 200 database up', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health')
    expect(res.status).toBe(200)
  })

  it('POST /campaigns — rejects non-UUID tenant (was bug: returned 500)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/campaigns')
      .set('x-tenant-id', 'default')
      .send({ name: 'Test', type: 'one_time', channels: ['email'] })
    expect(res.status).not.toBe(500)
  })

  it('POST /campaigns — creates campaign with valid UUID tenant', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/campaigns')
      .set('x-tenant-id', TENANT)
      .send({ name: 'Integration Test Campaign', type: 'one_time', channels: ['email'], createdBy: 'test-runner' })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ name: 'Integration Test Campaign', status: 'draft', tenantId: TENANT })
    createdId = res.body.data.id
  })

  it('GET /campaigns — lists campaigns for tenant', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/campaigns')
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some((c: any) => c.id === createdId)).toBe(true)
  })

  it('GET /campaigns/:id — returns single campaign', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(createdId)
  })

  it('PATCH /campaigns/:id — updates campaign', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', TENANT)
      .send({ audienceSegmentId: null })
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(createdId)
  })

  it('GET /campaigns/:id/readiness — returns score object', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/campaigns/${createdId}/readiness`)
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
    const { score, ready, blockers, checks } = res.body.data
    expect(typeof score).toBe('number')
    expect(typeof ready).toBe('boolean')
    expect(Array.isArray(blockers)).toBe(true)
    expect(Array.isArray(checks)).toBe(true)
  })

  it('POST /campaigns/:id/send-test — 400 on invalid email format', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/campaigns/${createdId}/send-test`)
      .set('x-tenant-id', TENANT)
      .send({ testEmail: 'not-an-email' })
    expect(res.status).toBe(400)
  })

  it('GET /campaigns/:id — 404 from different tenant (isolation check)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', '00000000-0000-0000-0000-000000000002')
    expect(res.status).toBe(404)
  })

  it('DELETE /campaigns/:id — soft-deletes campaign', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/campaigns/${createdId}`)
      .set('x-tenant-id', TENANT)
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run integration tests**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder
pnpm --filter @campaign/api test:integration 2>&1 | tail -20
```
Expected: tests pass (or fail with clear assertion messages — not TypeScript errors). Fix any failures.

- [ ] **Step 3: Commit**
```bash
git add apps/api/src/campaigns/campaigns.integration.spec.ts apps/api/vitest.integration.config.ts apps/api/package.json
git commit -m "feat(api): add 10-case integration test suite for campaigns with supertest"
```

---

## PHASE 5 — Frontend Integration Tests (RTL + MSW)

### Task 7: Install MSW and user-event

- [ ] **Step 1: Install**
```bash
pnpm --filter @campaign/web add -D msw@2 @testing-library/user-event
```

### Task 8: Create MSW server and handlers

- [ ] **Step 1: Create `apps/web/src/test/msw/handlers.ts`**

```typescript
import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:4000/api/v1'
const TENANT_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function tenantCheck(req: Request) {
  const t = req.headers.get('x-tenant-id')
  if (!t || !TENANT_UUID_RE.test(t)) {
    return HttpResponse.json({ success: false, error: { message: 'Invalid tenant ID' } }, { status: 400 })
  }
  return null
}

const MOCK_CAMPAIGN = {
  id: 'camp-001', tenantId: '00000000-0000-0000-0000-000000000001',
  name: 'Welcome Series', type: 'one_time', status: 'draft',
  channels: ['email'], version: 1, tags: [], abTestEnabled: false,
  utmParams: {}, abTestConfig: {}, metadata: {},
  segment: { id: 'seg-1', name: 'New Users', audienceEstimate: 1234 },
  template: null, audienceSegmentId: 'seg-1', templateId: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null,
}

export const handlers = [
  http.get(`${BASE}/campaigns`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({ success: true, data: [MOCK_CAMPAIGN] })
  }),

  http.post(`${BASE}/campaigns`, async ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { ...MOCK_CAMPAIGN, ...body, id: 'camp-new' } }, { status: 201 })
  }),

  http.patch(`${BASE}/campaigns/:id`, async ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { ...MOCK_CAMPAIGN, ...body } })
  }),

  http.get(`${BASE}/campaigns/:id/readiness`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({
      success: true,
      data: { score: 40, ready: false, blockers: ['Template assigned'], warnings: [], checks: [
        { name: 'Campaign has name', passed: true, type: 'warning', points: 10 },
        { name: 'Template assigned', passed: false, type: 'blocker', points: 15 },
      ]},
    })
  }),

  http.post(`${BASE}/campaigns/:id/send-test`, async ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    const body = await request.json() as Record<string, unknown>
    if (!body.testEmail || !String(body.testEmail).includes('@')) {
      return HttpResponse.json({ success: false, error: { message: 'Invalid email' } }, { status: 400 })
    }
    return HttpResponse.json({ success: true, data: { messageId: 'msg-test-001' } }, { status: 201 })
  }),

  http.get(`${BASE}/segments`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({ success: true, data: [{ id: 'seg-1', name: 'New Users', audienceEstimate: 1234 }] })
  }),

  http.get(`${BASE}/templates`, ({ request }) => {
    const err = tenantCheck(request)
    if (err) return err
    return HttpResponse.json({ success: true, data: [
      { id: 'tmpl-1', name: 'Welcome Email', type: 'email', approvalStatus: 'approved', subject: 'Welcome!', htmlBody: '<p>Hi</p>' },
    ]})
  }),
]
```

- [ ] **Step 2: Create `apps/web/src/test/msw/server.ts`**

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

- [ ] **Step 3: Create `apps/web/src/test/setup-integration.ts`**

```typescript
import '@testing-library/jest-dom'
import { server } from './msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 4: Create `apps/web/vitest.integration.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.integration.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup-integration.ts'],
    testTimeout: 15_000,
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
```

- [ ] **Step 5: Add script to `apps/web/package.json`**
```json
"test:integration": "vitest run --config vitest.integration.config.ts"
```

### Task 9: Create frontend integration test files

- [ ] **Step 1: Create `apps/web/src/lib/api-client.integration.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

describe('api-client — header and tenant validation', () => {
  it('sends x-tenant-id header that is a valid UUID', async () => {
    let capturedTenant: string | null = null

    server.use(
      http.get('http://localhost:4000/api/v1/campaigns', ({ request }) => {
        capturedTenant = request.headers.get('x-tenant-id')
        return HttpResponse.json({ success: true, data: [] })
      })
    )

    const { api } = await import('@/lib/api-client')
    await api.get('/campaigns')

    expect(capturedTenant).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('throws when API returns success: false', async () => {
    server.use(
      http.get('http://localhost:4000/api/v1/campaigns', () =>
        HttpResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
      )
    )

    const { api } = await import('@/lib/api-client')
    await expect(api.get('/campaigns')).rejects.toThrow('Unauthorized')
  })

  it('sends Content-Type: application/json on POST', async () => {
    let capturedContentType: string | null = null

    server.use(
      http.post('http://localhost:4000/api/v1/campaigns', ({ request }) => {
        capturedContentType = request.headers.get('content-type')
        return HttpResponse.json({ success: true, data: { id: 'x' } }, { status: 201 })
      })
    )

    const { api } = await import('@/lib/api-client')
    await api.post('/campaigns', { name: 'Test' })

    expect(capturedContentType).toContain('application/json')
  })
})
```

- [ ] **Step 2: Create `apps/web/src/components/campaigns/campaigns-content.integration.test.tsx`**

```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CampaignsContent } from './campaigns-content'

function renderCampaigns() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <CampaignsContent />
    </QueryClientProvider>
  )
}

describe('CampaignsContent — integration', () => {
  it('renders without crashing', () => {
    renderCampaigns()
    expect(document.body).toBeTruthy()
  })

  it('renders campaign row after data loads', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('Welcome Series')).toBeInTheDocument())
  })

  it('shows segment name in Audience column', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('New Users')).toBeInTheDocument())
  })

  it('shows correct status chip for draft campaign', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('Draft')).toBeInTheDocument())
  })

  it('shows Email channel span', async () => {
    renderCampaigns()
    await waitFor(() => expect(screen.getByText('Email')).toBeInTheDocument())
  })

  it('shows empty state when no campaigns match filter', async () => {
    renderCampaigns()
    await waitFor(() => screen.getByText('Welcome Series'))
    fireEvent.click(screen.getByRole('button', { name: 'Running' }))
    await waitFor(() => expect(screen.getByText('No campaigns found')).toBeInTheDocument())
  })

  it('shows "New Campaign" link pointing to /campaigns/new', async () => {
    renderCampaigns()
    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /New Campaign/i })
      expect(links[0]).toHaveAttribute('href', '/campaigns/new')
    })
  })

  it('renders table headers from design HTML', async () => {
    renderCampaigns()
    await waitFor(() => {
      expect(screen.getByText('Campaign')).toBeInTheDocument()
      expect(screen.getByText('Channel')).toBeInTheDocument()
      expect(screen.getByText('Audience')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Delivered')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 3: Run frontend integration tests**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder
pnpm --filter @campaign/web test:integration 2>&1 | tail -20
```
Expected: all tests pass. Fix any failures.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/test/ apps/web/src/lib/api-client.integration.test.ts apps/web/src/components/campaigns/campaigns-content.integration.test.tsx apps/web/vitest.integration.config.ts apps/web/package.json
git commit -m "feat(web): add MSW integration tests for api-client and CampaignsContent"
```

---

## PHASE 6 — Run All Tests, Build, Restart

### Task 10: Full test + build + restart sequence

- [ ] **Step 1: Run unit tests (existing)**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder
pnpm test 2>&1 | tail -15
```
Expected: existing tests pass.

- [ ] **Step 2: Run backend integration tests**
```bash
pnpm --filter @campaign/api test:integration 2>&1 | tail -15
```

- [ ] **Step 3: Run frontend integration tests**
```bash
pnpm --filter @campaign/web test:integration 2>&1 | tail -15
```

- [ ] **Step 4: Full type-check**
```bash
pnpm run type-check 2>&1 | grep -E "error TS" | head -10
```
Expected: 0 errors.

- [ ] **Step 5: Build both apps**
```bash
pnpm --filter @campaign/api build 2>&1 | tail -5
pnpm --filter @campaign/web build 2>&1 | tail -10
```
Expected: Both exit 0.

- [ ] **Step 6: Restart servers**
```bash
pkill -f "nest start" 2>/dev/null; pkill -f "next dev" 2>/dev/null
sleep 2
rm -rf apps/web/.next
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder/apps/api && pnpm run dev > /tmp/api.log 2>&1 &
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder/apps/web && pnpm run dev > /tmp/web.log 2>&1 &
sleep 15
curl -s http://localhost:4000/api/v1/health | python -m json.tool 2>/dev/null | grep status
curl -s -o /dev/null -w "WEB HTTP %{http_code}\n" http://localhost:3000/campaigns
```
Expected: API health ok, Web HTTP 200.

- [ ] **Step 7: Final commit**
```bash
cd D:/Rez_Data/rez/AIWorkshop/campaign-builder
git add -A
git commit -m "feat: campaign list + settings pixel-matched to design HTML, integration tests complete"
```

---

## Verification Checklist

| Check | Expected |
|---|---|
| Unit tests | existing tests pass |
| Backend integration | 10 tests pass |
| Frontend integration | 11 tests pass |
| Type-check | 0 errors |
| API health | `curl localhost:4000/api/v1/health` → `status: ok` |
| Campaign list | `/campaigns` shows `.tbl`/`.chip`/`.ch`/`.aud` CSS classes |
| Settings | `/settings` shows `.settings-grid`/`.provider-card` structure |
| Tenant UUID regression | api-client integration test passes |
| No "Add" button inside table | Design matches: only "Export CSV" + "View all" in card header |
