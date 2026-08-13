import { createContext, useContext, useState, useEffect } from 'react'
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
        
        // Verify token is still valid
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
          // Clear invalid token on error
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
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
  }

  const logout = async () => {
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
  }

  const isAuthenticated = () => {
    return !!token && !!user
  }

  const hasRole = (roles) => {
    if (!user) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
