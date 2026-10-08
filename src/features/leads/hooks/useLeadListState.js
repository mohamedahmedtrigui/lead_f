import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

/** Filters / sort / pagination state of a lead list. */
export function useLeadListState(initial = {}) {
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState(initial.statuses ?? [])
  const [extra, setExtra] = useState(initial.extra ?? {})
  // Default: most important statuses first (À traiter, En cours, Rappel, NRP…)
  const [sort, setSort] = useState({ field: 'priority', direction: 'asc' })
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const resetPage = (fn) => (value) => {
    fn(value)
    setPage(1)
  }

  const toggleSort = (field) => {
    setSort((current) => {
      const initial = field === 'priority' ? 'asc' : 'desc'
      if (current.field !== field) return { field, direction: initial }
      return { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    })
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
