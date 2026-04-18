'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/page-header'
import { useSegments } from '@/hooks/use-segments'
import { api } from '@/lib/api-client'
import type { Segment } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterField = 'lifecycle_stage' | 'has_email_consent' | 'lead_score'
type FilterOp = 'is' | 'is_not' | 'greater_than' | 'less_than'

interface NewSegmentForm {
  name: string
  description: string
  filterField: FilterField
  filterOp: FilterOp
  filterValue: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ segments }: { segments: Segment[] }) {
  const totalContacts = segments.reduce((sum, s) => sum + (s.audienceEstimate ?? 0), 0)

  const stats = [
    { label: 'Total Contacts', value: formatNumber(totalContacts) },
    { label: 'Active Segments', value: segments.length },
  ]

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {stats.map(s => (
        <div
          key={s.label}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
            {s.value}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Segment Table ────────────────────────────────────────────────────────────

function SegmentTable({
  segments,
}: {
  segments: Segment[]
}) {
  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontWeight: 500,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--text-3)',
    textAlign: 'left',
  }

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '13px',
    color: 'var(--text)',
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--card)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={thStyle}>Segment Name</th>
            <th style={thStyle}>Contacts</th>
            <th style={thStyle}>Refresh</th>
            <th style={thStyle}>Created</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {segments.length === 0 && (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, color: 'var(--text-2)', textAlign: 'center', padding: '24px' }}>
                No segments yet.
              </td>
            </tr>
          )}
          {segments.map((s, idx) => (
            <tr
              key={s.id}
              style={{
                borderTop: idx === 0 ? undefined : '1px solid var(--border)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Name */}
              <td style={tdStyle}>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
              </td>

              {/* Contacts */}
              <td style={tdStyle}>
                <span style={{ fontWeight: 700 }}>{formatNumber(s.audienceEstimate ?? 0)}</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>
                  contacts
                </span>
              </td>

              {/* Refresh cadence */}
              <td style={tdStyle}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: '#F1F5F9',
                    color: 'var(--text-2)',
                    textTransform: 'capitalize',
                  }}
                >
                  {s.refreshCadence.replace('_', ' ')}
                </span>
              </td>

              {/* Created */}
              <td style={{ ...tdStyle, color: 'var(--text-2)' }}>
                {formatDate(s.createdAt)}
              </td>

              {/* Actions */}
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '5px',
                      border: '1px solid var(--border)',
                      background: '#fff',
                      color: 'var(--text-2)',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    disabled
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '5px',
                      border: '1px solid var(--danger-50)',
                      background: '#fff',
                      color: 'var(--danger)',
                      cursor: 'not-allowed',
                      opacity: 0.5,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── New Segment Modal ────────────────────────────────────────────────────────

const FIELD_OPTIONS: { value: FilterField; label: string }[] = [
  { value: 'lifecycle_stage', label: 'Lifecycle Stage' },
  { value: 'has_email_consent', label: 'Has Email Consent' },
  { value: 'lead_score', label: 'Lead Score' },
]

const OP_OPTIONS: { value: FilterOp; label: string }[] = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
]

const INITIAL_FORM: NewSegmentForm = {
  name: '',
  description: '',
  filterField: 'lifecycle_stage',
  filterOp: 'is',
  filterValue: '',
}

function NewSegmentModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<NewSegmentForm>(INITIAL_FORM)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: NewSegmentForm) =>
      api.post<Segment>('/segments', {
        name: data.name,
        rules: {
          include: [{ field: data.filterField, op: data.filterOp, value: data.filterValue }],
          exclude: [],
        },
        refreshCadence: 'on_demand',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['segments'] })
      onClose()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    mutation.mutate(form)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: '#fff',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-2)',
    marginBottom: '4px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '448px',
          padding: '24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>New Segment</h2>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Segment Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Active Trial Users"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What does this segment capture?"
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Filter condition */}
          <div>
            <label style={labelStyle}>Filter Condition</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {/* Field */}
              <select
                value={form.filterField}
                onChange={e => setForm(f => ({ ...f, filterField: e.target.value as FilterField }))}
                style={inputStyle}
              >
                {FIELD_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Operator */}
              <select
                value={form.filterOp}
                onChange={e => setForm(f => ({ ...f, filterOp: e.target.value as FilterOp }))}
                style={inputStyle}
              >
                {OP_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Value */}
              <input
                type="text"
                value={form.filterValue}
                onChange={e => setForm(f => ({ ...f, filterValue: e.target.value }))}
                placeholder="Value"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: '#fff',
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '6px',
                border: 'none',
                background: 'var(--navy)',
                color: '#fff',
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'Saving…' : 'Create Segment'}
            </button>
          </div>

          {mutation.isError && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', margin: 0 }}>
              {(mutation.error as Error).message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AudienceContent() {
  const { data: segments = [], isLoading } = useSegments()
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <PageHeader
        title="Audience"
        subtitle="Manage contact segments"
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              background: 'var(--navy)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            New Segment
          </button>
        }
      />

      {!isLoading && <StatsBar segments={segments} />}

      {isLoading && (
        <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px' }}>Loading…</p>
      )}

      {!isLoading && <SegmentTable segments={segments} />}

      {showModal && <NewSegmentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
