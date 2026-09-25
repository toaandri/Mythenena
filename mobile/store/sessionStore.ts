import { create } from "zustand";

// State global de la session utilisateur anonyme
interface SessionState {
  sessionId: string | null;
  pseudonym: string | null;
  avatarSeed: string | null;
  language: "fr" | "mg";
  retainHistory: boolean;
  token: string | null;

  setSession: (data: Partial<SessionState>) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  pseudonym: null,
  avatarSeed: null,
  language: "fr",
  retainHistory: false,
  token: null,

  setSession: (data) => set((state) => ({ ...state, ...data })),
  clearSession: () =>
    set({
      sessionId: null,
      pseudonym: null,
      avatarSeed: null,
      token: null,
      retainHistory: false,
    }),
}));
