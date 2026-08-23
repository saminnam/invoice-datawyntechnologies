import { useState, useEffect } from 'react'
import { FiClock, FiUser, FiShield } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const WelcomeHeader = () => {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getRoleName = () => {
    if (user?.role?.name) return user.role.name
    if (user?.role) return user.role
    if (user?.legacyRole) return user.legacyRole
    return 'User'
  }

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm px-4 py-3">
      {/* Time */}
      <div className="flex items-center gap-2 text-gray-600">
        <FiClock size={18} />
        <span className="text-sm font-medium">{formatTime(currentTime)}</span>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Welcome Message */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          {getGreeting()}, <span className="font-semibold text-gray-900">{user?.name || 'User'}</span>
        </span>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Role */}
      <div className="flex items-center gap-2 text-gray-600">
        <FiShield size={18} />
        <span className="text-sm font-medium">{getRoleName()}</span>
      </div>
    </div>
  )
}

export default WelcomeHeader
