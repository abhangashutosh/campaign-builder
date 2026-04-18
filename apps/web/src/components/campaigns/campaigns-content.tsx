'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { useCampaigns } from '@/hooks/use-campaigns'
import type { CampaignStatus } from '@/types'

export function CampaignsContent() {
  const { data: campaigns, isLoading } = useCampaigns()

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Manage all your email and WhatsApp campaigns"
        actions={
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--navy)' }}
          >
            <Plus size={16} />
            New Campaign
          </Link>
        }
      />

      <div
        className="rounded-lg border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
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
                <th className="px-6 py-3 font-medium">Version</th>
              </tr>
            </thead>
            <tbody>
              {campaigns?.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-6 py-3 font-medium" style={{ color: 'var(--text)' }}>
                    <Link href={`/campaigns/${c.id}`}>{c.name}</Link>
                  </td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-2)' }}>{c.type.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={c.status as CampaignStatus} />
                  </td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-2)' }}>{c.channels.join(', ')}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-2)' }}>v{c.version}</td>
                </tr>
              ))}
              {!campaigns?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center" style={{ color: 'var(--text-2)' }}>
                    No campaigns yet.{' '}
                    <Link href="/campaigns/new" style={{ color: 'var(--navy)' }}>
                      Create your first campaign
                    </Link>
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
