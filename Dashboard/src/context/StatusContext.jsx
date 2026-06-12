import { createContext, useContext, useEffect, useState } from 'react';

// Evaluated / Passed / Shortlisted tracking — the human's verdict, persisted locally.
const STORAGE_KEY = 'engageiq-acquisition-status-v1';

export const STATUSES = ['Not reviewed', 'Evaluated', 'Passed', 'Shortlisted'];

const StatusContext = createContext(null);

export function StatusProvider({ children }) {
  const [statuses, setStatuses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  }, [statuses]);

  const getStatus = (title) => statuses[title] ?? 'Not reviewed';
  const setStatus = (title, status) =>
    setStatuses((prev) => {
      const next = { ...prev };
      if (status === 'Not reviewed') delete next[title];
      else next[title] = status;
      return next;
    });

  return (
    <StatusContext.Provider value={{ statuses, getStatus, setStatus }}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatus() {
  return useContext(StatusContext);
}
