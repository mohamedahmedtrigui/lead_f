import { useId } from 'react'
import { cn } from '@/lib/cn'

const control =
  'block w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500'
const controlState = (error) =>
  error
    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
    : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'

/** Label + hint + error wrapper. Children receive the generated id. */
export function Field({ label, hint, error, required, className, children }) {
  const id = useId()
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {typeof children === 'function' ? children(id) : children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ label, hint, error, required, className, inputClassName, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id) => (
        <input
          id={id}
          aria-invalid={!!error}
          className={cn(control, controlState(error), 'h-10', inputClassName)}
          {...props}
        />
      )}
    </Field>
  )
}

export function Textarea({ label, hint, error, required, className, rows = 4, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          aria-invalid={!!error}
          className={cn(control, controlState(error), 'py-2 leading-relaxed')}
          {...props}
        />
      )}
    </Field>
  )
}

export function Select({ label, hint, error, required, className, options = [], placeholder, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id) => (
        <select id={id} aria-invalid={!!error} className={cn(control, controlState(error), 'h-10 pr-8')} {...props}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function Checkbox({ label, description, className, ...props }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-4 rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  )
}
