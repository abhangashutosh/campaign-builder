import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--navy-50)' }}
      >
        <Icon size={24} style={{ color: 'var(--navy)' }} />
      </div>
      <h3 className="mb-1 text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
      {description && (
        <p className="mb-4 text-sm" style={{ color: 'var(--text-2)' }}>{description}</p>
      )}
      {action}
    </div>
  )
}
