import { ProtectedRoute } from '@/components/features/auth/protected-route'
import { LogoutButton } from '@/components/features/auth/logout-button'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>
        <p className="mt-4 text-gray-600">Welcome to the Fine Tracker dashboard!</p>
      </div>
    </ProtectedRoute>
  )
}