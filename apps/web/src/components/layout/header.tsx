'use client'

import { Search, HelpCircle, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'

const CRUMB_MAP: Record<string, string> = {
  '/overview':  'Overview',
  '/audience':  'Audience',
  '/templates': 'Templates',
  '/campaigns': 'Campaigns',
  '/journeys':  'Journeys',
  '/reports':   'Reports',
  '/settings':  'Settings',
}

export function Header() {
  const pathname = usePathname()
  const crumb = CRUMB_MAP[pathname] ?? CRUMB_MAP[Object.keys(CRUMB_MAP).find(k => pathname.startsWith(k)) ?? ''] ?? 'Page'

  return (
    <header className="header">
      {/* Breadcrumbs */}
      <div className="crumbs">
        <span>Engage</span>
        <span className="sep">/</span>
        <span className="cur">{crumb}</span>
      </div>

      {/* Search */}
      <div className="search" style={{ marginLeft: 0 }}>
        <Search size={14} />
        <input type="text" placeholder="Search campaigns, segments, templates…" readOnly />
        <span className="kbd">⌘K</span>
      </div>

      {/* Right actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="icon-btn" aria-label="Help">
          <HelpCircle size={16} />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={16} />
          <span className="dot" />
        </button>
        <div className="user-menu">
          <div className="avatar" style={{ background: 'var(--navy)', color: '#fff', width: 28, height: 28, fontSize: 12, fontWeight: 700 }}>PR</div>
          <div>
            <div className="who">Priya Raman</div>
            <div className="role">Marketing Lead</div>
          </div>
        </div>
      </div>
    </header>
  )
}
