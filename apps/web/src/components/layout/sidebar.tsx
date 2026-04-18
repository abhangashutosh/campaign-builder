'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  GitBranch,
  BarChart2,
  Settings,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
  count?: string
  badge?: string
}

const WORKSPACE_NAV: NavItem[] = [
  { href: '/overview',   label: 'Overview',   Icon: LayoutDashboard },
  { href: '/audience',   label: 'Audience',   Icon: Users,           count: '34' },
  { href: '/templates',  label: 'Templates',  Icon: FileText,        count: '127' },
  { href: '/campaigns',  label: 'Campaigns',  Icon: Megaphone,       badge: '3' },
  { href: '/journeys',   label: 'Journeys',   Icon: GitBranch },
  { href: '/reports',    label: 'Reports',    Icon: BarChart2 },
]

const CONFIGURE_NAV: NavItem[] = [
  { href: '/settings', label: 'Settings', Icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">E</div>
        <div>
          <div className="brand-name">Engage</div>
          <div className="brand-sub">Campaign Module</div>
        </div>
      </div>

      {/* Tenant / Workspace */}
      <div className="tenant">
        <div className="tenant-card">
          <div className="tenant-logo">NW</div>
          <div>
            <div className="tenant-name">Northwind · Prod</div>
            <div className="tenant-plan">Business · us-east-1</div>
          </div>
          <ChevronDown size={14} className="tenant-chev" />
        </div>
      </div>

      {/* Workspace nav */}
      <div className="nav-section" style={{ flex: 1, borderBottom: 'none', overflowY: 'auto' }}>
        <div className="nav-label">Workspace</div>
        <nav className="nav">
          {WORKSPACE_NAV.map(({ href, label, Icon, count, badge }) => {
            const isActive = pathname === href || (href !== '/overview' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} className={isActive ? 'active' : ''}>
                <Icon size={16} />
                {label}
                {badge && <span className="badge">{badge}</span>}
                {count && !badge && <span className="count">{count}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="nav-label" style={{ marginTop: 12 }}>Configure</div>
        <nav className="nav">
          {CONFIGURE_NAV.map(({ href, label, Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={isActive ? 'active' : ''}>
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer usage */}
      <div className="side-footer">
        <div className="usage">
          <div className="usage-head">
            <span>Sends this month</span>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>62%</span>
          </div>
          <div className="usage-bar">
            <div className="usage-fill" />
          </div>
          <div className="usage-meta">248,412 of 400,000 · resets Nov 1</div>
        </div>
      </div>
    </aside>
  )
}
