'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuthRequired() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Ainda carregando

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
  }, [status, router])

  return { session, status, isLoading: status === 'loading' }
}