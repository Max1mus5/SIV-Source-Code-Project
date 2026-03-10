'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { User } from '@/lib/types'
import { getUserProfile } from '@/lib/userService'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (partialUser: Partial<User>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'siv_token'
const USER_KEY = 'siv_user'

/**
 * Decode JWT and check if it's expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch {
    return true // If we can't decode, treat as expired
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Rehydrate from localStorage on mount and check token expiration
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      
      if (storedToken && storedUser) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          console.log('Token expired, clearing session')
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          return
        }
        
        setToken(storedToken)
        setUser(JSON.parse(storedUser) as User)
      }
    } catch (error) {
      console.error('Error rehydrating auth state:', error)
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiFetch<{ status: string; data: { token: string; user: User; expiresIn: number } }>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    
    // Backend devuelve { status: "success", data: { token, user, expiresIn } }
    const { token, user } = res.data
    
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token)
    setUser(user)
    
    console.log('✓ Login exitoso:', user.username || user.name)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  /**
   * Update user data in state and localStorage
   */
  const updateUser = useCallback((partialUser: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null
      const updatedUser = { ...prevUser, ...partialUser }
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      return updatedUser
    })
  }, [])

  /**
   * Refresh user data from backend
   */
  const refreshUser = useCallback(async () => {
    if (!user?.username) {
      console.warn('Cannot refresh user: no username available')
      return
    }
    
    try {
      const freshUser = await getUserProfile(user.username)
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
      setUser(freshUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
      // If 401, logout
      if (error instanceof ApiError && error.status === 401) {
        logout()
      }
    }
  }, [user?.username, logout])

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        token, 
        isAuthenticated: !!token, 
        login, 
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
