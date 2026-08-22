import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { CompanyProvider } from './context/CompanyContext'

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppProvider>
          <CompanyProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </CompanyProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
