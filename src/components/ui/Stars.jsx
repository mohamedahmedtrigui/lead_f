import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'

/** 1-5 rating. Read-only when onChange is not provided. */
export function Stars({ value = 0, onChange, size = 'md', label = 'Priorité' }) {
  const iconSize = size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-8' : 'size-5'
  const interactive = typeof onChange === 'function'

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'} aria-label={`${label} : ${value || 0}/5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (value || 0)
        const icon = <Star className={cn(iconSize, filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
        return interactive ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star === value ? null : star)}
            className="rounded p-0.5 transition-transform hover:scale-110"
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        )
      })}
    </div>
  )
}
