'use client'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

type Intensity = 0 | 1 | 2 | 3 | 4 | 5

interface HeatmapCell {
  day: number
  hour: number
  intensity: Intensity
}

const MOCK_DATA: HeatmapCell[] = DAYS.flatMap((_, d) =>
  HOURS.map((h) => {
    const isWeekday   = d < 5
    const isMorning   = h >= 9 && h <= 11
    const isAfternoon = h >= 14 && h <= 16
    let intensity: Intensity = 0
    if (!isWeekday)                         intensity = (h >= 10 && h <= 12) ? 1 : 0
    else if (isMorning && d >= 1 && d <= 3) intensity = 5
    else if (isMorning)                     intensity = 3
    else if (isAfternoon && d < 4)          intensity = 4
    else if (isAfternoon)                   intensity = 2
    else if (h >= 7 && h <= 18)             intensity = 1
    return { day: d, hour: h, intensity }
  })
)

interface EngagementHeatmapProps {
  data?: HeatmapCell[]
  recommendedHourStart?: number
  recommendedHourEnd?: number
}

export function EngagementHeatmap({
  data = MOCK_DATA,
  recommendedHourStart = 9,
  recommendedHourEnd = 11,
}: EngagementHeatmapProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(24, 1fr)', gap: 2, marginBottom: 4 }}>
        <div />
        {HOURS.map((h) => (
          <div key={h} style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>
            {h % 6 === 0 ? `${h}h` : ''}
          </div>
        ))}
      </div>
      {DAYS.map((day, d) => (
        <div key={day} style={{ display: 'grid', gridTemplateColumns: '28px repeat(24, 1fr)', gap: 2, marginBottom: 2 }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>{day}</div>
          {HOURS.map((h) => {
            const cell = data.find((c) => c.day === d && c.hour === h)
            return <div key={h} className="hm-cell" data-intensity={cell?.intensity ?? 0} />
          })}
        </div>
      ))}
      <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--navy)', color: '#fff', fontSize: 11 }}>
        Best window: Tue–Thu {recommendedHourStart}:00–{recommendedHourEnd}:00 (recipient local time)
      </div>
    </div>
  )
}
