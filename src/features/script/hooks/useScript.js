import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { scriptApi } from '../api/scriptApi'

export const scriptKeys = { all: ['script'] }

/**
 * Admin-configured call script + helpers to resolve option labels.
 * Option labels displayed everywhere (tables, summaries) come from here so an
 * admin edit is reflected across the whole application.
 */
export function useScript() {
  const query = useQuery({
    queryKey: scriptKeys.all,
    queryFn: scriptApi.steps,
    // Admin edits must reach dispatchers quickly: refresh after 1 min and
    // whenever the tab regains focus (the payload is small).
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })

  const helpers = useMemo(() => {
    const steps = query.data ?? []
    const byKey = Object.fromEntries(steps.map((step) => [step.key, step]))
    const options = {}
    steps.forEach((step) => Object.assign(options, step.options ?? {}))

    return {
      steps,
      byKey,
      optionsFor: (field) => options[field] ?? [],
      label: (field, value) => {
        if (value === null || value === undefined || value === '') return null
        return options[field]?.find((option) => option.value === value)?.label ?? value
      },
    }
  }, [query.data])

  return { ...query, ...helpers }
}
