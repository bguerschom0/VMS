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
  const logoutTimer = useRef(null) // Holds the logout timer

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
        resetLogoutTimer() // Start inactivity timer
      }
      setLoading(false)
    }

    checkUser()
  }, [])

  // Reset inactivity timer
  const resetLogoutTimer = () => {
    clearTimeout(logoutTimer.current)
    logoutTimer.current = setTimeout(() => {
      logout()
    }, 5 * 60 * 1000) // 5 minutes (300,000 ms)
  }

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password) // Assuming password is stored as a hash
        .single()

      if (error || !data) {
        throw new Error('Invalid credentials')
      }

      setUser(data)
      localStorage.setItem('user', JSON.stringify(data)) // Store user in local storage
      resetLogoutTimer() // Start inactivity timer
      return { user: data, error: null }
    } catch (error) {
      console.error('Login error:', error.message)
      return { user: null, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    clearTimeout(logoutTimer.current)
  }

  // Reset logout timer on user activity
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
