import { createContext, useContext, useState, useEffect } from 'react'
import { companyService } from '../services/companyService'

const CompanyContext = createContext(null)

export const CompanyProvider = ({ children }) => {
  const [companySettings, setCompanySettings] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCompanySettings = async () => {
    setLoading(true)
    try {
      const response = await companyService.getCompanySettings()
      if (response.success) {
        setCompanySettings(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch company settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanySettings()
  }, [])

  const value = {
    companySettings,
    loading,
    refreshCompany: fetchCompanySettings,
  }

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
}

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}
