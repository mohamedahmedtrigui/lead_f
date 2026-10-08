import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { fieldErrors } from '@/lib/http'
import { qualificationApi } from '../api/qualificationApi'
import { ANSWER_FIELDS, STEPS, stepForField, toPayload, validateAll, visibleSteps } from '../config/steps'

const AUTOSAVE_DELAY = 1200

const SERVER_FIELDS = ['status', 'interest_score', 'interest_level', 'score_breakdown', 'is_b2b', 'completed_at']

function initialAnswers(qualification) {
  if (!qualification) return {}
  return Object.fromEntries(ANSWER_FIELDS.filter((field) => qualification[field] != null).map((field) => [field, qualification[field]]))
}

function serverState(qualification) {
  if (!qualification) return { interest_score: 0, interest_level: 'LOW', score_breakdown: [] }
  return Object.fromEntries(SERVER_FIELDS.map((field) => [field, qualification[field]]))
}

/**
 * State machine of the qualification wizard.
 * - Answers are kept locally and never lost when navigating.
 * - Drafts are saved on each step change and after a short idle delay;
 *   the server returns the authoritative interest score.
 */
export function useQualificationWizard({ leadId, qualification }) {
  const [answers, setAnswers] = useState(() => initialAnswers(qualification))
  const [server, setServer] = useState(() => serverState(qualification))
  const [stepKey, setStepKey] = useState(() =>
    STEPS.some((s) => s.key === qualification?.current_step) ? qualification.current_step : 'introduction',
  )
  const [reached, setReached] = useState(() => new Set([stepKey]))
  const [errors, setErrors] = useState({})
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [completing, setCompleting] = useState(false)

  const answersRef = useRef(answers)
  const stepRef = useRef(stepKey)
  const lastSaved = useRef(JSON.stringify(toPayload({ ...initialAnswers(qualification), current_step: stepKey })))
  const queue = useRef(Promise.resolve())

  const steps = useMemo(() => visibleSteps(answers), [answers])
  // A step can disappear (e.g. B2B no longer applicable): stay at the same position.
  const found = steps.findIndex((s) => s.key === stepKey)
  const index = found >= 0 ? found : Math.min(STEPS.findIndex((s) => s.key === stepKey), steps.length - 1)
  const step = steps[index]

  useLayoutEffect(() => {
    answersRef.current = answers
    stepRef.current = step.key
  })

  const save = useCallback(() => {
    queue.current = queue.current.then(async () => {
      const payload = toPayload({ ...answersRef.current, current_step: stepRef.current })
      const serialized = JSON.stringify(payload)
      if (serialized === lastSaved.current) return
      setSaveState('saving')
      try {
        const response = await qualificationApi.saveDraft(leadId, payload)
        lastSaved.current = serialized
        setServer(serverState(response))
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    })
    return queue.current
  }, [leadId])

  // Debounced autosave while typing.
  useEffect(() => {
    const timer = setTimeout(save, AUTOSAVE_DELAY)
    return () => clearTimeout(timer)
  }, [answers, save])

  // Immediate save on step change.
  useEffect(() => {
    save()
  }, [step.key, save])

  const setField = useCallback((field, value) => {
    setAnswers((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }, [])

  const goTo = useCallback((key) => {
    setErrors({})
    setStepKey(key)
    setReached((current) => new Set(current).add(key))
  }, [])

  const goNext = useCallback(() => {
    const stepErrors = step.validate(answersRef.current)
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors)
      return false
    }
    const next = steps[index + 1]
    if (next) goTo(next.key)
    return true
  }, [step, steps, index, goTo])

  const goBack = useCallback(() => {
    const previous = steps[index - 1]
    if (previous) goTo(previous.key)
  }, [steps, index, goTo])

  /** Returns the API response, or null when validation failed. */
  const complete = useCallback(async () => {
    const current = answersRef.current
    const invalid = validateAll(current)
    if (invalid) {
      goTo(invalid.step)
      setErrors(invalid.errors)
      return null
    }

    setCompleting(true)
    try {
      await queue.current
      const response = await qualificationApi.complete(leadId, toPayload(current))
      setServer(serverState(response.qualification))
      return response
    } catch (error) {
      const fields = fieldErrors(error)
      const first = Object.keys(fields)[0]
      if (first) {
        const target = stepForField(first, current)
        if (target) goTo(target.key)
        setErrors(fields)
      }
      throw error
    } finally {
      setCompleting(false)
    }
  }, [leadId, goTo])

  return {
    answers,
    setField,
    server,
    steps,
    step,
    index,
    total: steps.length,
    reached,
    errors,
    saveState,
    completing,
    goNext,
    goBack,
    goTo,
    save,
    complete,
  }
}
