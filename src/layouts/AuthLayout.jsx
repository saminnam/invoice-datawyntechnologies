import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  console.log('AuthLayout rendering')
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="w-full max-w-md" style={{ width: '100%', maxWidth: '28rem' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
