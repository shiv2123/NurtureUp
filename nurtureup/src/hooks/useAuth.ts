import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Redirect based on user role
      if (session?.user.role === 'CHILD') {
        router.push('/child/adventure')
      } else {
        router.push('/parent/home')
      }
    },
    [router, session]
  )

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }, [router])

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isParent: session?.user.role === 'PARENT',
    isChild: session?.user.role === 'CHILD',
    login,
    logout
  }
} 