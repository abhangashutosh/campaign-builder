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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
  badgeVariant?: 'gray' | 'navy'
}

const WORKSPACE_ITEMS: NavItem[] = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/audience', label: 'Audience', icon: Users, badge: '49', badgeVariant: 'gray' },
  { href: '/templates', label: 'Templates', icon: FileText, badge: '10', badgeVariant: 'gray' },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone, badge: '10', badgeVariant: 'navy' },
  { href: '/journeys', label: 'Journeys', icon: GitBranch },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
]

const CONFIGURE_ITEMS: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const { href, label, icon: Icon, badge, badgeVariant } = item
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive ? 'text-white' : 'hover:bg-gray-100',
      )}
      style={
        isActive
          ? { background: 'var(--navy)', color: '#fff' }
          : { color: 'var(--text-2)' }
      }
    >
      <span className="flex items-center gap-3 min-w-0">
        <Icon size={16} />
        <span className="truncate">{label}</span>
      </span>
      {badge && (
        <span
          className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
          style={
            badgeVariant === 'navy'
              ? { background: 'var(--navy)', color: '#ffffff' }
              : { background: '#E2E8F0', color: 'var(--text-2)' }
          }
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      className="px-3 py-2 mt-2 text-xs font-semibold uppercase tracking-wider"
      style={{ color: 'var(--text-3)' }}
    >
      {label}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex w-[232px] flex-shrink-0 flex-col border-r"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div
        className="flex h-14 flex-col justify-center px-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="font-bold text-base leading-tight" style={{ color: 'var(--navy)' }}>
          E · Engage
        </span>
        <span className="text-xs leading-tight" style={{ color: 'var(--text-3)' }}>
          Campaign Module
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <SectionHeader label="Workspace" />
        <div className="space-y-0.5">
          {WORKSPACE_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </div>

        <SectionHeader label="Configure" />
        <div className="space-y-0.5">
          {CONFIGURE_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </div>
      </nav>
    </aside>
  )
}
