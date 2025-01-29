import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext({});

// Mock user data
const MOCK_USER = {
  id: 'admin-123',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'admin',
  department: 'IT'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (username, password) => {
    // Hardcoded credential check
    if (username === 'admin' && password === '456') {
      setUser(MOCK_USER);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      return { user: MOCK_USER, error: null };
    }
    return { user: null, error: 'Invalid credentials' };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
