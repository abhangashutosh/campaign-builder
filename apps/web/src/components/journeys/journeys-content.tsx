'use client'

import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Journey } from '@/types'

export function JourneysContent() {
  const { data: journeys, isLoading } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => api.get<Journey[]>('/journeys'),
  })

  return (
    <div>
      <PageHeader
        title="Journeys"
        subtitle="Multi-step automated workflows"
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--navy)' }}
          >
            <Plus size={16} />
            New Journey
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isLoading && <p className="text-sm" style={{ color: 'var(--text-2)' }}>Loading…</p>}
        {journeys?.map((j) => (
          <div
            key={j.id}
            className="rounded-lg border p-5"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{j.name}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{j.status} · {(j.nodes as unknown[]).length} nodes</p>
          </div>
        ))}
        {!isLoading && !journeys?.length && (
          <p className="col-span-2 text-sm" style={{ color: 'var(--text-2)' }}>No journeys yet.</p>
        )}
      </div>
    </div>
  )
}
