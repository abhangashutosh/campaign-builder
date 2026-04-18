'use client'

interface ThrottleBarsProps {
  ratePerHour: number
  maxRate?: number
}

export function ThrottleBars({ ratePerHour, maxRate = 1000 }: ThrottleBarsProps) {
  const BARS = 8
  const barPct = ratePerHour / maxRate

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
        ~{ratePerHour.toLocaleString()}/hr
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>estimated send rate</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40 }}>
        {Array.from({ length: BARS }, (_, i) => {
          const filled = (i + 1) / BARS <= barPct
          return (
            <div
              key={i}
              style={{
                flex: 1, borderRadius: 2,
                height: `${40 + i * 6}%`,
                background: filled ? 'rgba(255,165,0,0.9)' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.2s',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
