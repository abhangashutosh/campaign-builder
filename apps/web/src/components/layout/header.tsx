'use client'

import { Search, HelpCircle, Bell } from 'lucide-react'

export function Header() {
  return (
    <header
      className="flex h-14 items-center justify-between border-b px-6"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Left: Search */}
      <div className="relative w-64">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-3)' }}
        />
        <input
          type="text"
          placeholder="Search  ⌘K"
          className="w-full rounded border pl-8 pr-3 py-1.5 text-sm outline-none focus:ring-1"
          style={{
            background: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
          readOnly
        />
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <button
          className="rounded-md p-1.5 hover:bg-gray-100"
          aria-label="Help"
        >
          <HelpCircle size={18} style={{ color: 'var(--text-2)' }} />
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-md p-1.5 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={18} style={{ color: 'var(--text-2)' }} />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ background: 'var(--danger)' }}
          />
        </button>

        {/* Divider */}
        <div
          className="h-6 w-px mx-1"
          style={{ background: 'var(--border)' }}
        />

        {/* User */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium flex-shrink-0"
            style={{ background: 'var(--navy)' }}
          >
            P
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Priya Raman
            </span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              Marketing Lead
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
