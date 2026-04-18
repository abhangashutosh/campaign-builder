'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api-client'

interface JourneyNode {
  id: string
  type: 'trigger' | 'wait' | 'condition' | 'email' | 'goal'
  label: string
  position: { x: number; y: number }
  config?: Record<string, unknown>
  templateId?: string
}

interface Journey {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  nodes: JourneyNode[]
  entryTrigger: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

type StatusChipStyle = {
  bg: string
  color: string
}

function getStatusChipStyle(status: string): StatusChipStyle {
  switch (status) {
    case 'running':
    case 'active':
      return { bg: 'var(--success-50)', color: 'var(--success)' }
    case 'paused':
      return { bg: 'var(--warning-50)', color: 'var(--warning)' }
    case 'draft':
    case 'archived':
    default:
      return { bg: '#F1F5F9', color: 'var(--text-3)' }
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface NewJourneyModalProps {
  onClose: () => void
}

function NewJourneyModal({ onClose }: NewJourneyModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')

  const mutation = useMutation({
    mutationFn: (journeyName: string) =>
      api.post<Journey>('/journeys', {
        name: journeyName,
        status: 'draft',
        nodes: [],
        entryTrigger: { type: 'event', event: 'user_signed_up' },
      }),
    onSuccess: (newJourney) => {
      void queryClient.invalidateQueries({ queryKey: ['journeys'] })
      onClose()
      router.push(`/journeys/${newJourney.id}`)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate(name.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-lg p-6 shadow-xl"
        style={{ background: 'var(--card)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>
            New Journey
          </p>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            style={{ color: 'var(--text-3)' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="journey-name"
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-3)' }}
            >
              Journey Name
            </label>
            <input
              id="journey-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Onboarding Flow"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                background: 'var(--card)',
              }}
            />
          </div>

          {mutation.isError && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {(mutation.error as Error).message}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="flex-1 rounded-md py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ background: 'var(--navy)' }}
            >
              {mutation.isPending ? 'Creating…' : 'Create Journey'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border py-2 text-sm font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function JourneysContent() {
  const [showModal, setShowModal] = useState(false)

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
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--navy)' }}
          >
            <Plus size={16} />
            New Journey
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isLoading && (
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Loading…
          </p>
        )}

        {journeys?.map((j) => {
          const chipStyle = getStatusChipStyle(j.status)
          const entryEvent =
            typeof j.entryTrigger?.event === 'string' ? j.entryTrigger.event : 'manual'

          return (
            <Link
              key={j.id}
              href={`/journeys/${j.id}`}
              className="rounded-lg border p-5 block hover:shadow-md transition-shadow"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              {/* Top: name + status chip */}
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--text)' }}>
                  {j.name}
                </p>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                  style={{ background: chipStyle.bg, color: chipStyle.color }}
                >
                  {j.status}
                </span>
              </div>

              {/* Middle: node count + entry trigger */}
              <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
                {j.nodes.length} nodes · entry: {entryEvent}
              </p>

              {/* Bottom: created date */}
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                {formatDate(j.createdAt)}
              </p>
            </Link>
          )
        })}

        {!isLoading && !journeys?.length && (
          <p className="col-span-2 text-sm" style={{ color: 'var(--text-2)' }}>
            No journeys yet.
          </p>
        )}
      </div>

      {showModal && <NewJourneyModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
