'use client'

import { PageHeader } from '@/components/ui/page-header'
import { DomainVerificationTable } from './domain-verification-table'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { DomainCheckResult } from '@/types'

export function SettingsContent() {
  const { data: domains, refetch } = useQuery({
    queryKey: ['settings', 'domains'],
    queryFn: () => api.get<DomainCheckResult[]>('/settings/domains'),
  })

  return (
    <div>
      <PageHeader title="Settings" subtitle="Channel configuration and domain verification" />
      <DomainVerificationTable domains={domains ?? []} onVerify={() => refetch()} />
    </div>
  )
}
