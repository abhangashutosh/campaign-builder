'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { useSegments } from '@/hooks/use-segments'
import { formatNumber } from '@/lib/utils'

export function AudienceContent() {
  const { data: segments, isLoading } = useSegments()

  return (
    <div>
      <PageHeader
        title="Audience"
        subtitle="Manage contact segments"
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--navy)' }}
          >
            <Plus size={16} />
            New Segment
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-sm" style={{ color: 'var(--text-2)' }}>Loading…</p>}
        {segments?.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border p-5"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{s.name}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {formatNumber(s.audienceEstimate ?? 0)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>contacts</p>
          </div>
        ))}
        {!isLoading && !segments?.length && (
          <p className="col-span-3 text-sm" style={{ color: 'var(--text-2)' }}>No segments yet.</p>
        )}
      </div>
    </div>
  )
}
