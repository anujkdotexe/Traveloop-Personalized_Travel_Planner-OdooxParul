import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Decode JWT payload without a library
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('traveloop_token'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('traveloop_token');
      const storedUser  = localStorage.getItem('traveloop_user');
      if (storedToken && !isTokenExpired(storedToken) && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (storedToken) {
        // Token present but expired — clean up
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken) => {
    try {
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('traveloop_token', authToken);
      localStorage.setItem('traveloop_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to persist auth to localStorage:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('traveloop_token');
      localStorage.removeItem('traveloop_user');
    } catch {}
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    try { localStorage.setItem('traveloop_user', JSON.stringify(updated)); } catch {}
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
