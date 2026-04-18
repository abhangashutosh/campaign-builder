'use client'
import { LucideIcon } from 'lucide-react'
import type { CampaignType } from '@/types'

interface TypeCardProps {
  type: CampaignType
  label: string
  description: string
  Icon: LucideIcon
  selected: boolean
  onSelect: (type: CampaignType) => void
}

export function TypeCard({ type, label, description, Icon, selected, onSelect }: TypeCardProps) {
  return (
    <button className={`type-card${selected ? ' selected' : ''}`} onClick={() => onSelect(type)}>
      <div className="type-card-icon">
        <Icon size={14} color={selected ? 'var(--navy)' : 'var(--text-2)'} strokeWidth={1.8} />
      </div>
      <div className="type-card-name">{label}</div>
      <div className="type-card-desc">{description}</div>
    </button>
  )
}
