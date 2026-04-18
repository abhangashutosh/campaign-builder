import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Campaign } from '@/types'

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get<Campaign[]>('/campaigns'),
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => api.get<Campaign>(`/campaigns/${id}`),
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Campaign>) => api.post<Campaign>('/campaigns', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Campaign> & { id: string }) =>
      api.put<Campaign>(`/campaigns/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function usePublishCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<Campaign>(`/campaigns/${id}/publish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useCampaignReadiness(id: string) {
  return useQuery({
    queryKey: ['campaigns', id, 'readiness'],
    queryFn: () => api.get<{ score: number; ready: boolean; blockers: string[]; warnings: string[] }>(`/campaigns/${id}/readiness`),
    enabled: !!id,
  })
}

export function useCampaignReports(id: string) {
  return useQuery({
    queryKey: ['campaigns', id, 'reports'],
    queryFn: () => api.get<{
      sent: number; delivered: number; opened: number; clicked: number; bounced: number; failed: number
      failureBreakdown: { hardBounce: number; spamComplaint: number; invalidAddress: number }
    }>(`/campaigns/${id}/reports`),
    enabled: !!id,
  })
}
