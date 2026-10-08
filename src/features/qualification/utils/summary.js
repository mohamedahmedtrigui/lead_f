import { formatDateTime } from '@/lib/format'
import { NEXT_ACTION } from '@/constants/domain'
import { isB2b, isSharedApplicable } from '../config/steps'

const yesNo = (value) => (value === true ? 'Oui' : value === false ? 'Non' : null)

/**
 * Sections of the final qualification summary.
 * `label(field, value)` resolves option labels from the admin script.
 */
export function buildSummarySections(lead, answers, server, label) {
  const days = (answers.days_of_week ?? []).map((day) => label('days_of_week', day)).join(', ')
  const schedule = [
    answers.departure_time && `Départ ${answers.departure_time}`,
    answers.return_time && `Retour ${answers.return_time}`,
    days,
  ]
    .filter(Boolean)
    .join(' · ')

  const b2b = isB2b(answers)

  return [
    {
      title: 'Client',
      step: null,
      rows: [
        ['Client', lead?.name],
        ['Téléphone', lead?.phone],
        ['Bénéficiaire', label('beneficiary', answers.beneficiary)],
      ],
    },
    {
      title: 'Besoin & trajet',
      step: 'route',
      rows: [
        ['Type de transport', label('transport_need', answers.transport_need)],
        ['Départ', answers.departure],
        ['Destination', answers.destination],
        ['Type de trajet', label('trip_type', answers.trip_type)],
        ['Horaires', schedule],
      ],
    },
    {
      title: 'Fréquence & passagers',
      step: 'schedule',
      rows: [
        ['Fréquence', label('frequency', answers.frequency)],
        ['Trajets / jour', b2b ? null : answers.trips_per_day],
        ['Trajets / semaine', answers.trips_per_week],
        ['Passagers', b2b ? answers.estimated_passengers_per_trip && `${answers.estimated_passengers_per_trip} / trajet` : answers.passengers_count],
      ],
    },
    {
      title: 'Préférences',
      step: 'shared',
      rows: [
        [
          'Transport partagé',
          isSharedApplicable(answers)
            ? [label('shared_transport', answers.shared_transport), answers.shared_transport === 'YES' && label('shared_direction', answers.shared_direction)]
                .filter(Boolean)
                .join(' · ')
            : 'Non proposé (groupe ou B2B)',
        ],
        [
          'Expérience MiralDrive',
          [label('used_miraldrive', answers.used_miraldrive), answers.used_miraldrive === 'YES' && answers.experience_rating && `${answers.experience_rating}/5`]
            .filter(Boolean)
            .join(' · '),
        ],
        ['Solution actuelle', label('current_provider', answers.current_provider)],
        ['Point de douleur', answers.pain_point],
        ['Priorité client', label('main_priority', answers.main_priority)],
      ],
    },
    {
      title: 'Entreprise (B2B)',
      step: b2b ? 'b2b' : null,
      rows: [
        ['Statut B2B', b2b ? 'Oui' : 'Non'],
        ...(b2b
          ? [
              ['Entreprise', answers.company_name],
              ['Employés concernés', answers.employees_concerned],
              ['Trajets / jour', answers.trips_per_day],
              ['Mêmes horaires', yesNo(answers.b2b_same_schedule)],
              ['Décideur', label('decision_role', answers.decision_role)],
            ]
          : []),
      ],
    },
    {
      title: 'Qualification',
      step: 'qualification',
      rows: [
        ['Récap validé par le client', yesNo(answers.recap_confirmed)],
        ['Score d’intérêt', server?.interest_score != null ? `${server.interest_score} / 100` : null],
        ['Niveau', server?.interest_level],
        ['Priorité', answers.priority_stars ? `${answers.priority_stars} / 5` : null],
        ['Demande de devis', yesNo(answers.wants_quotation)],
        ['Note', answers.summary_note],
        ['Prochaine action', NEXT_ACTION[answers.next_action] ?? null],
        ...(answers.next_action === 'CALLBACK' ? [['Rappel', formatDateTime(answers.callback_at)]] : []),
      ],
    },
  ]
}

/**
 * Draft of the internal summary note, e.g. "Client recherche transport
 * quotidien Sfax → centre-ville, départ 07h30, retour 17h30...".
 */
export function buildSummaryDraft(answers, label) {
  const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : text)
  const parts = []

  const need = label('transport_need', answers.transport_need)
  const frequency = label('frequency', answers.frequency)
  const route = answers.departure && answers.destination ? `${answers.departure} → ${answers.destination}` : null
  parts.push(
    `Client recherche ${[need ? lower(need) : 'un transport', frequency ? `(${lower(frequency)})` : null, route].filter(Boolean).join(' ')}.`,
  )

  const times = [
    answers.departure_time && `départ ${answers.departure_time.replace(':', 'h')}`,
    answers.trip_type === 'ROUND_TRIP' && answers.return_time && `retour ${answers.return_time.replace(':', 'h')}`,
  ].filter(Boolean)
  if (times.length) parts.push(`${times.join(', ')}.`.replace(/^./, (c) => c.toUpperCase()))

  if (answers.days_of_week?.length) {
    parts.push(`${answers.days_of_week.length} jour(s)/semaine (${answers.days_of_week.map((d) => label('days_of_week', d)).join(', ')}).`)
  }

  const passengers = isB2b(answers) ? answers.estimated_passengers_per_trip : answers.passengers_count
  if (passengers) parts.push(`${passengers} personne(s)${isB2b(answers) ? ' par trajet' : ''}.`)

  if (isB2b(answers) && answers.company_name) {
    parts.push(
      `Entreprise ${answers.company_name}${answers.employees_concerned ? `, ${answers.employees_concerned} employés concernés` : ''}${
        answers.decision_role ? ` (${lower(label('decision_role', answers.decision_role))})` : ''
      }.`,
    )
  }

  if (answers.shared_transport === 'YES') parts.push('Ouvert au transport partagé.')
  else if (answers.shared_transport === 'MAYBE') parts.push('Pourrait accepter le transport partagé.')
  else if (answers.shared_transport === 'NO') parts.push('Préfère un transport non partagé.')

  if (answers.current_provider && answers.current_provider !== 'NO') {
    parts.push(
      `Utilise actuellement : ${lower(label('current_provider', answers.current_provider))}${answers.pain_point ? ` – point de douleur : ${lower(answers.pain_point)}` : ''}.`,
    )
  } else if (answers.pain_point) {
    parts.push(`Point de douleur : ${lower(answers.pain_point)}.`)
  }

  if (answers.main_priority) parts.push(`Priorité : ${lower(label('main_priority', answers.main_priority))}.`)
  if (answers.wants_quotation) parts.push('Souhaite recevoir un devis.')

  return parts.join(' ')
}
