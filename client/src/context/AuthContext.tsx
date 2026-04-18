import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { IStudent } from '../types/student.types';

interface AuthContextType {
  user: IStudent | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// `api` is successfully imported from services/api.ts

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromApi = async (): Promise<IStudent | null> => {
    try {
      const response = await api.get('/api/v1/students/me');
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchUser = async () => {
    const userData = await loadUserFromApi();
    setUser(userData);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await api.get('/api/v1/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    loadUserFromApi().then((userData) => {
      if (mounted) {
        setUser(userData);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refetchUser: fetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
