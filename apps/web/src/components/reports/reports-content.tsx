'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useCampaigns, useCampaignReports } from '@/hooks/use-campaigns'
import { FailureReasonsList } from './failure-reasons-list'
import type { Campaign } from '@/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const map: Record<Campaign['status'], { bg: string; text: string; label: string }> = {
    completed:    { bg: 'var(--success-50)', text: 'var(--success)',  label: 'Completed'    },
    running:      { bg: 'var(--navy-50)',    text: 'var(--navy)',     label: 'Running'       },
    scheduled:    { bg: 'var(--teal-50)',    text: 'var(--teal)',     label: 'Scheduled'     },
    draft:        { bg: '#F1F5F9',           text: 'var(--text-2)',   label: 'Draft'         },
    paused:       { bg: 'var(--warning-50)', text: 'var(--warning)',  label: 'Paused'        },
    failed:       { bg: 'var(--danger-50)',  text: 'var(--danger)',   label: 'Failed'        },
    needs_review: { bg: 'var(--warning-50)', text: 'var(--warning)',  label: 'Needs Review'  },
  }
  const c = map[status] ?? map.draft
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  )
}

interface KpiCardProps {
  label: string
  count: number
  subtitle?: string
}

function KpiCard({ label, count, subtitle }: KpiCardProps) {
  return (
    <div
      className="rounded-lg border p-5 flex flex-col gap-1"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <p
        className="text-3xl font-bold tabular-nums"
        style={{ color: 'var(--text)' }}
      >
        {count.toLocaleString()}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{label}</p>
      {subtitle && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</p>
      )}
    </div>
  )
}

function FunnelBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-sm w-20 text-right" style={{ color: 'var(--text-2)' }}>
        {label}
      </span>
      <div className="flex-1 rounded-full h-3" style={{ background: 'var(--border)' }}>
        <div
          className="h-3 rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm w-12 tabular-nums text-right" style={{ color: 'var(--text)' }}>
        {count.toLocaleString()}
      </span>
    </div>
  )
}

function DeltaPill({ value }: { value: string }) {
  const isPos = value.startsWith('+')
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-medium"
      style={{
        background: isPos ? 'var(--success-50)' : 'var(--danger-50)',
        color: isPos ? 'var(--success)' : 'var(--danger)',
      }}
    >
      {value}
    </span>
  )
}

function MetricInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportsContent() {
  const { data: campaigns } = useCampaigns()
  const [selectedId, setSelectedId] = useState('')
  const { data: reports } = useCampaignReports(selectedId)

  // Auto-select first completed campaign on mount
  useEffect(() => {
    if (!campaigns || selectedId) return
    const first = campaigns.find((c) => c.status === 'completed')
    if (first) setSelectedId(first.id)
  }, [campaigns, selectedId])

  const selectedCampaign = campaigns?.find((c) => c.id === selectedId) ?? null

  const sent      = reports?.sent      ?? 0
  const delivered = reports?.delivered ?? 0
  const opened    = reports?.opened    ?? 0
  const clicked   = reports?.clicked   ?? 0

  const deliveredPct = sent      > 0 ? ((delivered / sent)      * 100).toFixed(1) + '%' : '—'
  const openedPct    = delivered > 0 ? ((opened    / delivered)  * 100).toFixed(1) + '%' : '—'
  const clickedPct   = opened    > 0 ? ((clicked   / opened)     * 100).toFixed(1) + '%' : '—'

  const funnelColors = ['var(--navy)', 'var(--teal)', 'var(--warning)', 'var(--success)']

  const funnelRows = [
    { label: 'Sent',      count: sent,      color: funnelColors[0] },
    { label: 'Delivered', count: delivered, color: funnelColors[1] },
    { label: 'Opened',    count: opened,    color: funnelColors[2] },
    { label: 'Clicked',   count: clicked,   color: funnelColors[3] },
  ]

  const channelRows = [
    { metric: 'Sent',      email: sent,      whatsapp: '—', delta: '—' },
    { metric: 'Delivered', email: delivered, whatsapp: '—', delta: '—' },
    { metric: 'Opened',    email: opened,    whatsapp: '—', delta: '—' },
    { metric: 'Clicked',   email: clicked,   whatsapp: '—', delta: '—' },
  ]

  const formattedDate = selectedCampaign?.updatedAt
    ? new Date(selectedCampaign.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Reports" subtitle="Campaign delivery analytics" />

      {/* Campaign Selector */}
      <div className="mb-6">
        <label
          htmlFor="campaign-select"
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-2)' }}
        >
          Select Campaign
        </label>
        <select
          id="campaign-select"
          className="rounded-lg border px-3 py-2 text-sm min-w-64 outline-none"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text)',
            background: 'var(--card)',
          }}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a campaign…</option>
          {campaigns?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCampaign && reports && (
        <div className="space-y-6">

          {/* Section 1 — Campaign Header */}
          <div
            className="rounded-lg border px-6 py-4 flex items-center gap-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex-1">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {selectedCampaign.name}
              </h2>
              {formattedDate && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                  Completed {formattedDate}
                </p>
              )}
            </div>
            <StatusBadge status={selectedCampaign.status} />
          </div>

          {/* Section 2 — Funnel KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Sent"      count={sent}      />
            <KpiCard label="Delivered" count={delivered} subtitle={`${deliveredPct} of sent`}      />
            <KpiCard label="Opened"    count={opened}    subtitle={`${openedPct} of delivered`}    />
            <KpiCard label="Clicked"   count={clicked}   subtitle={`${clickedPct} of opened`}      />
          </div>

          {/* Section 3 — Engagement Funnel Visual Bar */}
          <SectionCard title="Engagement Funnel">
            {funnelRows.map((row) => (
              <FunnelBar
                key={row.label}
                label={row.label}
                count={row.count}
                total={sent}
                color={row.color}
              />
            ))}
          </SectionCard>

          {/* Section 4 — Channel Comparison Table */}
          <SectionCard title="Channel Comparison">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  <th className="pb-3 font-medium">Metric</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">WhatsApp</th>
                  <th className="pb-3 font-medium">Delta</th>
                </tr>
              </thead>
              <tbody>
                {channelRows.map((row) => (
                  <tr
                    key={row.metric}
                    className="border-b last:border-0"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="py-3 font-medium" style={{ color: 'var(--text)' }}>
                      {row.metric}
                    </td>
                    <td className="py-3 tabular-nums" style={{ color: 'var(--text)' }}>
                      {typeof row.email === 'number' ? row.email.toLocaleString() : row.email}
                    </td>
                    <td className="py-3" style={{ color: 'var(--text-3)' }}>
                      {row.whatsapp}
                    </td>
                    <td className="py-3">
                      {row.delta === '—' ? (
                        <span style={{ color: 'var(--text-3)' }}>—</span>
                      ) : (
                        <DeltaPill value={row.delta} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Section 5 — Failure Reasons */}
          <FailureReasonsList breakdown={reports.failureBreakdown} />

          {/* Section 6 — Additional Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricInfoCard label="Time to Engage (median)" value="4h 32m" />
            <MetricInfoCard label="Cost per Delivered"       value="$0.012"  />
          </div>

        </div>
      )}

      {!selectedId && (
        <div
          className="rounded-lg border flex flex-col items-center justify-center py-20"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-3)' }}
        >
          <p className="text-sm">Select a campaign above to view its delivery analytics.</p>
        </div>
      )}
    </div>
  )
}
