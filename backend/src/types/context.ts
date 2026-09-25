import type { SessionRow } from "../db/schema";

/** Variables Hono injectées par le middleware d'authentification. */
export type AppBindings = {
  Variables: {
    sessionId: string;
    session: SessionRow;
  };
};
