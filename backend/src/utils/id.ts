import { randomUUID } from "node:crypto";

/** Identifiant technique opaque. Aucun lien avec une identité réelle. */
export function newId(): string {
  return randomUUID();
}

/** Identifiant lisible pour les données de démonstration (seed). */
export function seededId(prefix: string, value: string | number): string {
  return `${prefix}-${String(value).padStart(3, "0")}`;
}
