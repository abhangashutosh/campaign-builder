import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Template } from '@/types'

export function useTemplates(type?: string) {
  return useQuery({
    queryKey: ['templates', type],
    queryFn: () => api.get<Template[]>(type ? `/templates?type=${type}` : '/templates'),
  })
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => api.get<Template>(`/templates/${id}`),
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Template>) => api.post<Template>('/templates', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}
