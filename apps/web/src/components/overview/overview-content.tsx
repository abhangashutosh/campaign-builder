'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { KpiCard } from '@/components/ui/kpi-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { useCampaigns } from '@/hooks/use-campaigns'
import type { Campaign, CampaignStatus } from '@/types'

// ── Inline ChannelPill ───────────────────────────────────────────────────────
function ChannelPill({ channel }: { channel: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    email:    { bg: 'var(--navy-50)',  color: 'var(--navy)' },
    whatsapp: { bg: 'var(--teal-50)',  color: 'var(--teal)' },
  }
  const c = config[channel] ?? { bg: 'var(--border)', color: 'var(--text-2)' }
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize"
      style={{ background: c.bg, color: c.color }}
    >
      {channel}
    </span>
  )
}

// ── Time-range filter ────────────────────────────────────────────────────────
const TIME_RANGES = ['24h', '7d', '30d', 'Quarter'] as const
type TimeRange = (typeof TIME_RANGES)[number]

// ── Table column header ──────────────────────────────────────────────────────
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-5 py-3 font-medium text-xs uppercase tracking-wide${right ? ' text-right' : ''}`}
      style={{ color: 'var(--text-3)' }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  right,
  muted,
}: {
  children: React.ReactNode
  right?: boolean
  muted?: boolean
}) {
  return (
    <td
      className={`px-5 py-3.5${right ? ' text-right tabular-nums' : ''}`}
      style={{ color: muted ? 'var(--text-3)' : 'var(--text)' }}
    >
      {children}
    </td>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function OverviewContent() {
  const [range, setRange] = useState<TimeRange>('30d')
  const { data: campaigns, isLoading } = useCampaigns()

  // KPI derivations
  const completedCount = campaigns?.filter((c) => c.status === 'completed').length ?? 0
  const emailsDelivered = completedCount * 482

  return (
    <div>
      <PageHeader title="Overview" subtitle="Campaign performance at a glance" />

      {/* Time-range tabs */}
      <div
        className="flex items-center gap-1 mb-6 border rounded-lg w-fit p-1"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      >
        {TIME_RANGES.map((r) => {
          const active = r === range
          return (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--card)' : 'transparent',
                color: active ? 'var(--navy)' : 'var(--text-2)',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {r}
            </button>
          )
        })}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          label="Emails Delivered"
          value={isLoading ? '—' : emailsDelivered.toLocaleString()}
          trend={4.2}
        />
        <KpiCard label="WhatsApp Sent" value="0" />
        <KpiCard label="Audience Growth" value="+25" trend={1.8} />
        <KpiCard label="Delivery Health" value="98.2%" trend={0.3} />
      </div>

      {/* All-campaigns table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Table header row */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            All Campaigns
          </h2>
          <span className="text-sm" style={{ color: 'var(--text-3)' }}>
            {campaigns?.length ?? 0} total
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-sm text-center" style={{ color: 'var(--text-2)' }}>
            Loading campaigns…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  className="border-b text-left"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                >
                  <Th>Name</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                  <Th right>Delivered</Th>
                  <Th right>Opened</Th>
                  <Th right>Clicked</Th>
                  <Th right>Replies</Th>
                </tr>
              </thead>
              <tbody>
                {campaigns?.map((c: Campaign) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0"
                    style={{
                      borderColor: 'var(--border)',
                    }}
                  >
                    <Td>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        {c.name}
                      </span>
                      {c.description && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                          {c.description}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {c.channels.map((ch) => (
                          <ChannelPill key={ch} channel={ch} />
                        ))}
                      </div>
                    </Td>
                    <Td>
                      <StatusBadge status={c.status as CampaignStatus} />
                    </Td>
                    <Td right muted>—</Td>
                    <Td right muted>—</Td>
                    <Td right muted>—</Td>
                    <Td right muted>—</Td>
                  </tr>
                ))}
                {!campaigns?.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm"
                      style={{ color: 'var(--text-2)' }}
                    >
                      No campaigns yet. Full metrics are available in the Reports page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
