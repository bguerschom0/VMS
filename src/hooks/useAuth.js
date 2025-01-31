import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .single();

        if (data) {
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single();

      if (error) throw error;

      if (data) {
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        setUser(data);
        return { user: data, error: null };
      }

      return { user: null, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: error.message };
    }
  };

  const logout = async () => {
    setUser(null);
  };

  return { 
    user, 
    loading, 
    login, 
    logout 
  };
};
