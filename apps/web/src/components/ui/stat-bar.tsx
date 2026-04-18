'use client'

// StatBar: row of count+label cards
// Usage: <StatBar stats={[{ label: 'Total', value: 127 }, { label: 'Approved', value: 84, color: 'success' }]} />

interface StatItem {
  label: string
  value: number | string
  color?: 'default' | 'success' | 'warning' | 'danger' | 'navy'
}

interface StatBarProps {
  stats: StatItem[]
}

const COLOR_MAP: Record<NonNullable<StatItem['color']>, string> = {
  default: 'var(--text)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  navy: 'var(--navy)',
}

export function StatBar({ stats }: StatBarProps) {
  return (
    <div className="flex gap-4">
      {stats.map((stat) => {
        const valueColor = COLOR_MAP[stat.color ?? 'default']
        return (
          <div
            key={stat.label}
            className="rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <div
              className="text-2xl font-bold tabular-nums"
              style={{ color: valueColor }}
            >
              {stat.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
              {stat.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
