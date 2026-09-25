import { Hono } from "hono";

// GET  /api/forum/posts          — liste des posts (paginée)
// POST /api/forum/posts          — créer un post
// GET  /api/forum/posts/:id      — détail post + réponses
// POST /api/forum/posts/:id/reply — répondre à un post
// POST /api/forum/posts/:id/react — ajouter une réaction
// POST /api/forum/report         — signaler un contenu

const forum = new Hono();

forum.get("/posts", async (c) => {
  // TODO: retourner les posts paginés, filtrés par catégorie
  // Query params: ?category=&page=&limit=
  return c.json({ message: "TODO" }, 501);
});

forum.post("/posts", async (c) => {
  // TODO:
  // 1. Vérifier sessionId valide
  // 2. moderationService.check(content) avant enregistrement
  // 3. Générer pseudonyme + avatarSeed si pas déjà fait
  // 4. Enregistrer le post
  return c.json({ message: "TODO" }, 501);
});

forum.get("/posts/:id", async (c) => {
  // TODO: retourner le post avec ses réponses
  return c.json({ message: "TODO" }, 501);
});

forum.post("/posts/:id/reply", async (c) => {
  // TODO: ajouter une réponse au post
  return c.json({ message: "TODO" }, 501);
});

forum.post("/posts/:id/react", async (c) => {
  // TODO: ajouter/retirer une réaction (support, strength, notAlone, heart)
  return c.json({ message: "TODO" }, 501);
});

forum.post("/report", async (c) => {
  // TODO: enregistrer un signalement pour modération
  return c.json({ message: "TODO" }, 501);
});

export default forum;
