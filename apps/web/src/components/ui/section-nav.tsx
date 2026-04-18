'use client'

// SectionNav: vertical pill navigation
// Usage: <SectionNav items={[{id:'email', label:'Email Providers'}]} active="email" onChange={setActive} />

import type { LucideIcon } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon?: LucideIcon
}

interface SectionNavProps {
  items: NavItem[]
  active: string
  onChange: (id: string) => void
}

export function SectionNav({ items, active, onChange }: SectionNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left cursor-pointer transition-colors hover:bg-gray-100"
            style={
              isActive
                ? { background: 'var(--navy)', color: '#ffffff' }
                : { color: 'var(--text-2)' }
            }
          >
            {Icon && (
              <Icon
                size={15}
                style={{ color: isActive ? '#ffffff' : 'var(--text-2)', flexShrink: 0 }}
              />
            )}
            {label}
          </button>
        )
      })}
    </nav>
  )
}
