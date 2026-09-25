/** Normalisation de texte utilisateur : coupe, réduit les espaces, borne la taille. */
export function normalizeText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/** Préserve les retours à la ligne (contenu du forum, corps d'article). */
export function normalizeMultiline(value: string, maxLength: number): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Comparaison insensible à la casse et aux accents, pour les filtres de l'annuaire. */
export function foldForSearch(value: string): string {
  return value.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase().trim();
}
