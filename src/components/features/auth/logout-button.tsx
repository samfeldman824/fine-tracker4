'use client'

import { useAuth } from '@/hooks/auth/use-auth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const { signOut, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (!user) return null

  return (
    <Button variant="outline" onClick={handleLogout}>
      Sign Out ({user.email})
    </Button>
  )
}