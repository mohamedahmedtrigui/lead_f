import { Lightbulb, MessageSquareQuote, Target } from 'lucide-react'

/** What the dispatcher should say for the current step (admin-editable). */
export function ScriptBlock({ step, children }) {
  if (!step) return null
  const paragraphs = (step.script ?? '').split(/\n{2,}/).filter(Boolean)

  return (
    <div className="space-y-4">
      {step.objective && (
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          <Target className="size-3.5" />
          {step.objective}
        </p>
      )}

      {paragraphs.length > 0 && (
        <div className="relative rounded-xl border border-brand-100 bg-brand-50/70 px-5 py-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            À dire
          </span>
          <div className="space-y-2 text-[15px] leading-relaxed text-slate-700">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>« {paragraph} »</p>
            ))}
          </div>
        </div>
      )}

      {step.question && (
        <p className="flex items-start gap-3 text-lg font-semibold leading-snug text-slate-900">
          <MessageSquareQuote className="mt-0.5 size-5 shrink-0 text-brand-600" />
          {step.question}
        </p>
      )}

      {children}

      {step.tips && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
          {step.tips}
        </p>
      )}
    </div>
  )
}
