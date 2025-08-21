'use client'

import { useAuthWithProfile } from '@/hooks/auth/use-auth-with-profile'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const { signOut, user, profile } = useAuthWithProfile()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600">
        Welcome, {profile?.display_name || user.email}
        {profile?.role && (
          <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
            {profile.role}
          </span>
        )}
      </div>
      <Button variant="outline" onClick={handleLogout}>
        Sign Out
      </Button>
    </div>
  )
}