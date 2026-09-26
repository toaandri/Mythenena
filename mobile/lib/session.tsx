import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, getSessionToken, setSessionToken } from '@/lib/api';

export type AnonymousSession = {
  id: string;
  pseudonym: string;
  avatarSeed: string;
  language: 'fr' | 'mg';
  retainHistory: boolean;
};

type SessionContextValue = {
  session: AnonymousSession | null;
  loading: boolean;
  ensureSession: (language?: 'fr' | 'mg', pseudonym?: string) => Promise<AnonymousSession>;
  clearSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  loading: true,
  ensureSession: async () => { throw new Error('SessionProvider absent'); },
  clearSession: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AnonymousSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getSessionToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { session: current } = await apiFetch<{ session: AnonymousSession }>('/api/session/me');
        setSession(current);
      } catch {
        await setSessionToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const ensureSession = useCallback(async (language: 'fr' | 'mg' = 'fr', pseudonym?: string) => {
    const token = await getSessionToken();
    if (session && token) return session;

    const created = await apiFetch<{ token: string; session: AnonymousSession }>('/api/session/start', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ language, retainHistory: true, ...(pseudonym ? { pseudonym } : {}) }),
    });
    await setSessionToken(created.token);
    setSession(created.session);
    return created.session;
  }, [session]);

  const clearSession = useCallback(async () => {
    await setSessionToken(null);
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading, ensureSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
