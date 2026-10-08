import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, UserPlus } from 'lucide-react'
import { Alert, Button, Input } from '@/components/ui'
import { errorMessage, fieldErrors } from '@/lib/http'
import { authApi } from '../api/authApi'

const initial = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setError(null)
    try {
      const response = await authApi.register(form)
      setDone(response.message)
    } catch (err) {
      setErrors(fieldErrors(err))
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="text-2xl font-bold text-slate-900">Inscription envoyée</h2>
        <p className="mt-2 text-sm text-slate-500">{done}</p>
        <Button as={Link} to="/login" variant="secondary" className="mt-6">
          Retour à la connexion
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Inscription dispatcher</h2>
      <p className="mt-1 text-sm text-slate-500">Votre compte sera actif après validation par un administrateur.</p>

      {error && !Object.keys(errors).length && (
        <Alert tone="danger" className="mt-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Prénom" required autoFocus value={form.first_name} onChange={update('first_name')} error={errors.first_name} autoComplete="given-name" />
          <Input label="Nom" required value={form.last_name} onChange={update('last_name')} error={errors.last_name} autoComplete="family-name" />
        </div>
        <Input label="Adresse e-mail" type="email" required value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" />
        <Input
          label="Téléphone"
          type="tel"
          required
          placeholder="+216 20 000 000"
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
          autoComplete="tel"
        />
        <Input
          label="Mot de passe"
          type="password"
          required
          hint="8 caractères minimum, avec majuscule, minuscule et chiffre."
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          label="Confirmation du mot de passe"
          type="password"
          required
          value={form.password_confirmation}
          onChange={update('password_confirmation')}
          error={errors.password_confirmation}
          autoComplete="new-password"
        />
        <Button type="submit" size="lg" className="w-full" loading={submitting} icon={UserPlus}>
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
