import { Outlet } from 'react-router-dom'
import { CalendarClock, PhoneCall, Route, Users } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'

const highlights = [
  { icon: PhoneCall, text: 'Script d’appel guidé, étape par étape' },
  { icon: Route, text: 'Trajets, horaires et fréquences structurés' },
  { icon: Users, text: 'Détection automatique des besoins B2B' },
  { icon: CalendarClock, text: 'Rappels, NRP et suivi des leads' },
]

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-600/60" />
        <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-brand-800/60" />
        <div className="relative">
          <Logo inverted />
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Qualifiez chaque lead
            <br />
            en 5 minutes.
          </h1>
          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-50">
                <span className="rounded-lg bg-white/10 p-2">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-200">Plateforme interne MiralDrive · Transport programmé</p>
      </aside>
      <main className="flex items-center justify-center bg-white px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
