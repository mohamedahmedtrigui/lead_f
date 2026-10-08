import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

const columnsClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  7: 'grid-cols-4 sm:grid-cols-7',
}

/**
 * Large selectable answers. When `shortcuts` is set, the number shown on each
 * card is the keyboard key selecting it (handled by the wizard).
 */
export function OptionCards({ options, value, onChange, multiple = false, columns = 2, shortcuts = false, error, compact = false }) {
  const isSelected = (optionValue) => (multiple ? (value ?? []).includes(optionValue) : value === optionValue)

  const toggle = (optionValue) => {
    if (!multiple) return onChange(optionValue)
    const current = value ?? []
    onChange(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue])
  }

  return (
    <div>
      <div className={cn('grid gap-2', columnsClass[columns] ?? columnsClass[2])} role={multiple ? 'group' : 'radiogroup'}>
        {options.map((option, index) => {
          const selected = isSelected(option.value)
          return (
            <button
              key={option.value}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onClick={() => toggle(option.value)}
              className={cn(
                'group flex items-center gap-3 rounded-xl border text-left text-sm font-medium transition-all',
                compact ? 'justify-center px-2 py-2' : 'px-4 py-3',
                selected
                  ? 'border-brand-500 bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50',
                error && !selected && 'border-rose-200',
              )}
            >
              {shortcuts && index < 9 && (
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                    selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700',
                  )}
                >
                  {index + 1}
                </span>
              )}
              <span className={cn(!compact && 'flex-1')}>{option.label}</span>
              {selected && !compact && <Check className="size-4 shrink-0" />}
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}

/** Yes / No toggle used for boolean answers. */
export function YesNo({ value, onChange, yesLabel = 'Oui', noLabel = 'Non' }) {
  return (
    <OptionCards
      columns={2}
      options={[
        { value: true, label: yesLabel },
        { value: false, label: noLabel },
      ]}
      value={value}
      onChange={(v) => onChange(v === value ? null : v)}
    />
  )
}
