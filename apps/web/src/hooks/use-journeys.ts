import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Journey } from '@/types'

export function useJourneys() {
  return useQuery({
    queryKey: ['journeys'],
    queryFn: () => api.get<Journey[]>('/journeys'),
  })
}

export function useJourney(id: string) {
  return useQuery({
    queryKey: ['journeys', id],
    queryFn: () => api.get<Journey>(`/journeys/${id}`),
    enabled: !!id,
  })
}
