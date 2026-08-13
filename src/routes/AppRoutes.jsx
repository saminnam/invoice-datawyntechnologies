import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { CompanyProvider } from '../context/CompanyContext'

// Layouts
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'

// Pages
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'

// Customer Pages
import CustomerListPage from '../pages/customers/CustomerListPage'
import CustomerCreatePage from '../pages/customers/CustomerCreatePage'
import CustomerDetailPage from '../pages/customers/CustomerDetailPage'
import CustomerEditPage from '../pages/customers/CustomerEditPage'

// Product Pages
import ProductListPage from '../pages/products/ProductListPage'
import ProductCreatePage from '../pages/products/ProductCreatePage'
import ProductEditPage from '../pages/products/ProductEditPage'

// Proforma Invoice Pages
import ProformaListPage from '../pages/proforma/ProformaListPage'
import ProformaCreatePage from '../pages/proforma/ProformaCreatePage'
import ProformaDetailPage from '../pages/proforma/ProformaDetailPage'
import ProformaEditPage from '../pages/proforma/ProformaEditPage'

// Invoice Pages
import InvoiceListPage from '../pages/invoices/InvoiceListPage'
import InvoiceDetailPage from '../pages/invoices/InvoiceDetailPage'

// Settings Pages
import CompanySettingsPage from '../pages/settings/CompanySettingsPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <CompanyProvider>
            <DashboardLayout />
          </CompanyProvider>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Customer Routes */}
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="customers/new" element={<CustomerCreatePage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="customers/:id/edit" element={<CustomerEditPage />} />
        
        {/* Product Routes */}
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
        
        {/* Proforma Invoice Routes */}
        <Route path="proforma" element={<ProformaListPage />} />
        <Route path="proforma/new" element={<ProformaCreatePage />} />
        <Route path="proforma/:id" element={<ProformaDetailPage />} />
        <Route path="proforma/:id/edit" element={<ProformaEditPage />} />
        
        {/* Invoice Routes */}
        <Route path="invoices" element={<InvoiceListPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        
        {/* Settings Routes */}
        <Route path="settings/company" element={<CompanySettingsPage />} />
      </Route>
      
      {/* Catch all - redirect to login if not authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
