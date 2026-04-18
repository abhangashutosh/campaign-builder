'use client'

import { Bell } from 'lucide-react'

export function Header() {
  return (
    <header
      className="flex h-14 items-center justify-between border-b px-6"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div />
      <div className="flex items-center gap-3">
        <button
          className="relative rounded-full p-2 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={18} style={{ color: 'var(--text-2)' }} />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ background: 'var(--danger)' }}
          />
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium"
          style={{ background: 'var(--navy)' }}
        >
          A
        </div>
      </div>
    </header>
  )
}
