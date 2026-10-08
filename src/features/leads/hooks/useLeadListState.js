import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

/** Filters / sort / pagination state of a lead list. */
export function useLeadListState(initial = {}) {
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState(initial.statuses ?? [])
  const [extra, setExtra] = useState(initial.extra ?? {})
  const [sort, setSort] = useState({ field: 'source_created_at', direction: 'desc' })
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const resetPage = (fn) => (value) => {
    fn(value)
    setPage(1)
  }

  const toggleSort = (field) => {
    setSort((current) => ({ field, direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc' }))
    setPage(1)
  }

  return {
    search,
    setSearch: resetPage(setSearch),
    statuses,
    setStatuses: resetPage(setStatuses),
    extra,
    setExtra: resetPage((patch) => setExtra((current) => ({ ...current, ...patch }))),
    sort,
    toggleSort,
    page,
    setPage,
    params: {
      search: debouncedSearch,
      status: statuses,
      sort: sort.field,
      direction: sort.direction,
      page,
      per_page: 25,
      ...extra,
    },
  }
}
