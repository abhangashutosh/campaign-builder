'use client'

// SendProjection: estimated delivery info card
// Usage: <SendProjection recipients={18} scheduledFor="2026-04-22T09:30" />

import { Clock } from 'lucide-react'

interface SendProjectionProps {
  recipients: number
  scheduledFor?: string
}

function formatSchedule(iso: string): string {
  const date = new Date(iso)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month} ${day} · ${hours}:${minutes}`
}

export function SendProjection({ recipients, scheduledFor }: SendProjectionProps) {
  const scheduleLabel = scheduledFor
    ? formatSchedule(scheduledFor)
    : 'Sends immediately'

  return (
    <div
      className="rounded-lg border px-4 py-3 flex items-center gap-3"
      style={{
        background: 'var(--teal-50)',
        borderColor: 'var(--teal)',
      }}
    >
      <Clock size={16} style={{ color: 'var(--teal)', flexShrink: 0 }} />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          ~{recipients.toLocaleString()} recipients
        </span>
        <span className="text-xs" style={{ color: 'var(--text-2)' }}>
          {scheduleLabel}
        </span>
      </div>
    </div>
  )
}
