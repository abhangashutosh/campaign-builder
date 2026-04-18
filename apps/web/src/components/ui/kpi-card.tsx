import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  trend?: number
  className?: string
}

export function KpiCard({ label, value, trend, className }: KpiCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  return (
    <div
      className={cn('rounded-lg border p-6', className)}
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <p className="text-sm" style={{ color: 'var(--text-2)' }}>{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
      {trend !== undefined && (
        <div className={cn('mt-2 flex items-center gap-1 text-sm')}>
          {isPositive ? (
            <TrendingUp size={14} style={{ color: 'var(--success)' }} />
          ) : (
            <TrendingDown size={14} style={{ color: 'var(--danger)' }} />
          )}
          <span style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span style={{ color: 'var(--text-3)' }}>vs last period</span>
        </div>
      )}
    </div>
  )
}
