import { Pencil } from 'lucide-react'
import { useScript } from '@/features/script/hooks/useScript'
import { buildSummarySections } from '../utils/summary'

/**
 * Final qualification summary. Used by the wizard (editable sections) and by
 * the admin lead page (read-only).
 */
export function SummaryView({ lead, answers, server, onEdit }) {
  const { label } = useScript()
  const sections = buildSummarySections(lead, answers ?? {}, server, label)

  return (
    <div className="@container">
      <div className="grid gap-3 @3xl:grid-cols-2">
      {sections.map((section) => (
        <section key={section.title} className="rounded-xl border border-slate-200 bg-white">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
            {onEdit && section.step && (
              <button
                type="button"
                onClick={() => onEdit(section.step)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                <Pencil className="size-3" />
                Modifier
              </button>
            )}
          </header>
          <dl className="divide-y divide-slate-50 px-4">
            {section.rows.map(([term, value]) => (
              <div key={term} className="grid grid-cols-[minmax(0,40%)_1fr] gap-3 py-2 text-sm">
                <dt className="text-slate-500">{term}</dt>
                <dd className="whitespace-pre-line break-words font-medium text-slate-800">
                  {value === null || value === undefined || value === '' ? <span className="font-normal text-slate-300">—</span> : value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      </div>
    </div>
  )
}
