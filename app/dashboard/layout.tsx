import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../src/context/AuthContext'

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Panel Principal
          </Link>
          <Link
            to="/dashboard/properties"
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Propiedades
          </Link>
          <Link
            to={user?.role === 'admin' ? '/dashboard/admin/agents' : '/dashboard/agents'}
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Agentes
          </Link>
          <Link
            to="/dashboard/features"
            className="block py-2 px-4 rounded hover:bg-gray-700"
          >
            Características
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-100">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
} 