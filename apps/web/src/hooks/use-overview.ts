import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export interface OverviewStats {
  totalCampaigns: number
  activeCampaigns: number
  deliveryRate: number
  openRate: number
  clickRate: number
}

export interface DeliveryHealth {
  channel: string
  provider: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastCheckedAt?: string
}

export function useOverviewStats() {
  return useQuery({
    queryKey: ['overview', 'stats'],
    queryFn: () => api.get<OverviewStats>('/overview/stats'),
    staleTime: 30_000, // 30s — refreshed frequently on the dashboard
  })
}

export function useDeliveryHealth() {
  return useQuery({
    queryKey: ['overview', 'delivery-health'],
    queryFn: () => api.get<DeliveryHealth[]>('/overview/health'),
    staleTime: 15_000,
  })
}
