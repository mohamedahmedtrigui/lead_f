import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/ui'
import { homePath, useAuth } from '../context/AuthContext'

/** Authenticated users only. Optionally restricted to some roles. */
export function RequireAuth({ roles }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user)} replace />

  return <Outlet />
}

/** Login / register pages: redirect authenticated users to their home. */
export function GuestOnly() {
  const { user, status } = useAuth()

  if (status === 'loading') return <PageLoader />
  if (user) return <Navigate to={homePath(user)} replace />

  return <Outlet />
}

export function HomeRedirect() {
  const { user, status } = useAuth()
  if (status === 'loading') return <PageLoader />
  return <Navigate to={user ? homePath(user) : '/login'} replace />
}
