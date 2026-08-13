import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FiMenu, FiX, FiHome, FiUsers, FiBox, FiFileText, FiSettings, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useCompany } from '../context/CompanyContext'
import Breadcrumbs from '../components/Breadcrumbs'
import defaultLogo from '../assets/datawyn-logo.png'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const { sidebarOpen, toggleSidebar } = useApp()
  const { companySettings } = useCompany()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/customers', icon: FiUsers, label: 'Customers' },
    { path: '/products', icon: FiBox, label: 'Products' },
    { path: '/proforma', icon: FiFileText, label: 'Proforma Invoices' },
    { path: '/invoices', icon: FiFileText, label: 'Invoices' },
    { path: '/settings/company', icon: FiSettings, label: 'Settings' },
  ]

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <img
              src={companySettings?.logo || defaultLogo}
              alt="Company Logo"
              className="w-8 h-8 object-contain"
            />
            {/* <h1 className="text-lg font-semibold text-gray-900">
              {companySettings?.companyName || 'Datawyn CRM'}
            </h1> */}
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="bg-white w-64 h-full p-4">
            <nav className="space-y-2 mt-16">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
              >
                <FiLogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden lg:block`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-center gap-3">
            <img
              src={companySettings?.logo || defaultLogo}
              alt="Company Logo"
              className={`object-contain ${sidebarOpen ? 'w-[100px]' : 'w-8 h-8'}`}
            />
            {/* <h1
              className={`font-semibold text-gray-900 ${
                sidebarOpen ? 'text-lg' : 'text-xs text-center'
              }`}
            >
              {sidebarOpen ? (companySettings?.companyName || 'Datawyn CRM') : 'DT'}
            </h1> */}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } pt-16 lg:pt-0`}
      >
        <div className="p-4 lg:p-8">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
