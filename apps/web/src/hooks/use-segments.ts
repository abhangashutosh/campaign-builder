import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Segment } from '@/types'

export function useSegments() {
  return useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get<Segment[]>('/segments'),
  })
}

export function useSegment(id: string) {
  return useQuery({
    queryKey: ['segments', id],
    queryFn: () => api.get<Segment>(`/segments/${id}`),
    enabled: !!id,
  })
}

export function useSegmentEstimate(id: string) {
  return useQuery({
    queryKey: ['segments', id, 'estimate'],
    queryFn: () => api.get<{ total: number; emailReachable: number; whatsappReachable: number }>(`/segments/${id}/estimate`),
    enabled: !!id,
  })
}

export function useCreateSegment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; rules?: unknown }) => api.post<Segment>('/segments', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['segments'] }),
  })
}
