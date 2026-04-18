'use client'

import { useState } from 'react'

// ── Design tokens ────────────────────────────────────────────────────────────
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
  muted:     '#94A3B8',
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

// ── Pill component ───────────────────────────────────────────────────────────
function Pill({
  variant,
  children,
}: {
  variant: 'success' | 'danger'
  children: React.ReactNode
}) {
  const map = {
    success: { bg: T.success50, color: '#166534' },
    danger:  { bg: T.danger50,  color: '#991B1B' },
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
function Segmented<TOption extends string>({
  options,
  value,
  onChange,
}: {
  options: TOption[]
  value: TOption
  onChange: (v: TOption) => void
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
              whiteSpace: 'nowrap',
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

// ── Btn helper ───────────────────────────────────────────────────────────────
function Btn({
  variant = 'default',
  size = 'md',
  children,
  onClick,
  style: extraStyle,
}: {
  variant?: 'default' | 'primary' | 'ghost'
  size?: 'sm' | 'md'
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const height = size === 'sm' ? 26 : 32
  const padding = size === 'sm' ? '0 9px' : '0 12px'
  const fontSize = size === 'sm' ? 11 : 12

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: T.navy, color: '#fff', border: `1px solid ${T.navy}` }
      : variant === 'ghost'
      ? { background: 'transparent', color: T.text2, border: '1px solid transparent' }
      : { background: T.surface, color: T.text, border: `1px solid ${T.border}` }

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height,
        padding,
        borderRadius: 6,
        fontSize,
        fontWeight: 500,
        cursor: 'pointer',
        ...variantStyle,
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

// ── Select element ───────────────────────────────────────────────────────────
function Select({
  options,
  defaultValue,
}: {
  options: string[]
  defaultValue?: string
}) {
  return (
    <select
      defaultValue={defaultValue ?? options[0]}
      style={{
        height: 32,
        padding: '0 26px 0 10px',
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        background: `${T.surface} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748B'%3E%3Cpath d='M5.5 7.5L10 12l4.5-4.5'/%3E%3C/svg%3E") no-repeat right 8px center / 14px`,
        fontSize: 12,
        color: T.text,
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

// ── InputGroup ───────────────────────────────────────────────────────────────
function InputGroup({ value, suffix }: { value: string; suffix?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        padding: '0 10px',
        height: 32,
        background: T.surface,
        minWidth: 80,
      }}
    >
      <input
        defaultValue={value}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          fontSize: 12,
          color: T.text,
          textAlign: suffix ? 'right' : 'left',
        }}
      />
      {suffix && (
        <span style={{ fontSize: 11, color: T.text3, flexShrink: 0 }}>{suffix}</span>
      )}
    </div>
  )
}

// ── Logic pill ───────────────────────────────────────────────────────────────
function LogicPill({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: T.text3,
        padding: '2px 6px',
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  )
}

// ── Logic toggle (ALL / ANY) ─────────────────────────────────────────────────
function LogicToggle({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        border: `1px solid ${T.border}`,
        borderRadius: 4,
        overflow: 'hidden',
        fontSize: 11,
      }}
    >
      {options.map((o) => {
        const active = o === value
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            style={{
              padding: '2px 8px',
              color: active ? '#fff' : T.text2,
              fontWeight: 600,
              background: active ? T.navy : 'transparent',
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

// ── Rule (a single condition row) ────────────────────────────────────────────
function Rule({
  logicLabel,
  col1Options,
  col2Options,
  col3Options,
  col4,
}: {
  logicLabel: string
  col1Options: string[]
  col2Options: string[]
  col3Options: string[]
  col4?: { type: 'select'; options: string[] } | { type: 'input'; value: string; suffix?: string }
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr 1fr auto',
        gap: 8,
        padding: 8,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        background: T.bg,
        marginBottom: 6,
        alignItems: 'center',
      }}
    >
      <LogicPill label={logicLabel} />
      <Select options={col1Options} />
      <Select options={col2Options} />
      <Select options={col3Options} />
      {col4?.type === 'select' ? (
        <Select options={col4.options} />
      ) : col4?.type === 'input' ? (
        <InputGroup value={col4.value} suffix={col4.suffix} />
      ) : null}
    </div>
  )
}

// ── INCLUDE rule group ───────────────────────────────────────────────────────
function IncludeGroup() {
  const [logic, setLogic] = useState('ALL')

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.success}`,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
      }}
    >
      {/* Group head */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          fontSize: 12,
          fontWeight: 600,
          color: T.text,
          flexWrap: 'wrap',
        }}
      >
        <Pill variant="success">INCLUDE</Pill>
        Match
        <LogicToggle options={['ALL', 'ANY']} value={logic} onChange={setLogic} />
        of the following
        <button
          style={{
            marginLeft: 'auto',
            height: 26,
            padding: '0 9px',
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 6,
            border: `1px solid ${T.border}`,
            background: 'transparent',
            color: T.text2,
            cursor: 'pointer',
          }}
        >
          Duplicate group
        </button>
      </div>

      {/* Rules */}
      <Rule
        logicLabel="WHERE"
        col1Options={['Profile attribute', 'Event', 'Computed trait']}
        col2Options={['signup_date', 'plan_tier', 'country']}
        col3Options={['is within last', 'equals', 'is not']}
        col4={{ type: 'input', value: '7', suffix: 'days' }}
      />
      <Rule
        logicLabel="AND"
        col1Options={['Profile attribute']}
        col2Options={['consent.email', 'consent.whatsapp']}
        col3Options={['equals']}
        col4={{ type: 'select', options: ['granted', 'denied'] }}
      />
      <Rule
        logicLabel="AND"
        col1Options={['Event']}
        col2Options={['completed_profile']}
        col3Options={['has not been performed', 'has been performed']}
        col4={{ type: 'input', value: 'in last 7d' }}
      />

      {/* Add buttons */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 8,
          paddingTop: 10,
          borderTop: `1px dashed ${T.border}`,
        }}
      >
        <Btn size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add condition
        </Btn>
        <Btn size="sm" variant="ghost">Add nested group</Btn>
      </div>
    </div>
  )
}

// ── EXCLUDE rule group ───────────────────────────────────────────────────────
function ExcludeGroup() {
  const [logic, setLogic] = useState('ANY')

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.danger}`,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
      }}
    >
      {/* Group head */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          fontSize: 12,
          fontWeight: 600,
          color: T.text,
          flexWrap: 'wrap',
        }}
      >
        <Pill variant="danger">EXCLUDE</Pill>
        <LogicToggle options={['ALL', 'ANY']} value={logic} onChange={setLogic} />
        of the following
      </div>

      <Rule
        logicLabel="WHERE"
        col1Options={['Profile attribute']}
        col2Options={['lifecycle_stage']}
        col3Options={['equals']}
        col4={{ type: 'select', options: ['internal_test', 'churned'] }}
      />
      <Rule
        logicLabel="OR"
        col1Options={['Event']}
        col2Options={['unsubscribed']}
        col3Options={['has been performed']}
        col4={{ type: 'input', value: 'ever' }}
      />

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 8,
          paddingTop: 10,
          borderTop: `1px dashed ${T.border}`,
        }}
      >
        <Btn size="sm">Add exclusion</Btn>
      </div>
    </div>
  )
}

// ── Segment settings card ────────────────────────────────────────────────────
type Cadence = 'Every 15 min' | 'Hourly' | 'Daily' | 'Manual'
const CADENCES: Cadence[] = ['Every 15 min', 'Hourly', 'Daily', 'Manual']

function SegmentSettings() {
  const [cadence, setCadence] = useState<Cadence>('Every 15 min')

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 14,
        marginTop: 16,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          flexWrap: 'wrap',
        }}
      >
        <strong style={{ color: T.text }}>Segment settings</strong>
        <span style={{ color: T.text2, marginLeft: 4 }}>Refresh cadence</span>
        <div style={{ marginLeft: 'auto' }}>
          <Segmented options={CADENCES} value={cadence} onChange={setCadence} />
        </div>
      </div>
    </div>
  )
}

// ── Segment Summary aside ────────────────────────────────────────────────────
function SegmentSummary() {
  return (
    <aside
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(15,23,42,.04)',
        position: 'sticky',
        top: 'calc(56px + 16px)',
        overflow: 'hidden',
      }}
    >
      {/* Audience estimate */}
      <div
        style={{
          padding: 16,
          borderBottom: `1px solid ${T.border2}`,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 500, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          AUDIENCE ESTIMATE
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            marginTop: 4,
            color: T.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          48,204{' '}
          <span style={{ fontSize: 12, color: T.text3, fontWeight: 500 }}>users</span>
        </div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>
          Refreshed 2 min ago · 0.9% of active audience
        </div>
      </div>

      {/* Channel split */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border2}` }}>
        <div
          style={{
            fontSize: 11,
            color: T.text2,
            fontWeight: 500,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Reachable by channel</span>
          <span style={{ color: T.muted }}>of 48,204</span>
        </div>

        {/* Stacked bar */}
        <div
          style={{
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
            background: T.border,
            display: 'flex',
            marginTop: 8,
          }}
        >
          <div style={{ width: '64%', background: T.navy }} />
          <div style={{ width: '22%', background: T.teal }} />
          <div style={{ width: '14%', background: T.border }} />
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 8,
            fontSize: 11,
            color: T.text2,
            flexWrap: 'wrap',
          }}
        >
          {[
            { color: T.navy, label: 'Email 30,850' },
            { color: T.teal, label: 'WA 10,620' },
            { color: T.border, label: 'Neither 6,734' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  display: 'inline-block',
                  background: color,
                  verticalAlign: 'middle',
                }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Geo concentration */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${T.border2}`,
          fontSize: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <span style={{ color: T.text2 }}>Geo concentration</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { geo: 'India',          pct: '38%' },
            { geo: 'United States',  pct: '22%' },
            { geo: 'United Kingdom', pct: '11%' },
            { geo: 'Germany',        pct: '7%' },
            { geo: 'Other',          pct: '22%', muted: true },
          ].map(({ geo, pct, muted }) => (
            <div
              key={geo}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: muted ? T.text3 : T.text,
              }}
            >
              <span>{geo}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: T.muted }}>{pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview button */}
      <div style={{ padding: '12px 16px' }}>
        <button
          style={{
            width: '100%',
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
          Preview sample of 100 users
        </button>
      </div>
    </aside>
  )
}

// ── Main exported component ──────────────────────────────────────────────────
export function AudienceContent() {
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
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              margin: 0,
              color: T.text,
            }}
          >
            Segment · New users · last 7 days
          </h1>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>
            Dynamic segment · auto-refreshing every 15 min
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Btn variant="default">Discard</Btn>
          <Btn variant="default">Save as draft</Btn>
          <Btn variant="primary">Save Segment</Btn>
        </div>
      </div>

      {/* segment-wrap: rule builder + summary aside */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT: rule builder */}
        <div>
          <IncludeGroup />
          <ExcludeGroup />
          <SegmentSettings />
        </div>

        {/* RIGHT: summary */}
        <SegmentSummary />
      </div>
    </div>
  )
}

/*
ui_audit:
  skill: ui-intelligence
  component: AudienceContent
  file: apps/web/src/components/audience/audience-content.tsx
  checks:
    no_gradient_backgrounds: true
    no_glassmorphism: true
    border_radius_within_limits: true       # max 8px on cards, 6px on inputs/buttons
    no_gradient_ctas: true                  # solid navy primary button
    no_floating_stat_cards: true            # audience estimate follows inline pattern
    no_icon_badge_overload: true            # no colored icon badges
    no_decorative_microlabels: true
    no_hero_glow_blobs: true
    sidebar_has_text_labels: true           # n/a
    shadow_not_stacked: true                # shadow-sm only
    accent_borders_semantic: true           # left border = semantic (success=include, danger=exclude)
    no_decorative_dom_nodes: true
    typography_uses_system_scale: true
  overall: pass
  violations: []
  blocked: false
*/
