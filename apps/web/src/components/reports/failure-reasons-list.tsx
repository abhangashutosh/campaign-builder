import { CheckCircle } from 'lucide-react'

interface FailureBreakdown {
  hardBounce: number
  spamComplaint: number
  invalidAddress: number
}

interface FailureReasonsListProps {
  breakdown: FailureBreakdown
}

export function FailureReasonsList({ breakdown }: FailureReasonsListProps) {
  const total = breakdown.hardBounce + breakdown.spamComplaint + breakdown.invalidAddress

  if (total === 0) {
    return (
      <div
        className="rounded-lg border p-6 flex flex-col items-center justify-center"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <CheckCircle size={24} style={{ color: 'var(--success)' }} className="mb-2" />
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>No delivery failures</p>
      </div>
    )
  }

  const items = [
    { label: 'Hard bounces', count: breakdown.hardBounce },
    { label: 'Spam complaints', count: breakdown.spamComplaint },
    { label: 'Invalid address', count: breakdown.invalidAddress },
  ]

  return (
    <div
      className="rounded-lg border"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <div className="border-b px-6 py-3" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Failure Reasons</p>
      </div>
      <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between px-6 py-3">
            <span className="text-sm" style={{ color: 'var(--text)' }}>{item.label}</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: 'var(--danger-50)', color: 'var(--danger)' }}
            >
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
