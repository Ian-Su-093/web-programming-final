import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, logout as apiLogout, updateUserPreference, type UserResponseModel, type UserPreferenceRequest } from '@/lib/api'

interface AuthContextType {
    user: UserResponseModel | null
    isAuthenticated: boolean
    isLoading: boolean
    checkAuth: () => Promise<void>
    logout: () => Promise<void>
    updatePreferences: (preferences: UserPreferenceRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserResponseModel | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkAuth = async () => {
        try {
            const response = await getCurrentUser()
            if (response.status === 'success' && response.user) {
                setUser(response.user)
            } else {
                setUser(null)
            }
        } catch (error) {
            // User is not authenticated (401 or other error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await apiLogout()
        } catch (error) {
            // Even if logout fails, clear local state
            console.error('Logout error:', error)
        } finally {
            setUser(null)
        }
    }

    const updatePreferences = async (preferences: UserPreferenceRequest) => {
        try {
            const response = await updateUserPreference(preferences)
            if (response.status === 'success' && response.user) {
                setUser(response.user)
            }
        } catch (error) {
            console.error('Failed to update preferences:', error)
            throw error
        }
    }

    // Check authentication on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        isLoading,
        checkAuth,
        logout,
        updatePreferences,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

