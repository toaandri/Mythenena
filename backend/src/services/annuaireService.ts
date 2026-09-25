/**
 * Annuaire des professionnels et associations (étape 6).
 *
 * Garde-fous :
 *  - les fiches de démonstration (`isFictional`) sont signalées et leurs
 *    actions de contact sont désactivées côté serveur ;
 *  - les tarifs et horaires ne sont publiés que s'ils ont été communiqués ;
 *  - les suggestions reposent sur une correspondance déterministe entre les
 *    domaines déclarés par l'utilisateur et les spécialités annoncées.
 *    Il ne s'agit PAS d'un diagnostic automatique.
 */

import type { AssociationRow, ProfessionalRow } from "../db/schema";
import type { AnnuaireFiltersDto, AssociationDto, ProfessionalDto } from "../types/api";
import type { SurveyDomain } from "../../../shared/types/survey";
import { ApiError } from "../utils/errors";
import { foldForSearch } from "../utils/text";
import { newId } from "../utils/id";
import type { AnnuaireRepo } from "../repositories";

export const CONTACT_MESSAGE_MAX_LENGTH = 1000;

/**
 * Domaines du questionnaire → libellés de spécialités recherchés dans
 * l'annuaire. Table statique : aucun appel à un modèle de langage.
 */
export const DOMAIN_SPECIALTY_HINTS: Record<SurveyDomain, string[]> = {
  mood: ["humeur", "depression", "deprimer", "tristesse"],
  sleep: ["sommeil", "insomnie"],
  stress: ["stress", "gestion du stress", "relaxation"],
  relationships: ["relation", "toxique", "emprise", "abus emotionnel", "couple"],
  motivation: ["motivation", "burn out", "epuisement"],
  anxiety: ["anxiete", "phobie", "angoisse"],
  energy: ["burn out", "epuisement", "fatigue"],
  selfEsteem: ["estime", "confiance", "image de soi"],
  isolation: ["isolement", "solitude", "deuil", "lien"],
};

function matchesHint(specialty: string, hint: string): boolean {
  return foldForSearch(specialty).includes(foldForSearch(hint));
}

/**
 * Une spécialité correspond si elle contient l'un des indices du domaine.
 * Correspondance par sous-chaîne après normalisation des accents et de la casse.
 */
export function matchesDomains(specialties: string[], domains: SurveyDomain[]): boolean {
  if (domains.length === 0) return false;
  return domains.some((domain) => {
    const hints = DOMAIN_SPECIALTY_HINTS[domain] ?? [];
    return specialties.some((specialty) => hints.some((hint) => matchesHint(specialty, hint)));
  });
}

export function toProfessionalDto(row: ProfessionalRow): ProfessionalDto {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    city: row.city,
    region: row.region,
    languages: row.languages,
    specialties: row.specialties,
    modalities: row.modalities,
    phone: row.phone,
    email: row.email,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    bio: row.bio,
    // Tarifs et horaires : uniquement s'ils ont été communiqués.
    fee: row.fee,
    schedule: row.schedule,
    lastVerified: row.lastVerified,
    isFictional: row.isFictional,
    acceptsNewPatients: row.acceptsNewPatients,
    contactEnabled: !row.isFictional,
  };
}

export function toAssociationDto(row: AssociationRow): AssociationDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    descriptionMg: row.descriptionMg,
    city: row.city,
    region: row.region,
    phone: row.phone,
    email: row.email,
    website: row.website,
    lastVerified: row.lastVerified,
    isFictional: row.isFictional,
  };
}

export function toFiltersDto(values: {
  cities: string[];
  regions: string[];
  languages: string[];
  specialties: string[];
  modalities: string[];
}): AnnuaireFiltersDto {
  return values;
}

/**
 * Contact avec un professionnel.
 *
 * ⚠️  La demande ne contient QUE le message libre de l'utilisateur : aucune
 *     réponse de questionnaire, aucun message de conversation, aucune synthèse.
 *     Le transfert de données de santé exigerait un accord explicite, non
 *     implémenté ici par conception.
 */
export async function requestContact(
  repos: { annuaire: AnnuaireRepo },
  params: { professionalId: string; sessionId: string; message?: string | null }
): Promise<{ id: string; status: string; createdAt: string }> {
  const professional = await repos.annuaire.findProfessional(params.professionalId);
  if (!professional) {
    throw ApiError.notFound("Fiche introuvable", "professional_not_found");
  }

  if (professional.isFictional) {
    throw ApiError.forbidden(
      "Cette fiche fait partie des données de démonstration : le contact est désactivé.",
      "fictional_profile"
    );
  }

  if (!professional.acceptsNewPatients) {
    throw ApiError.conflict(
      "Ce professionnel n'accepte pas de nouvelles demandes pour le moment.",
      "not_accepting_new_patients"
    );
  }

  const message = params.message?.trim().slice(0, CONTACT_MESSAGE_MAX_LENGTH) || null;

  const created = await repos.annuaire.createContactRequest({
    id: newId(),
    professionalId: params.professionalId,
    sessionId: params.sessionId,
    message,
  });

  return {
    id: created.id,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
  };
}
