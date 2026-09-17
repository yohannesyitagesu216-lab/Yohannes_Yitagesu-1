import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { supabase } from '../lib/supabase'

interface AuthCallbackPageProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function AuthCallbackPage({ setIsAuthenticated }: AuthCallbackPageProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const completeGoogleLogin = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!session?.user?.email) {
          throw new Error('Google session was not found.')
        }

        const fullName = session.user.user_metadata?.full_name
          || session.user.user_metadata?.name
          || session.user.email.split('@')[0]
          || 'Google User'

        const response = await apiClient.syncGoogleUser({
          name: fullName,
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || null,
        })

        if (!response.success || !response.data?.token) {
          throw new Error(response.message || 'Google sign-in failed.')
        }

        localStorage.setItem('agrovision_token', response.data.token)
        setIsAuthenticated(true)
        navigate('/dashboard', { replace: true })
      } catch (error: any) {
        console.error('Supabase Google sign-in failed:', error)
        navigate(`/login?error=${encodeURIComponent(error?.message || 'Google sign-in failed.')}`, { replace: true })
      }
    }

    void completeGoogleLogin()
  }, [navigate, setIsAuthenticated])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6 text-center text-[var(--text-primary)]">
      <div className="rounded-2xl border border-[rgba(16,185,129,0.2)] bg-[rgba(255,255,255,0.04)] px-8 py-6 shadow-xl backdrop-blur-sm">
        <p className="text-lg font-semibold">Finishing Google sign-in...</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Please wait while we complete your account setup.</p>
      </div>
    </div>
  )
}
