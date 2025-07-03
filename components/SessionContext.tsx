"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Session = { username: string; role: 'supervisor' | 'user' } | null;

type SessionContextType = {
  session: Session;
  login: (username: string, role: 'supervisor' | 'user') => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    const stored = localStorage.getItem('iWmsSession');
    if (stored) setSession(JSON.parse(stored));
  }, []);

  const login = (username: string, role: 'supervisor' | 'user') => {
    setSession({ username, role });
    localStorage.setItem('iWmsSession', JSON.stringify({ username, role }));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('iWmsSession');
  };

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
} 