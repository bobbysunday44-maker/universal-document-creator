import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiLogin, apiRegister, apiGetMe, type AuthUser } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(apiUser: AuthUser): User {
  return {
    id: String(apiUser.id),
    email: apiUser.email,
    name: apiUser.name,
    plan: apiUser.plan,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount and validate it
    const token = localStorage.getItem('udc_token');
    if (token) {
      apiGetMe()
        .then((apiUser) => {
          setUser(toUser(apiUser));
        })
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem('udc_token');
          localStorage.removeItem('udc_user');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('udc_token', data.token);
    localStorage.setItem('udc_user', JSON.stringify(data.user));
    setUser(toUser(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiRegister(name, email, password);
    localStorage.setItem('udc_token', data.token);
    localStorage.setItem('udc_user', JSON.stringify(data.user));
    setUser(toUser(data.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('udc_token');
    localStorage.removeItem('udc_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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
