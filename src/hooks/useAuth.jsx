import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if a user is logged in
    const session = supabase.auth.session()
    setUser(session?.user ?? null)
    setLoading(false)

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  // Sign in method using email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        throw new Error('User not found')
      }

      // Check if the password matches
      if (data.password === password) {
        setUser(data) // Successfully logged in, save user info
        return data
      } else {
        throw new Error('Incorrect password')
      }
    } catch (error) {
      throw error
    }
  }

  // Sign out method
  const signOut = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
