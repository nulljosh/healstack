import { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem('dose:bodywork_sessions');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('dose:bodywork_sessions', JSON.stringify(sessions));
  }, [sessions]);

  function addSession(session) {
    setSessions(prev => [{ ...session, id: crypto.randomUUID(), date: new Date().toISOString() }, ...prev]);
  }

  function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  return (
    <SessionContext.Provider value={{ sessions, addSession, deleteSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  return useContext(SessionContext);
}
