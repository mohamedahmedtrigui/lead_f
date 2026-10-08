import { useQuery } from '@tanstack/react-query'
import { dispatchersApi } from '../api/dispatchersApi'

export const dispatcherKeys = {
  all: ['dispatchers'],
}

/**
 * Every dispatcher, fetched once and shared by all screens (the list is
 * small). Filters are applied client-side with `select`, so the dispatchers
 * page, selects and dialogs reuse the same cached request.
 */
export function useDispatchers({ status } = {}) {
  return useQuery({
    queryKey: dispatcherKeys.all,
    queryFn: () => dispatchersApi.list(),
    staleTime: 60_000,
    select: status ? (users) => users.filter((u) => u.status === status) : undefined,
  })
}

/** Approved dispatchers, for assignment selects. */
export function useActiveDispatchers() {
  return useDispatchers({ status: 'APPROVED' })
}
