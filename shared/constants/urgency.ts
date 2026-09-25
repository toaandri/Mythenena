// Constantes — Ressources d'urgence à Madagascar
// ⚠️  Vérifier et mettre à jour ces numéros avant toute mise en production

import type { EmergencyResource } from "../types/chat";

export const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    name: "SAMU Madagascar",
    phone: "15",
    description: "Service d'aide médicale urgente",
    available24h: true,
  },
  {
    name: "Police Nationale",
    phone: "17",
    description: "Police nationale — urgences",
    available24h: true,
  },
  {
    name: "Pompiers",
    phone: "18",
    description: "Sapeurs-pompiers",
    available24h: true,
  },
  // TODO: Ajouter lignes d'écoute psychologique locales vérifiées
];

export const SAFETY_KEYWORDS_FR = [
  "suicide",
  "me tuer",
  "mourir",
  "en finir",
  "plus envie de vivre",
  "me faire du mal",
];

export const SAFETY_KEYWORDS_MG = [
  // Idées suicidaires / ne plus vouloir vivre
  "hamono tena",
  "tsy te ho velona",
  "ho faty",
  "faty tsara",
  "tsy misy antony hiainana",
  "vonoy aho",
  "ho vonoin",
  // Automutilation / blessures
  "mitsabo tena",
  "marary tena",
  "mandratra tena",
  // Désespoir / ne plus supporter
  "tsy mahazaka",
  "tsy zaka intsony",
  "tsy hahazaka",
  "lany hery",
  "reraka tanteraka",
  // Mort souhaitée
  "te ho maty",
  "maty vao tsara",
  "aleo maty",
  // TODO: Valider et compléter avec des locuteurs natifs malagasy avant mise en production
];

export const MAX_ADAPTIVE_QUESTIONS = 15;
export const MINI_SURVEY_QUESTIONS_COUNT = 5;
