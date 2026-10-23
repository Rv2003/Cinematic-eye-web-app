import { Outlet, Navigate } from 'react-router'
import { LoadingScreen } from '../components/loading'

export function AdminProtectedRoutes({ user, authLoading }) {
  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const isAdmin =
    user === 'admin' ||
    user?.role === 'admin' ||
    user?.role === 'Admin' ||
    user?.isAdmin === true ||
    user?.email?.toLowerCase().includes('admin')

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
