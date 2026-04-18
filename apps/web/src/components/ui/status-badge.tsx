import { cn } from '@/lib/utils'
import type { CampaignStatus } from '@/types'

const STATUS_CONFIG: Record<CampaignStatus, { label: string; bg: string; text: string; dot?: string }> = {
  draft:        { label: 'Draft',        bg: '#F1F5F9', text: '#475569' },
  running:      { label: 'Running',      bg: '#ECFDF3', text: '#166534', dot: '#16A34A' },
  scheduled:    { label: 'Scheduled',    bg: '#EEF2FF', text: '#1B4DFF', dot: '#1B4DFF' },
  paused:       { label: 'Paused',       bg: '#FEF6E7', text: '#92400E', dot: '#D97706' },
  completed:    { label: 'Completed',    bg: '#F0F9FF', text: '#075985', dot: '#0EA5E9' },
  failed:       { label: 'Failed',       bg: '#FEECEC', text: '#991B1B', dot: '#DC2626' },
  needs_review: { label: 'Needs Review', bg: '#FEF6E7', text: '#92400E', dot: '#D97706' },
}

interface StatusBadgeProps {
  status: CampaignStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ background: config.bg, color: config.text }}
    >
      {config.dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: config.dot }}
        />
      )}
      {config.label}
    </span>
  )
}
