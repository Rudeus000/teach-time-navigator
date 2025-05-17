
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type UserRole = 'COORDINADOR' | 'DOCENTE';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isCoordinador: boolean;
  isDocente: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a stored token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      
      // Set up axios interceptor
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Fetch user data
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await axios.get('/api/users/me/', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data', error);
      // If token is invalid, logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login/', { email, password });
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      
      // Set up axios interceptor
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Redirect based on role
      if (userData.role === 'COORDINADOR') {
        navigate('/dashboard');
        toast.success('Bienvenido, Coordinador!');
      } else {
        navigate('/perfil');
        toast.success('Bienvenido, Docente!');
      }
    } catch (error) {
      console.error('Login failed', error);
      toast.error('Credenciales inválidas. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
    toast.info('Has cerrado sesión');
  };

  const isAuthenticated = !!token && !!user;
  const isCoordinador = isAuthenticated && user?.role === 'COORDINADOR';
  const isDocente = isAuthenticated && user?.role === 'DOCENTE';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      isCoordinador,
      isDocente
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
