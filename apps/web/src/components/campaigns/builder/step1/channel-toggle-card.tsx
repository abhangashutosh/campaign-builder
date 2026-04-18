'use client'
import { LucideIcon } from 'lucide-react'
import type { ChannelType } from '@/types'

interface ChannelToggleCardProps {
  channel: ChannelType
  label: string
  description: string
  Icon: LucideIcon
  active: boolean
  onToggle: (channel: ChannelType) => void
}

export function ChannelToggleCard({ channel, label, description, Icon, active, onToggle }: ChannelToggleCardProps) {
  return (
    <button className={`channel-card${active ? ' active' : ''}`} onClick={() => onToggle(channel)}>
      <Icon size={16} color={active ? 'var(--navy)' : 'var(--text-2)'} strokeWidth={1.8} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--navy)' : 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{description}</div>
      </div>
      <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%',
        background: active ? 'var(--navy)' : 'transparent',
        border: `2px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  )
}
