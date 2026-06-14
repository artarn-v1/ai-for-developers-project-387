import { Outlet } from 'react-router-dom'

export default function ClientLayout() {
  return (
    <div style={{
      background: '#18181b',
      minHeight: '100vh',
    }}>
      <Outlet />
    </div>
  )
}
