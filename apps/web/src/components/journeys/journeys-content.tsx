'use client'
import { useState } from 'react'
import { useJourneys } from '@/hooks/use-journeys'
import type { Journey } from '@/types'

// ── Node palette config ────────────────────────────────────────────────────

const PALETTE = [
  {
    section: 'ENTRY',
    items: [
      { icon: '⚡', label: 'Event Trigger',   color: '#F0FDF4', iconColor: 'var(--success)' },
      { icon: '👥', label: 'Segment Entry',   color: '#EEF2FF', iconColor: 'var(--navy)' },
      { icon: '📅', label: 'Date/Schedule',   color: '#FFF7ED', iconColor: 'var(--orange)' },
    ],
  },
  {
    section: 'LOGIC',
    items: [
      { icon: '?',  label: 'Condition Split', color: '#FFF7ED', iconColor: 'var(--orange)' },
      { icon: '⏱', label: 'Wait',            color: '#F1F5F9', iconColor: 'var(--text-2)' },
      { icon: '⚖', label: 'A/B Split',       color: '#FFF7ED', iconColor: 'var(--orange)' },
      { icon: '✓',  label: 'Segment Check',  color: '#F0FDF4', iconColor: 'var(--success)' },
    ],
  },
  {
    section: 'SEND',
    items: [
      { icon: '✉', label: 'Send Email',      color: '#EEF2FF', iconColor: 'var(--navy)' },
      { icon: '💬', label: 'Send WhatsApp',  color: '#F0FDF4', iconColor: 'var(--success)' },
      { icon: '<>', label: 'Webhook / API',  color: '#F1F5F9', iconColor: 'var(--text-2)' },
    ],
  },
]

// ── Static demo journey (Trial Activation Flow from design) ───────────────

interface DemoNode {
  id: string
  type: string
  x: number
  y: number
  label: string
  meta: string | null
  stat: string | null
  branches?: Array<{ label: string; cls: string }>
  color: string
}

const DEMO_NODES: DemoNode[] = [
  {
    id: 'n1', type: 'entry', x: 80, y: 40,
    label: 'Entry · Event Trigger',
    meta: 'event = trial_started',
    stat: '8,412 entered',
    color: 'var(--success)',
  },
  {
    id: 'n2', type: 'wait', x: 340, y: 40,
    label: 'Wait',
    meta: '1 day · respect quiet hours',
    stat: 'avg 23h 04m',
    color: 'var(--text-2)',
  },
  {
    id: 'n3', type: 'condition', x: 600, y: 40,
    label: 'Condition Split',
    meta: 'completed_profile = true?',
    stat: null,
    branches: [{ label: '62% YES', cls: 'yes' }, { label: '38% NO', cls: 'no' }],
    color: 'var(--orange)',
  },
]

// ── Journey list view ──────────────────────────────────────────────────────

function statusChipClass(status: string): string {
  switch (status) {
    case 'active':   return 'running'
    case 'paused':   return 'paused'
    case 'draft':    return 'draft'
    case 'archived': return 'completed'
    default:         return 'draft'
  }
}

function JourneyCard({ j, onClick, active }: { j: Journey; onClick: () => void; active: boolean }) {
  const nodeCount = Array.isArray(j.nodes) ? j.nodes.length : 0
  const entryEvent =
    j.entryTrigger && typeof j.entryTrigger['event'] === 'string'
      ? j.entryTrigger['event']
      : 'event_trigger'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        cursor: 'pointer',
        boxShadow: active ? '0 0 0 3px var(--navy-50)' : 'var(--shadow-sm)',
        transition: 'all .12s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{j.name}</div>
        <span className={`chip ${statusChipClass(j.status)}`}>
          <span className="d" />
          {j.status === 'active' ? 'Running' : j.status.charAt(0).toUpperCase() + j.status.slice(1)}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
        {nodeCount} nodes · entry: {entryEvent}
      </div>
    </div>
  )
}

// ── Canvas ──────────────────────────────────────────────────────────────────

function JourneyCanvas({ journey: _journey }: { journey: Journey | null }) {
  const [selected, setSelected] = useState<string | null>('n3')

  const nodes = DEMO_NODES

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Canvas */}
      <div className="journey-canvas" style={{ flex: 1 }}>
        <div className="canvas-inner">
          {/* SVG arrows */}
          <svg
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none', overflow: 'visible',
            }}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="var(--muted)" />
              </marker>
            </defs>
            {/* Entry → Wait */}
            <line x1="316" y1="90" x2="376" y2="90" stroke="var(--muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            {/* Wait → Condition */}
            <line x1="578" y1="90" x2="636" y2="90" stroke="var(--muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            {/* Condition → NO branch (curved down) */}
            <path d="M 720 120 Q 720 200 620 220" stroke="var(--danger)" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" strokeDasharray="4 2" />
          </svg>

          {/* Nodes */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 60, paddingTop: 40 }}>
            {nodes.map(n => (
              <div
                key={n.id}
                className={`flow-node${selected === n.id ? ' selected' : ''}`}
                onClick={() => setSelected(n.id)}
                style={{ flexShrink: 0 }}
              >
                <div className="fn-label">
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: n.color, display: 'inline-block', opacity: 0.2,
                  }} />
                  {n.label}
                </div>
                {n.meta && <div className="fn-meta">{n.meta}</div>}
                {n.stat && (
                  <div className="fn-stat">{n.stat}</div>
                )}
                {n.branches && (
                  <div className="fn-branches">
                    {n.branches.map(b => (
                      <span key={b.cls} className={`fn-branch ${b.cls}`}>{b.label}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspector */}
      <div className="journey-inspector" style={{ width: 280, flexShrink: 0 }}>
        <div className="inspector-head">
          <div className="ih-title">Inspector · Condition Split</div>
          <div className="ih-sub">Node ID: cnd_8f21</div>
        </div>
        <div className="inspector-body">
          <div className="inspector-field">
            <label>Node name</label>
            <div className="if-val">Profile completed?</div>
          </div>
          <div className="inspector-field">
            <label>Condition</label>
            <select><option>Event performed</option></select>
            <select style={{ marginTop: 6 }}><option>completed_profile</option></select>
            <select style={{ marginTop: 6 }}><option>within last 1 day</option></select>
          </div>
          <div className="inspector-field">
            <label>Branch routing</label>
            <div className="branch-routing">
              <div className="branch-row">
                <span className="branch-dot" style={{ background: 'var(--success)' }} />
                <strong style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', marginRight: 4 }}>YES</strong>
                → Send Email · activation-success-v2
              </div>
              <div className="branch-row">
                <span className="branch-dot" style={{ background: 'var(--danger)' }} />
                <strong style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', marginRight: 4 }}>NO</strong>
                → Send WhatsApp · nudge_activation
              </div>
            </div>
          </div>
          <div className="inspector-field">
            <label>Max users per branch (24h)</label>
            <div className="if-val">10,000</div>
          </div>
          <div className="inspector-stat">
            Users who&apos;ve reached this node in the last 7d: <strong>8,412</strong> · avg routing time: <strong>0.4s</strong>
          </div>
        </div>
        <div className="inspector-foot">
          <button className="btn sm" style={{ flex: 1 }}>Duplicate</button>
          <button className="btn sm danger-outline" style={{ flex: 1 }}>Remove</button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function JourneysContent() {
  const { data: journeys = [], isLoading, isError, error } = useJourneys()
  const [selectedJourney, setSelected] = useState<Journey | null>(null)
  const [view, setView] = useState<'list' | 'canvas'>('list')

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-3)', fontSize: 13 }}>
      Loading journeys…
    </div>
  )

  if (isError) return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--danger)', fontSize: 13 }}>
      Failed to load journeys: {(error as Error)?.message}
    </div>
  )

  if (view === 'canvas' && selectedJourney) {
    return (
      <div style={{ height: 'calc(100vh - var(--header-h))', display: 'flex', flexDirection: 'column' }}>
        {/* Canvas header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', gap: 16,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              Journey · {selectedJourney.name}
            </h1>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
              {Array.isArray(selectedJourney.nodes) ? selectedJourney.nodes.length : 7} nodes · 2 branches · entry: trial_started
              <span className={`chip ${statusChipClass(selectedJourney.status)}`} style={{ fontSize: 11 }}>
                <span className="d" />
                {selectedJourney.status === 'active' ? 'Running' : selectedJourney.status}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setView('list')}>← Back to journeys</button>
            <button className="btn">Version history</button>
            <button className="btn">Simulate</button>
            <button className="btn">Pause</button>
            <button className="btn primary">Publish v4</button>
          </div>
        </div>

        {/* Three-panel layout */}
        <div className="journey-layout" style={{ flex: 1, overflow: 'hidden' }}>
          {/* Node palette */}
          <div className="node-palette">
            {PALETTE.map(section => (
              <div key={section.section} className="palette-section">
                <div className="palette-label">{section.section}</div>
                {section.items.map(item => (
                  <div key={item.label} className="palette-item">
                    <div className="pi-icon" style={{ background: item.color, color: item.iconColor }}>
                      {item.icon}
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Canvas + Inspector (spans the remaining 2 columns) */}
          <div style={{ gridColumn: '2 / 4', display: 'flex', overflow: 'hidden' }}>
            <JourneyCanvas journey={selectedJourney} />
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div style={{ padding: '20px 24px 40px' }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Journeys</h1>
          <div className="page-sub">{journeys.length} automation flows · multi-step customer journeys</div>
        </div>
        <div className="page-actions">
          <button className="btn">Import</button>
          <button className="btn primary">+ New Journey</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {journeys.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            color: 'var(--text-3)', fontSize: 13,
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>No journeys yet</div>
            <button className="btn primary">Create your first journey →</button>
          </div>
        ) : (
          journeys.map(j => (
            <JourneyCard
              key={j.id}
              j={j}
              active={selectedJourney?.id === j.id}
              onClick={() => {
                setSelected(j)
                setView('canvas')
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
