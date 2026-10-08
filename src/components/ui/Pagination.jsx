import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) {
    return meta ? <p className="px-5 py-3 text-xs text-slate-500">{meta.total} résultat(s)</p> : null
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
      <p className="text-xs text-slate-500">
        {meta.from}–{meta.to} sur {meta.total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          aria-label="Page précédente"
        />
        <span className="px-2 text-sm text-slate-600">
          {meta.current_page} / {meta.last_page}
        </span>
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronRight}
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          aria-label="Page suivante"
        />
      </div>
    </div>
  )
}
