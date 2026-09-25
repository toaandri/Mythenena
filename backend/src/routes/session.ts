import { Hono } from "hono";

// POST /api/session/start   — créer une session anonyme
// GET  /api/session/me      — récupérer la session courante
// DELETE /api/session/clear — supprimer l'historique

const session = new Hono();

session.post("/start", async (c) => {
  // TODO: générer un sessionId anonyme (UUID), pseudonyme et avatarSeed
  // Enregistrer en base via Supabase
  return c.json({ message: "TODO" }, 501);
});

session.get("/me", async (c) => {
  // TODO: lire le JWT depuis Authorization header, retourner la session
  return c.json({ message: "TODO" }, 501);
});

session.delete("/clear", async (c) => {
  // TODO: supprimer messages, réponses de l'utilisateur selon son choix
  return c.json({ message: "TODO" }, 501);
});

export default session;
