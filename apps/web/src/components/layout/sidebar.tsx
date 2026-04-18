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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/audience', label: 'Audience', icon: Users },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/journeys', label: 'Journeys', icon: GitBranch },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex w-[232px] flex-shrink-0 flex-col border-r"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex h-14 items-center px-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="font-bold text-base" style={{ color: 'var(--navy)' }}>
          Engage
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-white'
                  : 'hover:bg-gray-100',
              )}
              style={
                isActive
                  ? { background: 'var(--navy)', color: '#fff' }
                  : { color: 'var(--text-2)' }
              }
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
