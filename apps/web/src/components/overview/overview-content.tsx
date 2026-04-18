'use client'

import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { KpiCard } from '@/components/ui/kpi-card'
import { useCampaigns } from '@/hooks/use-campaigns'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatNumber } from '@/lib/utils'
import type { CampaignStatus } from '@/types'

export function OverviewContent() {
  const { data: campaigns, isLoading } = useCampaigns()

  const active = campaigns?.filter((c) => c.status === 'running').length ?? 0
  const total = campaigns?.length ?? 0

  return (
    <div>
      <PageHeader title="Overview" subtitle="Campaign performance at a glance" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard label="Total Campaigns" value={total} trend={2.4} />
        <KpiCard label="Active Campaigns" value={active} />
        <KpiCard label="Emails Today" value="—" />
        <KpiCard label="Avg. Open Rate" value="—" trend={-1.2} />
      </div>

      <div
        className="rounded-lg border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            Active Campaigns
          </h2>
        </div>
        {isLoading ? (
          <div className="p-6 text-sm" style={{ color: 'var(--text-2)' }}>Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Channels</th>
              </tr>
            </thead>
            <tbody>
              {campaigns?.map((c) => (
                <tr key={c.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-6 py-3 font-medium" style={{ color: 'var(--text)' }}>{c.name}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-2)' }}>{c.type.replace('_', ' ')}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={c.status as CampaignStatus} />
                  </td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-2)' }}>{c.channels.join(', ')}</td>
                </tr>
              ))}
              {!campaigns?.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center" style={{ color: 'var(--text-2)' }}>
                    No campaigns yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
