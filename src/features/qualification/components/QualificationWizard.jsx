import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, CloudCheck, CloudOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Card, Modal } from '@/components/ui'
import { LEAD_STATUS, NEXT_ACTION } from '@/constants/domain'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useScript } from '@/features/script/hooks/useScript'
import { errorMessage } from '@/lib/http'
import { cn } from '@/lib/cn'
import { ScriptBlock } from './ScriptBlock'
import { buildScriptContext, fillText, renderTemplate } from '../utils/placeholders'
import { BeneficiaryStep, IntroductionStep, NeedStep } from '../steps/DiscoverySteps'
import { PassengersStep, RouteStep } from '../steps/TripSteps'
import { B2bStep, CurrentSolutionStep, ExperienceStep, SharedStep } from '../steps/ProfileSteps'
import { ClosingStep, QualificationStep, RecapStep, SummaryStep } from '../steps/ClosingSteps'

const STEP_COMPONENTS = {
  introduction: IntroductionStep,
  beneficiary: BeneficiaryStep,
  need: NeedStep,
  route: RouteStep,
  passengers: PassengersStep,
  shared: SharedStep,
  experience: ExperienceStep,
  current_solution: CurrentSolutionStep,
  b2b: B2bStep,
  recap: RecapStep,
  qualification: QualificationStep,
  closing: ClosingStep,
  summary: SummaryStep,
}

const NEXT_STATUS = {
  CALLBACK: 'CALLBACK',
  NOT_INTERESTED: 'NOT_INTERESTED',
  NRP: 'NRP',
}

const isTyping = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

function SaveIndicator({ state }) {
  if (state === 'saving')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Loader2 className="size-3 animate-spin" /> Enregistrement…
      </span>
    )
  if (state === 'error')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-rose-500">
        <CloudOff className="size-3" /> Non enregistré
      </span>
    )
  if (state === 'saved')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CloudCheck className="size-3" /> Brouillon enregistré
      </span>
    )
  return null
}

export function QualificationWizard({ lead, wizard, actions, onCompleted }) {
  const script = useScript()
  const { user } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const bodyRef = useRef(null)
  const { answers, setField, errors, step, steps, index, total, reached, goNext, goBack, goTo, server, saveState, completing } = wizard

  const scriptStep = script.byKey[step.key]
  const StepComponent = STEP_COMPONENTS[step.key]
  const isLast = step.key === 'summary'
  const optionsFor = script.optionsFor
  const context = buildScriptContext({ answers, label: script.label, user, lead })
  const prompt = (field, fallback) => fillText(scriptStep?.prompts?.[field], context) || fallback
  // Reply the dispatcher says once the client has given the selected answer.
  const reply = (field) => {
    const value = answers[field]
    const key = value === true ? 'YES' : value === false ? 'NO' : value
    const text = key != null ? scriptStep?.responses?.[field]?.[key] : null
    return text ? renderTemplate(text, context) : null
  }

  const next = useCallback(() => {
    if (isLast) setConfirmOpen(true)
    else goNext()
  }, [isLast, goNext])

  // Keyboard: 1-9 select an answer, Enter = next, Alt+← = back, Ctrl+Enter = next from a field.
  useEffect(() => {
    function onKeyDown(event) {
      if (confirmOpen || document.querySelector('[role="dialog"]')) return
      const typing = isTyping(event.target)

      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        next()
        return
      }
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault()
        goBack()
        return
      }
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault()
        next()
        return
      }
      if (typing || event.ctrlKey || event.metaKey || event.altKey) return

      const onAnswerCard = ['radio', 'checkbox'].includes(event.target?.getAttribute?.('role'))
      if (event.key === 'Enter' && (event.target === document.body || onAnswerCard)) {
        event.preventDefault()
        next()
        return
      }
      // Click the matching answer card so the step's own logic runs
      // (e.g. "Tous les jours" pre-fills Mon–Fri).
      if (/^[1-9]$/.test(event.key) && step.primaryField) {
        const group = bodyRef.current?.querySelector('[role="radiogroup"]')
        const card = group?.querySelectorAll('[role="radio"]')[Number(event.key) - 1]
        if (card) {
          event.preventDefault()
          card.click()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [step, next, goBack, confirmOpen])

  async function confirmCompletion() {
    try {
      const response = await wizard.complete()
      setConfirmOpen(false)
      if (response) onCompleted?.(response)
    } catch (error) {
      setConfirmOpen(false)
      toast.error(errorMessage(error))
    }
  }

  const resultingStatus = NEXT_STATUS[answers.next_action] ?? 'QUALIFIED'

  return (
    <Card className="flex h-full flex-col">
      {/* Header: LEVEL X / TOTAL */}
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Niveau {index + 1} / {total}
          </p>
          <SaveIndicator state={saveState} />
        </div>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{scriptStep?.title ?? step.key}</h2>
        <div className="mt-3 flex gap-1" aria-label="Progression">
          {steps.map((s, i) => {
            const canJump = reached.has(s.key) || i < index
            return (
              <button
                key={s.key}
                type="button"
                disabled={!canJump}
                onClick={() => goTo(s.key)}
                title={script.byKey[s.key]?.title}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i < index ? 'bg-brand-500' : i === index ? 'bg-brand-600' : canJump ? 'bg-brand-200' : 'bg-slate-200',
                  canJump && 'cursor-pointer hover:bg-brand-400',
                )}
              />
            )
          })}
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5">
        <ScriptBlock step={step.key === 'summary' ? { ...scriptStep, script: null } : scriptStep} context={context}>
          <StepComponent
            lead={lead}
            answers={answers}
            setField={setField}
            errors={errors}
            server={server}
            step={scriptStep}
            optionsFor={optionsFor}
            prompt={prompt}
            reply={reply}
            label={script.label}
            goTo={goTo}
            actions={actions}
          />
        </ScriptBlock>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        <Button variant="secondary" icon={ArrowLeft} onClick={goBack} disabled={index === 0}>
          Retour
        </Button>
        <p className="hidden items-center gap-1.5 text-[11px] text-slate-400 xl:flex">
          {step.primaryField && (
            <>
              <kbd className="kbd">1</kbd>–<kbd className="kbd">9</kbd> choisir ·
            </>
          )}
          <kbd className="kbd">Entrée</kbd> suivant · <kbd className="kbd">Alt</kbd>+<kbd className="kbd">←</kbd> retour
        </p>
        {isLast ? (
          <Button variant="success" icon={CheckCircle2} onClick={() => setConfirmOpen(true)} loading={completing}>
            Compléter la qualification
          </Button>
        ) : (
          <Button iconRight={ArrowRight} onClick={next} disabled={step.key === 'introduction' && answers.call_availability === 'CALLBACK'}>
            Suivant
          </Button>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Compléter la qualification ?"
        description="L’appel sera clôturé et le lead mis à jour."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="success" icon={CheckCircle2} loading={completing} onClick={confirmCompletion} data-autofocus>
              Compléter la qualification
            </Button>
          </>
        }
      >
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Client</dt>
            <dd className="font-medium">{lead.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Score</dt>
            <dd className="font-medium">
              {server.interest_score} / 100 · {server.interest_level}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Prochaine action</dt>
            <dd className="font-medium">{NEXT_ACTION[answers.next_action] ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Nouveau statut du lead</dt>
            <dd className="font-medium">{LEAD_STATUS[resultingStatus].label}</dd>
          </div>
        </dl>
      </Modal>
    </Card>
  )
}
