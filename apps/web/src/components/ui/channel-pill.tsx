'use client'

// ChannelPill: colored badge for email/whatsapp/sms/push/inapp/web
// Usage: <ChannelPill channel="email" /> or <ChannelPill channel="whatsapp" size="sm" />

import { Mail, MessageSquare, Bell, Monitor, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ChannelPillProps {
  channel: string
  size?: 'sm' | 'md'
}

interface ChannelConfig {
  bg: string
  color: string
  Icon: LucideIcon
}

const CHANNEL_MAP: Record<string, ChannelConfig> = {
  email: {
    bg: 'var(--navy-50)',
    color: 'var(--navy)',
    Icon: Mail,
  },
  whatsapp: {
    bg: 'var(--teal-50)',
    color: 'var(--teal)',
    Icon: MessageSquare,
  },
  sms: {
    bg: 'var(--orange-50)',
    color: 'var(--orange)',
    Icon: MessageSquare,
  },
  push: {
    bg: 'var(--warning-50)',
    color: 'var(--warning)',
    Icon: Bell,
  },
  inapp: {
    bg: 'var(--success-50)',
    color: 'var(--success)',
    Icon: Monitor,
  },
  web: {
    bg: '#F1F5F9',
    color: '#475569',
    Icon: Globe,
  },
}

const FALLBACK: ChannelConfig = {
  bg: '#F1F5F9',
  color: '#475569',
  Icon: Globe,
}

export function ChannelPill({ channel, size = 'md' }: ChannelPillProps) {
  const key = channel.toLowerCase()
  const config = CHANNEL_MAP[key] ?? FALLBACK
  const { bg, color, Icon } = config

  const iconSize = size === 'sm' ? 10 : 12
  const paddingClass = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${paddingClass} ${textClass}`}
      style={{ background: bg, color }}
    >
      <Icon size={iconSize} />
      {channel.charAt(0).toUpperCase() + channel.slice(1).toLowerCase()}
    </span>
  )
}
