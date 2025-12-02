import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        // Show loading state while checking authentication
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#21252B]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61AFEF] mx-auto mb-4"></div>
                    <p className="text-[#ABB2BF]">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

