'use client'

import { PageHeader } from '@/components/ui/page-header'
import { useCampaigns, useCampaignReports } from '@/hooks/use-campaigns'
import { useState } from 'react'
import { FailureReasonsList } from './failure-reasons-list'

export function ReportsContent() {
  const { data: campaigns } = useCampaigns()
  const [selectedId, setSelectedId] = useState('')
  const { data: reports } = useCampaignReports(selectedId)

  const funnel = reports
    ? [
        { label: 'Sent', count: reports.sent },
        { label: 'Delivered', count: reports.delivered },
        { label: 'Opened', count: reports.opened },
        { label: 'Clicked', count: reports.clicked },
      ]
    : []

  return (
    <div>
      <PageHeader title="Reports" subtitle="Campaign delivery analytics" />

      <div className="mb-4">
        <select
          className="rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a campaign…</option>
          {campaigns?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {reports && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {funnel.map((f) => (
              <div
                key={f.label}
                className="rounded-lg border p-4 text-center"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{f.count.toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{f.label}</p>
              </div>
            ))}
          </div>

          <FailureReasonsList breakdown={reports.failureBreakdown} />
        </div>
      )}
    </div>
  )
}
