import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { checkAuth, isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    if (!hasChecked) {
      setHasChecked(true)
      checkAuth().catch(() => {
        setError('Authentication failed. Please try again.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      })
    }
  }, [checkAuth, navigate, hasChecked])

  // Redirect when authentication state is determined
  useEffect(() => {
    if (!isLoading && hasChecked) {
      if (isAuthenticated) {
        navigate('/user/dashboard')
      } else if (!error) {
        setError('Authentication failed. Please try again.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    }
  }, [isLoading, isAuthenticated, navigate, hasChecked, error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#21252B]">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-[#5C6370] text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61AFEF] mx-auto mb-4"></div>
            <p className="text-[#ABB2BF]">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  )
}

