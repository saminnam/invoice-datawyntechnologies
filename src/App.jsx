import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AppProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
