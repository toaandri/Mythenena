"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { apiFetch, getSessionToken, setSessionToken } from "@/lib/api";

export type AnonymousSession = {
  id: string;
  pseudonym: string;
  avatarSeed: string;
  language: "fr" | "mg";
  retainHistory: boolean;
};

type SessionContextValue = {
  session: AnonymousSession | null;
  loading: boolean;
  ensureSession: (language?: "fr" | "mg", pseudonym?: string) => Promise<AnonymousSession>;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  loading: true,
  ensureSession: async () => { throw new Error("SessionProvider absent"); },
  clearSession: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AnonymousSession | null>(null);
  const [loading, setLoading] = useState(true);
  const restoreSession = useRef<Promise<AnonymousSession | null>>(Promise.resolve(null));

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      setLoading(false);
      return;
    }
    restoreSession.current = apiFetch<{ session: AnonymousSession }>("/api/session/me")
      .then(({ session: current }) => {
        if (getSessionToken() !== token) return null;
        setSession(current);
        return current;
      })
      .catch(() => {
        if (getSessionToken() === token) setSessionToken(null);
        return null;
      })
      .finally(() => setLoading(false));
  }, []);

  const ensureSession = useCallback(async (language: "fr" | "mg" = "fr", pseudonym?: string) => {
    const restored = await restoreSession.current;
    if (restored && getSessionToken()) return restored;
    if (session && getSessionToken()) return session;
    const created = await apiFetch<{ token: string; session: AnonymousSession }>("/api/session/start", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ language, retainHistory: true, ...(pseudonym ? { pseudonym } : {}) }),
    });
    setSessionToken(created.token);
    restoreSession.current = Promise.resolve(created.session);
    setSession(created.session);
    return created.session;
  }, [session]);

  const clearSession = useCallback(() => {
    setSessionToken(null);
    restoreSession.current = Promise.resolve(null);
    setSession(null);
  }, []);

  return <SessionContext.Provider value={{ session, loading, ensureSession, clearSession }}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
