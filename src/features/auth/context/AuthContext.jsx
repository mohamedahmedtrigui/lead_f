import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ROLES } from '@/constants/domain'
import { onUnauthorized } from '@/lib/http'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | guest

  useEffect(() => {
    let active = true
    authApi
      .me()
      .then((me) => {
        if (!active) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        setUser(null)
        setStatus('guest')
      })
    return () => {
      active = false
    }
  }, [])

  // Session expired or account deactivated server-side.
  useEffect(
    () =>
      onUnauthorized(() => {
        setUser(null)
        setStatus('guest')
        queryClient.clear()
      }),
    [queryClient],
  )

  const login = useCallback(async (credentials) => {
    const me = await authApi.login(credentials)
    setUser(me)
    setStatus('authenticated')
    return me
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setStatus('guest')
      queryClient.clear()
    }
  }, [queryClient])

  const value = useMemo(
    () => ({
      user,
      status,
      isAdmin: user?.role === ROLES.ADMIN,
      isDispatcher: user?.role === ROLES.DISPATCHER,
      login,
      logout,
    }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

/** Landing page of a role. */
export const homePath = (user) => (user?.role === ROLES.ADMIN ? '/admin' : '/dashboard')
