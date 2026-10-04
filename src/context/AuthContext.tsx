import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Currency } from '../types/erp';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, businessName?: string, defaultCurrency?: Currency) => { success: boolean; error?: string };
  resetPassword: (email: string, newPassword: string) => { success: boolean; error?: string };
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
  loginDemoUser: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const USERS_STORAGE_KEY = 'finan_erp_registered_users_v1';
const SESSION_STORAGE_KEY = 'finan_erp_current_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash simulation for client storage
function hashPassword(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const user = JSON.parse(savedSession);
        if (user.businessName === 'Max Inversiones & Servicios E.I.R.L.') {
          user.businessName = undefined;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
        }
        setCurrentUser(user);
      } else {
        // If no user is logged in, auto-login demo user on first visit for zero-friction exploration
        const registeredUsers = getRegisteredUsers();
        if (registeredUsers.length === 0) {
          const demoUser: User = {
            id: 'usr_demo_vip',
            name: 'Fredy Max',
            email: 'fredymax088@gmail.com',
            businessName: undefined,
            defaultCurrency: 'PEN',
            passwordHash: hashPassword('admin123'),
            avatarColor: '#10b981',
            createdAt: new Date().toISOString(),
          };
          saveUser(demoUser);
          setCurrentUser(demoUser);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoUser));
        }
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRegisteredUsers = (): User[] => {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveUser = (user: User) => {
    const users = getRegisteredUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    
    if (!user) {
      return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
    }

    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Contraseña incorrecta. Por favor intente nuevamente.' };
    }

    setCurrentUser(user);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return { success: true };
  };

  const register = (
    name: string,
    email: string,
    password: string,
    businessName?: string,
    defaultCurrency: Currency = 'PEN'
  ): { success: boolean; error?: string } => {
    const users = getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      businessName: businessName?.trim() || undefined,
      defaultCurrency,
      passwordHash: hashPassword(password),
      avatarColor: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 5)],
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setCurrentUser(newUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const resetPassword = (email: string, newPassword: string): { success: boolean; error?: string } => {
    const users = getRegisteredUsers();
    const index = users.findIndex(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    
    if (index === -1) {
      return { success: false, error: 'No se encontró ninguna cuenta asociada a este correo.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener mínimo 6 caracteres.' };
    }

    users[index].passwordHash = hashPassword(newPassword);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    if (currentUser?.id === users[index].id) {
      setCurrentUser(users[index]);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(users[index]));
    }

    return { success: true };
  };

  const changePassword = (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'No hay una sesión activa.' };
    }

    if (currentUser.passwordHash !== hashPassword(currentPassword)) {
      return { success: false, error: 'La contraseña actual no es correcta.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener mínimo 6 caracteres.' };
    }

    const newHash = hashPassword(newPassword);
    const users = getRegisteredUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index >= 0) {
      users[index].passwordHash = newHash;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    const updated = { ...currentUser, passwordHash: newHash };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));

    return { success: true };
  };

  const loginDemoUser = () => {
    const demoUser: User = {
      id: 'usr_demo_vip',
      name: 'Fredy Max',
      email: 'fredymax088@gmail.com',
      businessName: undefined,
      defaultCurrency: 'PEN',
      passwordHash: hashPassword('admin123'),
      avatarColor: '#10b981',
      createdAt: new Date().toISOString(),
    };
    saveUser(demoUser);
    setCurrentUser(demoUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    saveUser(updated);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        resetPassword,
        changePassword,
        loginDemoUser,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
