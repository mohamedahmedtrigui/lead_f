import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Alert, Button, Checkbox, Input } from '@/components/ui'
import { errorMessage, fieldErrors } from '@/lib/http'
import { homePath, useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)
    try {
      const user = await login(form)
      navigate(location.state?.from ?? homePath(user), { replace: true })
    } catch (error) {
      setErrors(fieldErrors(error))
      const code = error.response?.data?.code
      setMessage({ tone: code === 'account_pending' ? 'info' : 'danger', text: errorMessage(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
      <p className="mt-1 text-sm text-slate-500">Accédez à votre espace de qualification.</p>

      {message && !errors.email && (
        <Alert tone={message.tone} className="mt-6">
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <Checkbox label="Rester connecté" checked={form.remember} onChange={update('remember')} />
        <Button type="submit" size="lg" className="w-full" loading={submitting} icon={LogIn}>
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Nouveau dispatcher ?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
