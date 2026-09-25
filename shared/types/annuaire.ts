// Types partagés — Annuaire des professionnels

export interface Professional {
  id: string;
  name: string;
  title: string; // ex: "Psychologue clinicien"
  city: string;
  region: string;
  languages: ("fr" | "mg" | "en")[];
  specialties: string[];
  modalities: ("in-person" | "online")[];
  phone?: string;
  email?: string;
  address?: string;
  lat?: number;
  lng?: number;
  fee?: string; // ex: "20 000 Ar / séance" — seulement si communiqué
  schedule?: string;
  lastVerified: string; // date de dernière vérification
  isFictional: boolean; // true pour les fiches de démo
  acceptsNewPatients: boolean;
}

export interface AnnuaireSearchParams {
  city?: string;
  language?: "fr" | "mg" | "en";
  modality?: "in-person" | "online";
  specialty?: string;
}

export interface Association {
  id: string;
  name: string;
  description: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  isFictional: boolean;
}
