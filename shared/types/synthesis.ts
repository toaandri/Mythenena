// Types partagés — Synthèse utilisateur

import type { SurveyDomain, SurveyAnswer } from "./survey";

export interface DomainObservation {
  domain: SurveyDomain;
  labelFr: string;
  labelMg: string;
  observations: string[]; // phrases issues des réponses
  isUncertain: boolean; // vrai si basé sur peu de données
}

export interface Synthesis {
  sessionId: string;
  domainsExplored: DomainObservation[];
  domainsUnknown: SurveyDomain[]; // non répondus
  summary: string; // texte pédagogique, sans diagnostic
  summaryMg?: string;
  suggestedActions: SuggestedAction[];
  generatedAt: string;
  isExploratory: true; // toujours true — pas un outil clinique validé
}

export interface SuggestedAction {
  type: "resources" | "professional" | "community" | "exercise";
  labelFr: string;
  labelMg?: string;
  url?: string;
}

export interface SynthesisCorrection {
  sessionId: string;
  domainId: SurveyDomain;
  userNote: string; // correction libre de l'utilisateur
  correctedAt: string;
}
