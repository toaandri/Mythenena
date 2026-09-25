/**
 * Bibliothèque de ressources, psycho-éducation et exercices (étape 8).
 * Aucun contenu n'est généré par IA : il s'agit uniquement de données éditoriales.
 */

import type { ResourceRow } from "../db/schema";
import type { EmergencyResourcesDto, ResourceDto, ResourceSummaryDto } from "../types/api";
import { DISCLAIMER_FR } from "../types/api";
import { EMERGENCY_RESOURCES } from "../../../shared/constants/urgency";

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toResourceSummaryDto(row: ResourceRow): ResourceSummaryDto {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as ResourceSummaryDto["type"],
    title: row.title,
    titleMg: row.titleMg,
    summary: row.summary,
    summaryMg: row.summaryMg,
    tags: row.tags,
    readingMinutes: row.readingMinutes,
    isOfflineAvailable: row.isOfflineAvailable,
    publishedAt: toIso(row.publishedAt),
  };
}

export function toResourceDto(row: ResourceRow): ResourceDto {
  return {
    ...toResourceSummaryDto(row),
    body: row.body,
    bodyMg: row.bodyMg,
    author: row.author,
  };
}

export function getEmergencyResources(): EmergencyResourcesDto {
  return {
    resources: EMERGENCY_RESOURCES,
    disclaimer: DISCLAIMER_FR,
    limitations:
      "Cette application n'est pas un service de secours. La détection automatique de signaux de détresse " +
      "ne garantit pas l'absence de risque et ne constitue pas une surveillance humaine permanente. " +
      "En cas de danger immédiat, contacte directement les numéros ci-dessous ou les services d'urgence.",
  };
}
