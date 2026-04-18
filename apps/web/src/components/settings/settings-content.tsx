'use client'

import { useState } from 'react'
import {
  Mail,
  MessageSquare,
  Zap,
  Key,
  Shield,
  Users,
  Settings,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/page-header'
import { DomainVerificationTable } from './domain-verification-table'
import { api } from '@/lib/api-client'
import type { DomainCheckResult } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionKey = 'email' | 'whatsapp' | 'webhooks' | 'apikeys' | 'compliance' | 'roles'

interface NavItem {
  key: SectionKey
  label: string
  icon: React.ReactNode
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}

function OutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50"
      style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
    >
      {children}
    </button>
  )
}

function NavyButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
      style={{ background: 'var(--navy)', color: '#fff' }}
    >
      {children}
    </button>
  )
}

// ─── Coming Soon placeholder ──────────────────────────────────────────────────

function ComingSoon({ section }: { section: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="rounded-full w-12 h-12 flex items-center justify-center mb-3"
        style={{ background: 'var(--navy-50)' }}
      >
        <Settings size={20} style={{ color: 'var(--navy)' }} />
      </div>
      <p className="font-medium" style={{ color: 'var(--text)' }}>
        {section}
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
        Coming soon
      </p>
    </div>
  )
}

// ─── Provider Card ────────────────────────────────────────────────────────────

interface ProviderCardProps {
  name: string
  statusLabel: string
  statusBg: string
  statusColor: string
  pill: string
  body: React.ReactNode
  footer: React.ReactNode
}

function ProviderCard({
  name,
  statusLabel,
  statusBg,
  statusColor,
  pill,
  body,
  footer,
}: ProviderCardProps) {
  return (
    <div
      className="rounded-lg border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b px-5 py-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text)' }}>
          {name}
        </span>
        <Badge label={statusLabel} bg={statusBg} color={statusColor} />
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ background: '#F1F5F9', color: 'var(--text-2)' }}
        >
          {pill}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4" style={{ color: 'var(--text-2)' }}>
        {body}
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-2 border-t px-5 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        {footer}
      </div>
    </div>
  )
}

// ─── Email Providers section ──────────────────────────────────────────────────

function EmailProvidersSection() {
  const { data: domains, refetch } = useQuery({
    queryKey: ['settings', 'domains'],
    queryFn: () => api.get<DomainCheckResult[]>('/settings/domains'),
  })

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
        Email Providers
      </h3>

      {/* Resend — Active */}
      <ProviderCard
        name="Resend"
        statusLabel="Healthy"
        statusBg="var(--success-50)"
        statusColor="var(--success)"
        pill="Primary"
        body={
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium" style={{ color: 'var(--text-2)' }}>API Key:</dt>
              <dd className="font-mono" style={{ color: 'var(--text)' }}>re_demo_key_*****</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium" style={{ color: 'var(--text-2)' }}>From:</dt>
              <dd style={{ color: 'var(--text)' }}>demo@campaignbuilder.io</dd>
            </div>
          </dl>
        }
        footer={
          <>
            <OutlineButton>Edit</OutlineButton>
            <OutlineButton>Test Connection</OutlineButton>
          </>
        }
      />

      {/* SendGrid — Inactive */}
      <ProviderCard
        name="SendGrid"
        statusLabel="Not configured"
        statusBg="#F1F5F9"
        statusColor="var(--text-2)"
        pill="Failover"
        body={
          <p className="text-sm">
            Add SendGrid as a failover provider for redundancy.
          </p>
        }
        footer={<NavyButton>Configure</NavyButton>}
      />

      {/* Domain Verification */}
      <div className="mt-6">
        <DomainVerificationTable
          domains={domains ?? []}
          onVerify={() => refetch()}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsContent() {
  const [activeSection, setActiveSection] = useState<SectionKey>('email')

  const navItems: NavItem[] = [
    { key: 'email',     label: 'Email Providers',    icon: <Mail         size={16} /> },
    { key: 'whatsapp',  label: 'WhatsApp',            icon: <MessageSquare size={16} /> },
    { key: 'webhooks',  label: 'Webhooks & Events',   icon: <Zap          size={16} /> },
    { key: 'apikeys',   label: 'API Keys',            icon: <Key          size={16} /> },
    { key: 'compliance',label: 'Compliance',          icon: <Shield       size={16} /> },
    { key: 'roles',     label: 'Roles & Permissions', icon: <Users        size={16} /> },
  ]

  const sectionLabels: Record<SectionKey, string> = {
    email:      'Email Providers',
    whatsapp:   'WhatsApp',
    webhooks:   'Webhooks & Events',
    apikeys:    'API Keys',
    compliance: 'Compliance',
    roles:      'Roles & Permissions',
  }

  function renderSection() {
    if (activeSection === 'email') return <EmailProvidersSection />
    return <ComingSoon section={sectionLabels[activeSection]} />
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Settings" subtitle="Channel configuration and domain verification" />

      <div className="flex gap-6">

        {/* Left nav */}
        <nav
          className="w-44 flex-shrink-0 rounded-lg border py-2 h-fit"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                style={{
                  background: isActive ? 'var(--navy-50)' : 'transparent',
                  color: isActive ? 'var(--navy)' : 'var(--text-2)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ color: isActive ? 'var(--navy)' : 'var(--text-3)' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Right content */}
        <div className="flex-1 min-w-0">{renderSection()}</div>
      </div>
    </div>
  )
}