import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        
        // Verify token is still valid (skip if server is not available)
        try {
          const response = await authService.getCurrentUser()
          if (response.success) {
            setUser(response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
          } else {
            // Clear invalid token
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
          }
        } catch (error) {
          // Only clear token on 401 errors, keep user for other errors (server might be down)
          if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
          } else {
            console.warn('Auth verification failed (server may be unavailable):', error)
            // Keep the stored user to prevent continuous refreshing
          }
        }
      }
      setLoading(false)
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password)
      if (response.success) {
        const { token, user } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
        toast.success('Login successful')
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      toast.success('Logged out successfully')
    }
  }, [])

  const isAuthenticated = useCallback(() => {
    return !!token && !!user
  }, [token, user])

  const hasRole = useCallback((roles) => {
    if (!user) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }, [user])

  const hasPermission = useCallback((permissionName) => {
    if (!user) return false
    
    // Admin users have all permissions (check multiple ways)
    const isAdmin = user.role?.name === 'Admin' || 
                    user.role?.name?.toLowerCase() === 'admin' ||
                    user.role?.name?.toLowerCase().includes('admin') ||
                    user.legacyRole === 'admin' ||
                    user.role === 'admin'
    
    if (isAdmin) {
      return true
    }
    
    // Check direct permissions
    const hasDirectPermission = user.permissions?.some(p => p.name === permissionName)
    
    // Check role permissions (handle both populated and unpopulated)
    let hasRolePermission = false
    if (user.role?.permissions && user.role.permissions.length > 0) {
      // If permissions is an array of objects (populated)
      if (typeof user.role.permissions[0] === 'object') {
        hasRolePermission = user.role.permissions.some(p => p.name === permissionName)
      } else {
        // If permissions is an array of IDs (not populated), we can't check without refetching
        console.warn('Role permissions are not populated, cannot check permissions properly')
      }
    }
    
    const result = hasDirectPermission || hasRolePermission
    return result
  }, [user])

  const hasAnyPermission = useCallback((permissionNames) => {
    if (!user) return false
    
    // Admin users have all permissions (check multiple ways)
    const isAdmin = user.role?.name === 'Admin' || 
                    user.role?.name?.toLowerCase() === 'admin' ||
                    user.role?.name?.toLowerCase().includes('admin') ||
                    user.legacyRole === 'admin' ||
                    user.role === 'admin'
    
    if (isAdmin) return true
    
    return permissionNames.some(perm => hasPermission(perm))
  }, [user, hasPermission])

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser()
      if (response.success) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasPermission,
    hasAnyPermission,
    refreshUser,
  }), [user, token, loading, login, logout, isAuthenticated, hasRole, hasPermission, hasAnyPermission, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
