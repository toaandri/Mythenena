import "dotenv/config";
import { db } from "./index";
import { professionals } from "./schema";

/**
 * Seed — données fictives pour la démonstration hackathon
 * Les fiches fictives ont isFictional = true et les actions de contact sont désactivées.
 */
async function seed() {
  console.log("🌱 Seeding annuaire avec données fictives...");

  await db.insert(professionals).values([
    {
      id: "pro-001",
      name: "Dr. Rakoto Marie (FICTIF)",
      title: "Psychologue clinicienne",
      city: "Antananarivo",
      region: "Analamanga",
      languages: JSON.stringify(["fr", "mg"]),
      specialties: JSON.stringify(["anxiété", "dépression", "TCC"]),
      modalities: JSON.stringify(["in-person", "online"]),
      phone: null,
      email: null,
      address: "Antananarivo, Madagascar",
      lastVerified: new Date().toISOString(),
      isFictional: true,
      acceptsNewPatients: true,
    },
    {
      id: "pro-002",
      name: "Dr. Razafy Jean-Paul (FICTIF)",
      title: "Psychiatre",
      city: "Toamasina",
      region: "Atsinanana",
      languages: JSON.stringify(["fr"]),
      specialties: JSON.stringify(["burn-out", "stress post-traumatique"]),
      modalities: JSON.stringify(["in-person"]),
      phone: null,
      email: null,
      address: "Toamasina, Madagascar",
      lastVerified: new Date().toISOString(),
      isFictional: true,
      acceptsNewPatients: false,
    },
  ]).onConflictDoNothing();

  console.log("✅ Seed terminé.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
