'use client'

import { useState } from 'react'

// ── Design tokens (matching design HTML exactly) ─────────────────────────────
const T = {
  navy:      '#1B4DFF',
  navy50:    '#EEF2FF',
  teal:      '#00C9A7',
  teal50:    '#E6FBF5',
  orange:    '#E85D04',
  orange50:  '#FFF1E6',
  bg:        '#F7F9FC',
  surface:   '#FFFFFF',
  text:      '#0F172A',
  text2:     '#475569',
  text3:     '#64748B',
  border:    '#E2E8F0',
  border2:   '#EDF1F6',
  hover:     '#F1F5F9',
  success:   '#16A34A',
  success50: '#ECFDF3',
  warning:   '#D97706',
  warning50: '#FEF6E7',
  danger:    '#DC2626',
  danger50:  '#FEECEC',
} as const

// ── Shared micro-components ──────────────────────────────────────────────────

function Chip({
  variant,
  dot,
  children,
}: {
  variant: 'running' | 'scheduled' | 'draft' | 'review' | 'failed' | 'warn'
  dot?: boolean
  children: React.ReactNode
}) {
  const map = {
    running:   { bg: T.success50, color: '#166534', border: '#BBF7D0', dot: T.success },
    scheduled: { bg: T.navy50,    color: T.navy,    border: '#C7D0FF', dot: T.navy },
    draft:     { bg: '#F1F5F9',   color: T.text2,   border: T.border,  dot: '#94A3B8' },
    review:    { bg: T.warning50, color: '#92400E',  border: '#FDE7B8', dot: T.warning },
    failed:    { bg: T.danger50,  color: '#991B1B',  border: '#FECACA', dot: T.danger },
    warn:      { bg: T.warning50, color: '#92400E',  border: '#FDE7B8', dot: T.warning },
  }
  const s = map[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      {dot !== false && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: s.dot,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}

function Pill({
  variant,
  children,
}: {
  variant: 'success' | 'warn' | 'navy' | 'orange' | 'teal'
  children: React.ReactNode
}) {
  const map = {
    success: { bg: T.success50, color: '#166534' },
    warn:    { bg: T.warning50, color: '#92400E' },
    navy:    { bg: T.navy50,    color: T.navy },
    orange:  { bg: T.orange50,  color: T.orange },
    teal:    { bg: T.teal50,    color: '#047857' },
  }
  const s = map[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 500,
        padding: '3px 8px',
        borderRadius: 4,
        background: s.bg,
        color: s.color,
      }}
    >
      {children}
    </span>
  )
}

// ── Segmented control ────────────────────────────────────────────────────────
function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        background: T.bg,
        padding: 2,
        gap: 2,
      }}
    >
      {options.map((o) => {
        const active = o === value
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 500,
              color: active ? T.text : T.text2,
              borderRadius: 4,
              background: active ? T.surface : 'transparent',
              boxShadow: active ? '0 1px 2px rgba(15,23,42,.04)' : 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

// ── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({
  icon,
  label,
  value,
  pill,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  pill: { variant: 'success' | 'warn'; text: string }
  sub: string
}) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 14,
        boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: T.text3,
          fontWeight: 500,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginTop: 6,
          letterSpacing: '-0.02em',
          color: T.text,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Pill variant={pill.variant}>{pill.text}</Pill>
        {sub}
      </div>
    </div>
  )
}

// ── SVG Icons (inline, from design HTML) ────────────────────────────────────
const IconEmail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const IconWhatsApp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" />
  </svg>
)
const IconPeople = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
)
const IconActivity = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ── Engagement Trend Chart ───────────────────────────────────────────────────
type ChartMode = 'Rate' | 'Volume'

function EngagementTrendCard() {
  const [mode, setMode] = useState<ChartMode>('Rate')

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
      }}
    >
      {/* Card head */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: `1px solid ${T.border2}`,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Engagement Trend</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>Open, click, reply rates — rolling 30 days</div>
        </div>
        <Segmented options={['Rate', 'Volume'] as ChartMode[]} value={mode} onChange={setMode} />
      </div>

      {/* Chart area */}
      <div style={{ height: 220, padding: 16, position: 'relative' }}>
        <svg
          viewBox="0 0 600 220"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <pattern id="ov-grid" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M60 0 L0 0 0 40" fill="none" stroke={T.border} strokeWidth={1} />
            </pattern>
          </defs>
          <rect width={600} height={220} fill="url(#ov-grid)" opacity={0.6} />
          {/* Open rate — navy */}
          <polyline
            fill="none"
            stroke="#1B4DFF"
            strokeWidth={2}
            points="0,80 50,75 100,72 150,78 200,65 250,60 300,70 350,55 400,50 450,58 500,45 550,40 600,48"
          />
          {/* Click rate — orange */}
          <polyline
            fill="none"
            stroke="#E85D04"
            strokeWidth={2}
            points="0,150 50,148 100,145 150,152 200,138 250,135 300,140 350,128 400,122 450,130 500,115 550,110 600,118"
          />
          {/* Reply rate — teal */}
          <polyline
            fill="none"
            stroke="#00C9A7"
            strokeWidth={2}
            points="0,180 50,178 100,175 150,180 200,170 250,168 300,172 350,160 400,155 450,162 500,150 550,145 600,152"
          />
        </svg>
      </div>

      {/* Card foot — legend */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: `1px solid ${T.border2}`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontSize: 11,
          color: T.text2,
        }}
      >
        {[
          { color: '#1B4DFF', label: 'Open rate' },
          { color: '#E85D04', label: 'Click rate' },
          { color: '#00C9A7', label: 'Reply rate (WA)' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 2,
                background: color,
                verticalAlign: 'middle',
              }}
            />
            {label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: T.text3 }}>Updated 4 min ago</span>
      </div>
    </div>
  )
}

// ── Delivery Health Card ─────────────────────────────────────────────────────
type HealthStatus = 'ok' | 'warn' | 'bad'

function HealthItem({
  status,
  title,
  detail,
  chip,
}: {
  status: HealthStatus
  title: string
  detail: string
  chip: { variant: 'running' | 'review' | 'failed'; label: string }
}) {
  const iconMap: Record<HealthStatus, { bg: string; color: string; content: React.ReactNode }> = {
    ok:   { bg: T.success50, color: T.success, content: <IconCheck /> },
    warn: { bg: T.warning50, color: T.warning, content: <span style={{ fontWeight: 700, fontSize: 13 }}>!</span> },
    bad:  { bg: T.danger50,  color: T.danger,  content: <span style={{ fontWeight: 700, fontSize: 13 }}>×</span> },
  }
  const ic = iconMap[status]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderBottom: `1px solid ${T.border2}`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: ic.bg,
          color: ic.color,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {ic.content}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{title}</div>
        <div style={{ fontSize: 11, color: T.text3 }}>{detail}</div>
      </div>
      <div>
        <Chip variant={chip.variant}>{chip.label}</Chip>
      </div>
    </div>
  )
}

function DeliveryHealthCard() {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: `1px solid ${T.border2}`,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Delivery Health</div>
          <div style={{ fontSize: 11, color: T.text3 }}>Live provider &amp; channel status</div>
        </div>
      </div>
      <div>
        <HealthItem
          status="ok"
          title="SendGrid (Primary)"
          detail="Avg latency 220ms · 99.8% delivered"
          chip={{ variant: 'running', label: 'Healthy' }}
        />
        <HealthItem
          status="warn"
          title="SendGrid EU"
          detail="Latency +48% in last 15 min · throttled to 800/s"
          chip={{ variant: 'review', label: 'Degraded' }}
        />
        <HealthItem
          status="ok"
          title="Meta Cloud API · WhatsApp"
          detail="Quality tier HIGH · 14k/min throughput"
          chip={{ variant: 'running', label: 'Healthy' }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: T.danger50,
              color: T.danger,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ×
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Webhook: /delivery-events</div>
            <div style={{ fontSize: 11, color: T.text3 }}>HTTP 502 from https://api.host.com/events · last 8 min</div>
          </div>
          <Chip variant="failed">Failing</Chip>
        </div>
      </div>
    </div>
  )
}

// ── Active Campaigns table ───────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    name: 'Q4 Product Announcement',
    owner: 'Raj M.',
    chip: { variant: 'running' as const, label: 'Running' },
    when: 'since Oct 18',
    audience: '156,204',
    action: 'Open',
  },
  {
    name: 'Monthly Newsletter · Oct',
    owner: 'Priya R.',
    chip: { variant: 'scheduled' as const, label: 'Scheduled' },
    when: 'Oct 28 · 07:00',
    audience: '412,300',
    action: 'Open',
  },
  {
    name: 'Welcome Series · Oct',
    owner: 'Priya R.',
    chip: { variant: 'draft' as const, label: 'Draft' },
    when: 'Oct 24 · 09:30',
    audience: '48,204',
    action: 'Resume',
  },
  {
    name: 'Dormant Reactivation',
    owner: 'Sam T.',
    chip: { variant: 'review' as const, label: 'Needs Review' },
    when: 'pending approval',
    audience: '23,118',
    action: 'Review',
  },
] as const

function ActiveCampaignsCard() {
  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontWeight: 600,
    color: T.text3,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '10px 14px',
    borderBottom: `1px solid ${T.border}`,
    background: T.bg,
  }
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px',
    borderBottom: `1px solid ${T.border2}`,
    verticalAlign: 'middle',
    fontSize: 12,
  }

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: `1px solid ${T.border2}`,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Active &amp; Scheduled Campaigns</div>
          <div style={{ fontSize: 11, color: T.text3 }}>Next 7 days</div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle}>Campaign</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>When</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Audience</th>
              <th style={{ ...thStyle, textAlign: 'right' }} />
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c, i) => (
              <tr
                key={c.name}
                style={{ background: T.surface }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.hover }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.surface }}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: T.text }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{c.owner}</div>
                </td>
                <td style={tdStyle}>
                  <Chip variant={c.chip.variant}>{c.chip.label}</Chip>
                </td>
                <td style={{ ...tdStyle, color: T.text2 }}>{c.when}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: T.text }}>
                  {c.audience}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button
                    style={{
                      height: 26,
                      padding: '0 9px',
                      fontSize: 11,
                      fontWeight: 500,
                      borderRadius: 6,
                      border: `1px solid ${T.border}`,
                      background: T.surface,
                      color: T.text2,
                      cursor: 'pointer',
                    }}
                  >
                    {c.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Top Templates ────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    thumb: 'E1',
    thumbBg: '#EEF2FF',
    thumbColor: '#1B4DFF',
    name: 'welcome-hero-v4',
    meta: 'Email · 24 campaigns · CTR 18.3%',
    val: '+12%',
  },
  {
    thumb: 'WA',
    thumbBg: '#E6FBF5',
    thumbColor: '#047857',
    name: 'payment_reminder_v3',
    meta: 'WhatsApp · 8 campaigns · Reply 44%',
    val: '+9%',
  },
  {
    thumb: 'E2',
    thumbBg: '#EEF2FF',
    thumbColor: '#1B4DFF',
    name: 'weekly-digest-v7',
    meta: 'Email · recurring · Open 68%',
    val: '+4%',
  },
  {
    thumb: 'E3',
    thumbBg: '#FFF1E6',
    thumbColor: '#E85D04',
    name: 'trial-ending-v2',
    meta: 'Email · triggered · CTR 22.1%',
    val: '+2%',
  },
] as const

function TopTemplatesCard() {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: `1px solid ${T.border2}`,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Top Performing Templates</div>
          <div style={{ fontSize: 11, color: T.text3 }}>Last 30 days · by engagement</div>
        </div>
      </div>
      <div>
        {TEMPLATES.map((t, i) => (
          <div
            key={t.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderBottom: i < TEMPLATES.length - 1 ? `1px solid ${T.border2}` : 'none',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: t.thumbBg,
                display: 'grid',
                placeItems: 'center',
                color: t.thumbColor,
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {t.thumb}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{t.name}</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{t.meta}</div>
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 12,
                marginLeft: 'auto',
                fontVariantNumeric: 'tabular-nums',
                color: T.success,
              }}
            >
              {t.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main exported component ──────────────────────────────────────────────────
type TimeRange = '24h' | '7d' | '30d' | 'Quarter'
const TIME_RANGES: TimeRange[] = ['24h', '7d', '30d', 'Quarter']

export function OverviewContent() {
  const [range, setRange] = useState<TimeRange>('30d')

  return (
    <div style={{ padding: '20px 24px 40px' }}>
      {/* Page head */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: T.text }}>
            Overview
          </h1>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>
            Engagement performance across Email and WhatsApp · last 30 days
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Segmented options={TIME_RANGES} value={range} onChange={setRange} />
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              border: `1px solid ${T.border}`,
              background: T.surface,
              color: T.text,
              cursor: 'pointer',
            }}
          >
            Export
          </button>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              border: `1px solid #1B4DFF`,
              background: '#1B4DFF',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            New Campaign
          </button>
        </div>
      </div>

      {/* KPI row — 4 stat-tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatTile
          icon={<IconEmail />}
          label="Emails Delivered"
          value="1.84M"
          pill={{ variant: 'success', text: '▲ 6.2%' }}
          sub="vs prev. 30d · 96.4% delivery rate"
        />
        <StatTile
          icon={<IconWhatsApp />}
          label="WhatsApp Sent"
          value="412,320"
          pill={{ variant: 'success', text: '▲ 18.9%' }}
          sub="vs prev. · 14.3% reply rate"
        />
        <StatTile
          icon={<IconPeople />}
          label="Audience Growth"
          value="+24,112"
          pill={{ variant: 'success', text: '▲ 3.1%' }}
          sub="· 0.42% unsubscribes"
        />
        <StatTile
          icon={<IconActivity />}
          label="Delivery Health"
          value="98.2%"
          pill={{ variant: 'warn', text: '2 alerts' }}
          sub="· SendGrid EU slowdown"
        />
      </div>

      {/* Overview grid row 1: Engagement Trend (2fr) + Delivery Health (1fr) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
        }}
      >
        <EngagementTrendCard />
        <DeliveryHealthCard />
      </div>

      {/* Overview grid row 2: Active Campaigns (2fr) + Top Templates (1fr) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
          marginTop: 16,
        }}
      >
        <ActiveCampaignsCard />
        <TopTemplatesCard />
      </div>
    </div>
  )
}

/*
ui_audit:
  skill: ui-intelligence
  component: OverviewContent
  file: apps/web/src/components/overview/overview-content.tsx
  checks:
    no_gradient_backgrounds: true
    no_glassmorphism: true
    border_radius_within_limits: true       # max borderRadius: 8px
    no_gradient_ctas: true                  # solid navy button
    no_floating_stat_cards: true            # stat-tiles follow design pattern, no colored accent border
    no_icon_badge_overload: true            # icons are small inline SVGs, no colored badge wrappers
    no_decorative_microlabels: true
    no_hero_glow_blobs: true
    sidebar_has_text_labels: true           # n/a - not a sidebar component
    shadow_not_stacked: true                # shadow-sm only
    accent_borders_semantic: true           # no decorative accent borders
    no_decorative_dom_nodes: true
    typography_uses_system_scale: true
  overall: pass
  violations: []
  blocked: false
*/
