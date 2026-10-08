import { lazy, Suspense } from 'react'
import { createBrowserRouter, Link } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, EmptyState, PageLoader } from '@/components/ui'
import { ROLES } from '@/constants/domain'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { GuestOnly, HomeRedirect, RequireAuth } from '@/features/auth/components/RouteGuards'

// Route-level code splitting: each feature page is its own chunk.
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const DispatcherDashboardPage = lazy(() => import('@/features/dashboard/pages/DispatcherDashboardPage'))
const AdminDashboardPage = lazy(() => import('@/features/dashboard/pages/AdminDashboardPage'))
const MyLeadsPage = lazy(() => import('@/features/leads/pages/MyLeadsPage'))
const CallWorkspacePage = lazy(() => import('@/features/calls/pages/CallWorkspacePage'))
const AdminLeadsPage = lazy(() => import('@/features/leads/pages/AdminLeadsPage'))
const AdminLeadDetailPage = lazy(() => import('@/features/leads/pages/AdminLeadDetailPage'))
const LeadImportPage = lazy(() => import('@/features/leads/pages/LeadImportPage'))
const DispatchersPage = lazy(() => import('@/features/dispatchers/pages/DispatchersPage'))
const ScriptEditorPage = lazy(() => import('@/features/script/pages/ScriptEditorPage'))
const CallHistoryPage = lazy(() => import('@/features/activity/pages/CallHistoryPage'))
const AuditLogPage = lazy(() => import('@/features/activity/pages/AuditLogPage'))

const page = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

function NotFound() {
  return (
    <EmptyState
      className="min-h-[60vh]"
      title="Page introuvable"
      description="Cette page n’existe pas ou vous n’y avez pas accès."
      action={
        <Button as={Link} to="/">
          Retour à l’accueil
        </Button>
      }
    />
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <HomeRedirect /> },
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: page(LoginPage) },
          { path: '/register', element: page(RegisterPage) },
        ],
      },
    ],
  },
  {
    element: <RequireAuth roles={[ROLES.DISPATCHER]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: page(DispatcherDashboardPage) },
          { path: '/leads', element: page(MyLeadsPage) },
          { path: '/leads/:id/call', element: page(CallWorkspacePage) },
        ],
      },
    ],
  },
  {
    element: <RequireAuth roles={[ROLES.ADMIN]} />,
    children: [
      {
        path: '/admin',
        element: <AppLayout />,
        children: [
          { index: true, element: page(AdminDashboardPage) },
          { path: 'leads', element: page(AdminLeadsPage) },
          { path: 'leads/:id', element: page(AdminLeadDetailPage) },
          { path: 'import', element: page(LeadImportPage) },
          { path: 'dispatchers', element: page(DispatchersPage) },
          { path: 'script', element: page(ScriptEditorPage) },
          { path: 'calls', element: page(CallHistoryPage) },
          { path: 'audit', element: page(AuditLogPage) },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [{ element: <AppLayout />, children: [{ path: '*', element: <NotFound /> }] }],
  },
])
