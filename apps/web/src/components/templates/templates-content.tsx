'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Grid3X3, List, Edit2, Copy, Trash2, Mail, MessageSquare, Bell, Smartphone, Globe, Monitor } from 'lucide-react'
import { useTemplates } from '@/hooks/use-templates'
import type { Template } from '@/types'

type Channel = 'all' | 'email' | 'whatsapp' | 'push' | 'sms' | 'inapp' | 'webpush'
type StatusFilter = 'all' | 'approved' | 'pending' | 'draft' | 'rejected' | 'archived'

const CHANNEL_TABS: { id: Channel; label: string; count: number; Icon?: React.ComponentType<{ size?: number }> }[] = [
  { id: 'all',      label: 'All',      count: 127 },
  { id: 'email',    label: 'Email',    count: 52,  Icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', count: 28,  Icon: MessageSquare },
  { id: 'push',     label: 'Push',     count: 18,  Icon: Bell },
  { id: 'sms',      label: 'SMS',      count: 14,  Icon: Smartphone },
  { id: 'inapp',    label: 'In-app',   count: 9,   Icon: Monitor },
  { id: 'webpush',  label: 'Web Push', count: 6,   Icon: Globe },
]

const STATUS_FILTERS = [
  { id: 'all',      label: 'All',       count: 127, dot: 'var(--navy)' },
  { id: 'approved', label: 'Approved',  count: 84,  dot: 'var(--success)' },
  { id: 'pending',  label: 'In Review', count: 12,  dot: 'var(--warning)' },
  { id: 'draft',    label: 'Draft',     count: 23,  dot: 'var(--muted)' },
  { id: 'rejected', label: 'Rejected',  count: 0,   dot: 'var(--danger)' },
  { id: 'archived', label: 'Archived',  count: 8,   dot: 'var(--muted)' },
]

const CATEGORY_FILTERS = [
  { id: 'Lifecycle',      count: 38 },
  { id: 'Promotional',    count: 24 },
  { id: 'Transactional',  count: 31 },
  { id: 'Authentication', count: 12 },
  { id: 'Utility',        count: 15 },
  { id: 'Other',          count: 7 },
]

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'approved': return 'approved'
    case 'pending':  return 'review'
    case 'draft':    return 'draft'
    case 'rejected': return 'rejected'
    default:         return 'draft'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'approved': return 'APPROVED'
    case 'pending':  return 'IN REVIEW'
    case 'draft':    return 'DRAFT'
    case 'rejected': return 'REJECTED'
    default:         return status.toUpperCase()
  }
}

function TemplatePreview({ type }: { type: string }) {
  if (type === 'whatsapp') {
    return (
      <div className="tpl-preview">
        <div className="pv-wa">
          <div className="pv-wh">Northwind</div>
          <div className="pv-l" />
          <div className="pv-l s" />
          <div className="pv-btn">View offer</div>
        </div>
      </div>
    )
  }
  if (type === 'push') {
    return (
      <div className="tpl-preview">
        <div className="pv-push">
          <div className="pv-icon">N</div>
          <div className="pv-body">
            <div className="pv-title">We miss you, Arjun</div>
            <div className="pv-msg">Your trial ends in 2 days. Jump back in and unlock automation.</div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="tpl-preview">
      <div className="pv-email">
        <div className="pv-h" />
        <div className="pv-l" />
        <div className="pv-l s" />
        <div className="pv-l m" />
        <div className="pv-l" />
        <div className="pv-l c" />
      </div>
    </div>
  )
}

function ChannelPill({ type }: { type: string }) {
  const labels: Record<string, string> = {
    email: 'Email', whatsapp: 'WhatsApp', push: 'Push', sms: 'SMS', inapp: 'In-app', webpush: 'Web Push',
  }
  const icons: Record<string, React.ComponentType<{ size?: number }>> = {
    email: Mail, whatsapp: MessageSquare, push: Bell, sms: Smartphone, inapp: Monitor, webpush: Globe,
  }
  const Icon = icons[type] ?? Mail
  return (
    <div className="tpl-channel-pill">
      <Icon size={10} />
      {labels[type] ?? type}
    </div>
  )
}

function TemplateCard({ t }: { t: Template }) {
  return (
    <div className="tpl-item">
      <TemplatePreview type={t.type} />
      <ChannelPill type={t.type} />
      <div className={`tpl-status-badge ${statusBadgeClass(t.approvalStatus)}`}>
        {statusLabel(t.approvalStatus)}
      </div>
      <div className="tpl-actions">
        <button title="Edit"><Edit2 size={12} /></button>
        <button title="Duplicate"><Copy size={12} /></button>
        <button title="Delete"><Trash2 size={12} /></button>
      </div>
      <div className="tpl-body">
        <div className="tpl-title">{t.name}</div>
        <div className="tpl-sub">{t.category ?? 'General'} · {t.type} template</div>
      </div>
      <div className="tpl-meta-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="av-xs">PK</div>
          <span>Edited {Math.floor(Math.random() * 12) + 1}h ago</span>
        </div>
        <span className="usage-pill">
          <span>●</span> in {Math.floor(Math.random() * 8) + 1}
        </span>
      </div>
    </div>
  )
}

export function TemplatesContent() {
  const { data: templates = [], isLoading, isError, error } = useTemplates()
  const [channel, setChannel]     = useState<Channel>('all')
  const [statusFilter, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory]   = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [gridView, setGridView]   = useState(true)

  const filtered = templates.filter((t) => {
    if (channel !== 'all' && t.type !== channel) return false
    if (statusFilter !== 'all' && t.approvalStatus !== statusFilter) return false
    if (category && t.category !== category.toLowerCase()) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const recent   = [...filtered]
    .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
    .slice(0, 4)
  const approved = templates.filter(t => t.approvalStatus === 'approved').length
  const pending  = templates.filter(t => t.approvalStatus === 'pending').length
  const draft    = templates.filter(t => t.approvalStatus === 'draft').length

  return (
    <div style={{ padding: '20px 24px 40px' }}>
      {/* Page head */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Templates Library</h1>
          <div className="page-sub">{templates.length || 127} templates across 6 channels · Reusable content blocks for campaigns and journeys</div>
        </div>
        <div className="page-actions">
          <button className="btn">Import</button>
          <button className="btn">Variables</button>
          <button className="btn">
            Approval queue
            <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10 }}>
              {pending || 12}
            </span>
          </button>
          <Link href="/templates/new" className="btn primary" style={{ textDecoration: 'none' }}>
            + New Template
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="tpl-stats">
        <div className="tpl-stat">
          <div className="st-label">Total</div>
          <div className="st-val">{templates.length || 127}</div>
          <div className="st-sub">+4 this week</div>
        </div>
        <div className="tpl-stat">
          <div className="st-label">Approved</div>
          <div className="st-val">{approved || 84}</div>
          <div className="st-sub"><span className="st-dot" style={{ background: 'var(--success)' }} />Ready for campaigns</div>
        </div>
        <div className="tpl-stat">
          <div className="st-label">In Review</div>
          <div className="st-val">{pending || 12}</div>
          <div className="st-sub"><span className="st-dot" style={{ background: 'var(--warning)' }} />Avg review 4h</div>
        </div>
        <div className="tpl-stat">
          <div className="st-label">Drafts</div>
          <div className="st-val">{draft || 23}</div>
          <div className="st-sub"><span className="st-dot" style={{ background: 'var(--muted)' }} />Last edited 2h ago</div>
        </div>
        <div className="tpl-stat">
          <div className="st-label">Archived</div>
          <div className="st-val">8</div>
          <div className="st-sub"><span className="st-dot" style={{ background: 'var(--muted)' }} />Auto-archived after 90d</div>
        </div>
      </div>

      {/* Channel tabs */}
      <div className="tpl-channel-tabs" style={{ marginBottom: 16 }}>
        {CHANNEL_TABS.map(({ id, label, count, Icon }) => (
          <button
            key={id}
            className={channel === id ? 'on' : ''}
            onClick={() => setChannel(id)}
          >
            {Icon && <Icon size={12} />}
            {label}
            <span className="c">{count}</span>
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-3)', fontSize: 13 }}>
          Loading templates…
        </div>
      ) : isError ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--danger)', fontSize: 13 }}>
          Failed to load templates: {(error as Error)?.message}
        </div>
      ) : (
        <div className="tpl-layout">
          {/* Left filter pane */}
          <aside className="tpl-filter-pane">
            <div>
              <h4>Status</h4>
              <div className="tpl-filter-group">
                {STATUS_FILTERS.map(f => (
                  <div
                    key={f.id}
                    className={`tpl-filter-opt${statusFilter === f.id ? ' on' : ''}`}
                    onClick={() => setStatus(f.id as StatusFilter)}
                  >
                    <span className="dot" style={{ background: f.dot }} />
                    {f.label}
                    <span className="count">{f.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="tpl-divider" />
            <div>
              <h4>Category</h4>
              <div className="tpl-filter-group">
                {CATEGORY_FILTERS.map(f => (
                  <div
                    key={f.id}
                    className={`tpl-filter-opt${category === f.id ? ' on' : ''}`}
                    onClick={() => setCategory(category === f.id ? null : f.id)}
                  >
                    {f.id}
                    <span className="count">{f.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right main */}
          <div className="tpl-main">
            {/* Toolbar */}
            <div className="tpl-toolbar">
              <div className="tpl-search">
                <Search size={13} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${filtered.length} templates by name, tag, variable, or content`}
                />
                <span style={{ fontSize: 10, color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', background: 'var(--surface)' }}>⌘K</span>
              </div>
              <div className="sep" style={{ width: 1, height: 22, background: 'var(--border-2)' }} />
              <button className="btn sm ghost">Sort: Recently modified ▾</button>
              <button className="btn sm">
                Filters{' '}
                <span style={{ background: 'var(--navy)', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 10 }}>3</span>
              </button>
              <div className="tpl-view-toggle">
                <button className={gridView ? 'on' : ''} onClick={() => setGridView(true)} title="Grid"><Grid3X3 size={13} /></button>
                <button className={!gridView ? 'on' : ''} onClick={() => setGridView(false)} title="List"><List size={13} /></button>
              </div>
            </div>

            {/* Recently modified */}
            {recent.length > 0 && (
              <div>
                <div className="tpl-section-head">
                  <h3>Recently modified <span className="n">· {recent.length} templates</span></h3>
                  <span className="sh-link">See all →</span>
                </div>
                <div className="tpl-grid">
                  {recent.map(t => <TemplateCard key={t.id} t={t} />)}
                </div>
              </div>
            )}

            {/* All templates */}
            <div>
              <div className="tpl-section-head">
                <h3>All templates <span className="n">· showing 1–{Math.min(filtered.length, 16)} of {filtered.length}</span></h3>
                <span className="sh-link">Load more</span>
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                  No templates found.{' '}
                  <Link href="/templates/new" style={{ color: 'var(--navy)', fontWeight: 600 }}>Create one →</Link>
                </div>
              ) : (
                <div className="tpl-grid">
                  {filtered.slice(0, 16).map(t => <TemplateCard key={t.id} t={t} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
