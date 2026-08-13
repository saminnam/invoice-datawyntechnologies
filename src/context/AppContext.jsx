import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [globalLoading, setGlobalLoading] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const value = {
    sidebarOpen,
    toggleSidebar,
    globalLoading,
    setGlobalLoading,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
