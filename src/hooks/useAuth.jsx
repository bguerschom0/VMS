import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimer = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        resetLogoutTimer();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const resetLogoutTimer = () => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      logout();
    }, 5 * 60 * 1000); // 5 minutes
  };


const login = async (username, password) => {
  try {
    // First check user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError) throw new Error('Invalid credentials');

    // First check if there's a valid temporary password
    if (userData?.temp_password) {
      const tempPasswordValid = 
        userData.temp_password === password && 
        new Date(userData.temp_password_expires) > new Date();

      if (tempPasswordValid) {
        return { 
          user: userData, 
          error: null, 
          passwordChangeRequired: true  // Always true for temp password
        };
      }
    }

    // If no valid temp password, check regular password
    if (!userData.password) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, userData.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString() 
      })
      .eq('id', userData.id);

    if (updateError) console.error('Error updating last login:', updateError);

    return { 
      user: userData, 
      error: null, 
      passwordChangeRequired: false
    };
  } catch (error) {
    console.error('Login error:', error.message);
    return { user: null, error: error.message };
  }
};

  const updatePassword = async (userId, newPassword) => {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          temp_password: null,
          temp_password_expires: null,
          password_change_required: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update user in state and localStorage
      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      resetLogoutTimer();

      return { error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    clearTimeout(logoutTimer.current);
  };

  // Reset logout timer on user activity
  useEffect(() => {
    const resetTimerOnActivity = () => resetLogoutTimer();
    window.addEventListener('mousemove', resetTimerOnActivity);
    window.addEventListener('keydown', resetTimerOnActivity);
    window.addEventListener('click', resetTimerOnActivity);
    window.addEventListener('scroll', resetTimerOnActivity);

    return () => {
      window.removeEventListener('mousemove', resetTimerOnActivity);
      window.removeEventListener('keydown', resetTimerOnActivity);
      window.removeEventListener('click', resetTimerOnActivity);
      window.removeEventListener('scroll', resetTimerOnActivity);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
