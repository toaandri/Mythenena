import { Hono } from "hono";

// GET /api/annuaire/professionals  — liste + recherche
// GET /api/annuaire/professionals/:id — détail fiche
// GET /api/annuaire/associations    — associations d'écoute

const annuaire = new Hono();

annuaire.get("/professionals", async (c) => {
  // TODO: retourner les fiches filtrées
  // Query params: ?city=&language=&modality=&specialty=
  // Indiquer clairement isFictional dans la réponse
  return c.json({ message: "TODO" }, 501);
});

annuaire.get("/professionals/:id", async (c) => {
  // TODO: retourner le détail d'une fiche professionnelle
  return c.json({ message: "TODO" }, 501);
});

annuaire.get("/associations", async (c) => {
  // TODO: retourner les associations
  return c.json({ message: "TODO" }, 501);
});

export default annuaire;
