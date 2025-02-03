import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const logoutTimer = useRef(null) // Ref to hold logout timer

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUser(data.session.user)
        localStorage.setItem('user', JSON.stringify(data.session.user))
        resetLogoutTimer() // Start inactivity timer
      } else {
        setUser(null)
        localStorage.removeItem('user')
      }
      setLoading(false)
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        localStorage.setItem('user', JSON.stringify(session.user))
        resetLogoutTimer() // Restart inactivity timer
      } else {
        localStorage.removeItem('user')
        clearTimeout(logoutTimer.current)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  // Reset inactivity logout timer
  const resetLogoutTimer = () => {
    clearTimeout(logoutTimer.current) // Clear existing timer
    logoutTimer.current = setTimeout(() => {
      logout() // Auto logout after 5 minutes
    }, 5 * 60 * 1000) // 5 minutes (300,000 ms)
  }

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      resetLogoutTimer() // Start inactivity timer after login
      return { user: data.user, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { user: null, error: error.message }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('user')
    clearTimeout(logoutTimer.current) // Clear logout timer
  }

  // Listen for user activity to reset the logout timer
  useEffect(() => {
    const resetTimerOnActivity = () => resetLogoutTimer()

    window.addEventListener('mousemove', resetTimerOnActivity)
    window.addEventListener('keydown', resetTimerOnActivity)
    window.addEventListener('click', resetTimerOnActivity)
    window.addEventListener('scroll', resetTimerOnActivity)

    return () => {
      window.removeEventListener('mousemove', resetTimerOnActivity)
      window.removeEventListener('keydown', resetTimerOnActivity)
      window.removeEventListener('click', resetTimerOnActivity)
      window.removeEventListener('scroll', resetTimerOnActivity)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
