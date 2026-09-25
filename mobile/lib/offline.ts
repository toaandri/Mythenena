// Données accessibles hors-ligne
// Stockées localement via AsyncStorage pour les connexions limitées

export const OFFLINE_EMERGENCY_NUMBERS = [
  { name: "SAMU", phone: "15" },
  { name: "Police", phone: "17" },
  { name: "Pompiers", phone: "18" },
];

// TODO: stocker les articles de ressources essentiels hors-ligne
// TODO: stocker les exercices de respiration/méditation hors-ligne
export const OFFLINE_EXERCISES: unknown[] = [];
export const OFFLINE_ARTICLES: unknown[] = [];
