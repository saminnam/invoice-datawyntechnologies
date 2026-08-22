import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PermissionRoute = ({ children, requiredPermission = null }) => {
  const { hasPermission, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PermissionRoute
