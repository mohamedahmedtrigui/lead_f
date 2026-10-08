import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/leadsApi'

export const leadKeys = {
  all: ['leads'],
  list: (params) => ['leads', 'list', params],
  detail: (id) => ['leads', 'detail', String(id)],
  timeline: (id) => ['leads', 'timeline', String(id)],
}

export function useLeadsQuery(params) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useLeadQuery(id) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.get(id),
    enabled: !!id,
  })
}

export function useLeadTimeline(id) {
  return useQuery({
    queryKey: leadKeys.timeline(id),
    queryFn: () => leadsApi.timeline(id),
    enabled: !!id,
  })
}

/** Invalidates every lead-related cache (lists, details, dashboards). */
export function useInvalidateLeads() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: leadKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ])
}

export function useAddNote(leadId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => leadsApi.addNote(leadId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadKeys.timeline(leadId) }),
  })
}
