// src/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';

export const USERS = {
  EMP101: {
    id: 'EMP101',
    name: 'Roshan Kumar Patra',
    role: 'EMPLOYEE',
    designation: 'Cloud Developer Intern',
    department: 'Engineering',
    email: 'roshan@company.com',
  },
  MGR001: {
    id: 'MGR001',
    name: 'Lead Manager',
    role: 'MANAGER',
    designation: 'Engineering Lead',
    department: 'Management',
    email: 'manager@company.com',
  },
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sap_leave_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read user session from storage', e);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const login = (user) => {
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('sap_leave_user', JSON.stringify(user));
      } catch (e) {
        console.warn('Could not save user session', e);
      }
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sap_leave_user');
    } catch (e) {
      console.warn('Could not clear user session', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthReady,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
      {isAuthModalOpen && <AuthModal />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}