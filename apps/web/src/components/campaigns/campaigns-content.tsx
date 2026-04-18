'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCampaigns } from '@/hooks/use-campaigns'
import type { Campaign } from '@/types'

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

export function CampaignsContent() {
  const { data: campaigns = [], isLoading } = useCampaigns()
  const [activeTab, setActiveTab]         = useState<StatusTab>('All')
  const [channelFilter, setChannelFilter] = useState<'All' | 'Email' | 'WhatsApp'>('All')
  const [page, setPage]                   = useState(1)
  const [menuOpenId, setMenuOpenId]       = useState<string | null>(null)

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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Campaigns</h1>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>All campaigns across all workspaces</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <Link href="/campaigns/new" className="btn sm primary" style={{ textDecoration: 'none' }}>
            + New Campaign
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-3)', fontSize: 13 }}>
          Loading campaigns…
        </div>
      ) : (
        <div className="card table-card">
          <div className="card-head">
            <div>
              <div className="card-title">Recent Campaigns</div>
              <div className="card-sub">Across all workspaces · {filtered.length} campaigns</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button className="btn sm ghost">Export CSV</button>
              <Link href="/campaigns" className="btn sm" style={{ textDecoration: 'none' }}>View all</Link>
            </div>
          </div>

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
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} campaigns</span>
          </div>

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
      <td className="nowrap">{fmtDate(c.scheduledFor ?? null)}</td>
      <td className="num muted">—</td>
      <td className="num muted">—</td>
      <td className="num muted">—</td>
      <td className="num muted">—</td>
      <td style={{ position: 'relative' }}>
        <button
          className="btn ghost sm"
          style={{ width: 28, height: 28, padding: 0, display: 'grid', placeItems: 'center' }}
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
