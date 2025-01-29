import { create } from 'zustand'
import { supabase } from '../config/supabase'

const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        // Fetch additional user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userError) throw userError
        
        set({ user: { ...session.user, ...userData }, loading: false })
      } else {
        set({ user: null, loading: false })
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null })
      
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Fetch additional user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError) throw userError

      set({ 
        user: { ...user, ...userData },
        loading: false,
        error: null
      })

      return { success: true }
    } catch (error) {
      set({ 
        user: null,
        loading: false,
        error: error.message
      })
      return { success: false, error: error.message }
    }
  },

  logout: async () => {
    try {
      set({ loading: true })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ 
        user: null,
        loading: false,
        error: null
      })
      
      return { success: true }
    } catch (error) {
      set({ 
        loading: false,
        error: error.message
      })
      return { success: false, error: error.message }
    }
  },

  clearError: () => set({ error: null })
}))

export default useAuth
