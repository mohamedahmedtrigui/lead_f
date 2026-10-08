import { useQuery } from '@tanstack/react-query'
import { dispatchersApi } from '../api/dispatchersApi'

export const dispatcherKeys = {
  all: ['dispatchers'],
  list: (params) => ['dispatchers', params],
}

export function useDispatchers(params = {}) {
  return useQuery({
    queryKey: dispatcherKeys.list(params),
    queryFn: () => dispatchersApi.list(params),
  })
}

/** Approved dispatchers, for assignment selects. */
export function useActiveDispatchers() {
  return useDispatchers({ status: 'APPROVED' })
}
