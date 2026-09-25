/**
 * Génération des pseudonymes et des graines d'avatar.
 *
 * Contraintes éthiques (cahier des charges) :
 *  - un pseudonyme est neutre, jamais dérisoir ni évocateur de troubles ;
 *  - il ne doit jamais suggérer un diagnostic, une maladie ou une.condition ;
 *  - il est régénérable et modifiable par l'utilisateur à tout moment.
 *
 * Les mots retenus sont des éléments de nature ou d'abstractions positives :
 * ni "¿Tristesse" ni "¿Souffrance" ne peuvent apparaître dans un pseudonyme.
 */

import { randomBytes } from "node:crypto";
import type { Language } from "../../../shared/types/survey";

const ADJECTIVES_FR = [
  "Calme",
  "Discret",
  "Doux",
  "Franc",
  "Honnête",
  "Léger",
  "Patient",
  "Serein",
  "Simple",
  "Sûr",
  "Tendre",
  "Vrai",
] as const;

const NOUNS_FR = [
  "Brise",
  "Chemin",
  "Falaise",
  "Feuillage",
  "Gravier",
  "Horizon",
  "Lanterne",
  "Marée",
  "Passage",
  "Pierre",
  "Rive",
  "Sentier",
  "Source",
  "Vallée",
  "Vent",
  "Voyage",
] as const;

// ⚠️  Ces listes en malagasy doivent être validées par des locuteurs natifs
//     avant toute mise en production (exigence explicite du cahier des charges).
const ADJECTIVES_MG = [
  "Malemy", // doux
  "Mazava", // clair
  "Mafana", // chaleureux
  "Mety", // juste
  "Vonona", // prêt, serein
] as const;

const NOUNS_MG = [
  "Kintana", // étoile
  "Hazo", // arbre
  "Rano", // eau
  "Ala", // forêt
  "Ravina", // feuille
  "Anka", // palmier
  "Masoandro", // soleil
  "Tsiky", // goutte
] as const;

export type RandomSource = () => number;

function pick<T>(items: readonly T[], random: RandomSource): T {
  return items[Math.floor(random() * items.length)] as T;
}

/**
 * En français l'adjectif précède le nom (« Calme Sentier »),
 * en malagasy il le suit (« Kintana malemy »).
 */
export function buildPseudonym(language: Language, random: RandomSource = Math.random): string {
  if (language === "mg") {
    return `${pick(NOUNS_MG, random)} ${pick(ADJECTIVES_MG, random)}`;
  }
  return `${pick(ADJECTIVES_FR, random)} ${pick(NOUNS_FR, random)}`;
}

/** Graine déterministe : l'avatar est régénéré côté client à partir de cette valeur. */
export function buildAvatarSeed(random: RandomSource = Math.random): string {
  return randomBytes(6).toString("hex");
}

/** Liste combinée, utilisée par la doc et les tests pour vérifier la neutralité du lexique. */
export const PSEUDONYM_LEXICON: Record<Language, { adjectives: readonly string[]; nouns: readonly string[] }> =
  {
    fr: { adjectives: ADJECTIVES_FR, nouns: NOUNS_FR },
    mg: { adjectives: ADJECTIVES_MG, nouns: NOUNS_MG },
  };
