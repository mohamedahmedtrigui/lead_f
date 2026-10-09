/**
 * Qualification wizard definition.
 *
 * Conversation order follows the MiralDrive call script: introduction ->
 * who -> trip type -> route & frequency -> passengers -> shared transport
 * (single person only) -> experience -> current solution -> B2B -> recap
 * validated by the client -> agent evaluation -> closing.
 * Wording comes from the admin-editable script (GET /script); this file only
 * defines structure, conditions and client-side validation, which mirrors
 * App\Domain\Qualification\Support\QualificationRules on the server.
 */

export const ANSWER_FIELDS = [
  'current_step',
  'call_availability',
  'beneficiary',
  'beneficiary_details',
  'transport_need',
  'transport_need_details',
  'departure',
  'destination',
  'trip_type',
  'departure_time',
  'arrival_time',
  'return_time',
  'extra_routes',
  'days_of_week',
  'frequency',
  'trips_per_week',
  'is_recurring',
  'passengers_count',
  'total_employees',
  'estimated_passengers_per_trip',
  'shared_transport',
  'shared_direction',
  'used_miraldrive',
  'experience_rating',
  'experience_feedback',
  'improvement_request',
  'other_apps_used',
  'other_apps',
  'other_apps_issues',
  'other_apps_feedback',
  'current_provider',
  'current_provider_details',
  'customer_preference',
  'pain_point',
  'company_name',
  'company_size',
  'employees_concerned',
  'trips_per_day',
  'b2b_same_schedule',
  'decision_maker_name',
  'decision_role',
  'main_priority',
  'recap_confirmed',
  'wants_quotation',
  'wants_callback',
  'priority_stars',
  'summary_note',
  'next_action',
  'next_actions',
  'callback_at',
]

export const isB2b = (a) => ['EMPLOYEES', 'COMPANY'].includes(a.beneficiary) || a.transport_need === 'EMPLOYEE'

/** Level 2 "Pour lui-même" = B2C: level 3 (for whom exactly) is skipped. */
export const isForOtherPerson = (a) => a.beneficiary !== 'SELF'

/** Shared transport is only proposed to a single person, outside B2B. */
export const isSharedApplicable = (a) => !isB2b(a) && (a.passengers_count ?? 1) <= 1

/** Next actions that end the conversation early (partial qualification allowed). */
export const isEarlyExit = (a) => (a.next_actions ?? (a.next_action ? [a.next_action] : [])).some((x) => ['NOT_INTERESTED', 'NRP'].includes(x))

const SUMMARY_MIN_LENGTH = 20

const required = (value) =>
  value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

const check = (rules) =>
  Object.fromEntries(Object.entries(rules).filter(([, message]) => Boolean(message)))

/**
 * key: script step key. primaryField: options selectable with keys 1-9.
 * fields: used to route server validation errors back to the right step.
 */
export const STEPS = [
  {
    key: 'introduction',
    primaryField: 'call_availability',
    fields: ['call_availability'],
    validate: (a) =>
      check({
        call_availability:
          a.call_availability !== 'YES' &&
          (a.call_availability === 'CALLBACK'
            ? 'Programmez le rappel ci-dessous pour clôturer l’appel.'
            : 'Indiquez si le client est disponible.'),
      }),
  },
  {
    key: 'beneficiary',
    primaryField: 'beneficiary',
    fields: ['beneficiary', 'beneficiary_details'],
    validate: (a) => check({ beneficiary: required(a.beneficiary) && 'Sélectionnez pour qui est le transport.' }),
  },
  {
    key: 'need',
    primaryField: 'transport_need',
    visible: isForOtherPerson,
    fields: ['transport_need', 'transport_need_details'],
    validate: (a) => check({ transport_need: required(a.transport_need) && 'Précisez pour qui est le transport.' }),
  },
  {
    key: 'route',
    primaryField: 'trip_type',
    fields: [
      'departure',
      'destination',
      'trip_type',
      'departure_time',
      'arrival_time',
      'return_time',
      'extra_routes',
      'frequency',
      'days_of_week',
      'trips_per_day',
      'trips_per_week',
      'is_recurring',
    ],
    validate: (a) =>
      check({
        departure: required(a.departure) && 'Le lieu de départ est requis.',
        destination: required(a.destination) && 'La destination est requise.',
        trip_type: required(a.trip_type) && 'Aller seulement ou aller-retour ?',
        frequency: required(a.frequency) && 'Sélectionnez la fréquence.',
        days_of_week: a.frequency === 'FIXED_DAYS' && required(a.days_of_week) && 'Sélectionnez au moins un jour.',
      }),
  },
  {
    key: 'passengers',
    primaryField: null,
    fields: ['passengers_count', 'total_employees', 'estimated_passengers_per_trip'],
    validate: (a) =>
      isB2b(a)
        ? check({ estimated_passengers_per_trip: required(a.estimated_passengers_per_trip) && 'Indiquez le nombre de passagers par trajet.' })
        : check({ passengers_count: required(a.passengers_count) && 'Indiquez le nombre de passagers.' }),
  },
  {
    key: 'shared',
    primaryField: 'shared_transport',
    visible: isSharedApplicable,
    fields: ['shared_transport', 'shared_direction'],
    validate: (a) =>
      check({
        shared_transport: required(a.shared_transport) && 'Notez la réponse du client.',
        shared_direction:
          a.shared_transport === 'YES' && a.trip_type === 'ROUND_TRIP' && required(a.shared_direction) && 'Précisez le sens du partage.',
      }),
  },
  {
    key: 'experience',
    primaryField: 'used_miraldrive',
    // Experience + current solution, merged into one simple step.
    fields: [
      'used_miraldrive',
      'experience_rating',
      'experience_feedback',
      'improvement_request',
      'current_provider',
      'current_provider_details',
      'other_apps',
      'other_apps_issues',
      'other_apps_feedback',
      'pain_point',
      'customer_preference',
    ],
    validate: (a) =>
      check({
        used_miraldrive: required(a.used_miraldrive) && 'Notez si le client connaît MiralDrive.',
        experience_rating: a.used_miraldrive === 'YES' && required(a.experience_rating) && 'Notez l’expérience (1 à 5).',
        current_provider: required(a.current_provider) && 'Indiquez comment il se déplace aujourd’hui.',
      }),
  },
  {
    key: 'b2b',
    primaryField: 'decision_role',
    visible: isB2b,
    fields: ['company_name', 'company_size', 'b2b_same_schedule', 'decision_maker_name', 'decision_role'],
    validate: (a) =>
      check({
        company_name: required(a.company_name) && 'Le nom de l’entreprise est requis.',
        decision_role: required(a.decision_role) && 'Indiquez le rôle de l’interlocuteur.',
      }),
  },
  {
    key: 'recap',
    primaryField: 'recap_confirmed',
    fields: ['recap_confirmed'],
    validate: (a) =>
      check({
        recap_confirmed:
          a.recap_confirmed !== true &&
          (a.recap_confirmed === false
            ? 'Corrigez les informations puis faites valider le récapitulatif.'
            : 'Faites valider le récapitulatif par le client.'),
      }),
  },
  {
    // Closing + agent evaluation (merged). Several next actions can be chosen.
    key: 'closing',
    primaryField: null,
    fields: ['next_actions', 'next_action', 'callback_at', 'summary_note', 'priority_stars', 'main_priority', 'wants_quotation', 'wants_callback'],
    validate: (a) => {
      const actions = a.next_actions ?? []
      return check({
        next_actions: actions.length === 0 && 'Choisissez au moins une prochaine action.',
        callback_at:
          actions.includes('CALLBACK') &&
          (required(a.callback_at)
            ? 'Indiquez la date du rappel.'
            : new Date(a.callback_at) <= new Date() && 'La date de rappel doit être dans le futur.'),
        priority_stars: !isEarlyExit(a) && required(a.priority_stars) && 'Attribuez une priorité (1 à 5 étoiles).',
        summary_note:
          (a.summary_note ?? '').trim().length < SUMMARY_MIN_LENGTH &&
          `Rédigez un résumé interne (${SUMMARY_MIN_LENGTH} caractères minimum).`,
      })
    },
  },
  {
    key: 'summary',
    primaryField: null,
    fields: [],
    validate: () => ({}),
  },
]

export const visibleSteps = (answers) => STEPS.filter((step) => !step.visible || step.visible(answers))

export const stepForField = (field, answers) =>
  visibleSteps(answers).find((step) => step.fields.includes(field.split('.')[0]))

/** Validation of every step required before completion. */
export function validateAll(answers) {
  const steps = isEarlyExit(answers)
    ? STEPS.filter((step) => step.key === 'closing')
    : visibleSteps(answers).filter((step) => step.key !== 'introduction')

  for (const step of steps) {
    const errors = step.validate(answers)
    if (Object.keys(errors).length) return { step: step.key, errors }
  }
  return null
}

/** Payload sent to the API: known fields only, empty strings as null. */
export function toPayload(answers) {
  return Object.fromEntries(
    ANSWER_FIELDS.filter((field) => field in answers).map((field) => {
      const value = answers[field]
      return [field, value === '' ? null : value]
    }),
  )
}
