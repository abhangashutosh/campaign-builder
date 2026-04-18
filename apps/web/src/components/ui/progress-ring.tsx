'use client'

// ProgressRing: circular score display
// Usage: <ProgressRing score={92} size={64} />

interface ProgressRingProps {
  score: number
  size?: number
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--success)'
  if (score >= 50) return 'var(--warning)'
  return 'var(--danger)'
}

export function ProgressRing({ score, size = 64 }: ProgressRingProps) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const strokeWidth = size * 0.09
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedScore / 100) * circumference
  const color = getScoreColor(clampedScore)
  const fontSize = size * 0.22

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Score: ${clampedScore}`}
      role="img"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      {/* Score label */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="700"
        fill={color}
      >
        {clampedScore}
      </text>
    </svg>
  )
}
