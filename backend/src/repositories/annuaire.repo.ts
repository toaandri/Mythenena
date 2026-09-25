import { and, asc, count, eq, sql } from "drizzle-orm";
import type { SQLWrapper } from "drizzle-orm";
import { associations, contactRequests, professionals } from "../db/schema";
import type { AssociationRow, ContactRequestRow, ProfessionalRow } from "../db/schema";
import type { DB } from "../db/types";

export interface ProfessionalListParams {
  city?: string;
  language?: string;
  modality?: string;
  specialty?: string;
  acceptsNewPatients?: boolean;
  includeFictional?: boolean;
  limit: number;
  offset: number;
}

export interface NewContactRequest {
  id: string;
  professionalId: string;
  sessionId: string;
  message: string | null;
}

export interface AnnuaireRepo {
  listProfessionals(
    params: ProfessionalListParams
  ): Promise<{ items: ProfessionalRow[]; total: number }>;
  findProfessional(id: string): Promise<ProfessionalRow | undefined>;
  /** Valeurs distinctes proposées comme filtres dans l'interface. */
  listFilterValues(): Promise<{
    cities: string[];
    regions: string[];
    languages: string[];
    specialties: string[];
    modalities: string[];
  }>;

  listAssociations(city?: string): Promise<AssociationRow[]>;
  findAssociation(id: string): Promise<AssociationRow | undefined>;

  createContactRequest(data: NewContactRequest): Promise<ContactRequestRow>;
}

export function createAnnuaireRepo(db: DB): AnnuaireRepo {
  return {
    async listProfessionals(params) {
      const conditions = [eq(professionals.isActive, true)];

      if (!params.includeFictional) {
        // Par défaut on masque les fiches de démonstration de la recherche « réelle ».
        conditions.push(eq(professionals.isFictional, false));
      }
      if (params.city) {
        conditions.push(sql`lower(${professionals.city}) = lower(${params.city})`);
      }
      if (params.acceptsNewPatients !== undefined) {
        conditions.push(eq(professionals.acceptsNewPatients, params.acceptsNewPatients));
      }
      if (params.language) {
        conditions.push(sql`${professionals.languages} @> ARRAY[${params.language}]::text[]`);
      }
      if (params.modality) {
        conditions.push(sql`${professionals.modalities} @> ARRAY[${params.modality}]::text[]`);
      }
      if (params.specialty) {
        conditions.push(sql`${professionals.specialties} @> ARRAY[${params.specialty}]::text[]`);
      }

      const where = and(...conditions);

      const items = await db
        .select()
        .from(professionals)
        .where(where)
        .orderBy(asc(professionals.name))
        .limit(params.limit)
        .offset(params.offset);

      const [{ value: total } = { value: 0 }] = await db
        .select({ value: count() })
        .from(professionals)
        .where(where);

      return { items, total: Number(total ?? 0) };
    },

    async findProfessional(id) {
      const [row] = await db
        .select()
        .from(professionals)
        .where(and(eq(professionals.id, id), eq(professionals.isActive, true)))
        .limit(1);
      return row;
    },

    async listFilterValues() {
      const [cities, regions] = await Promise.all([
        db
          .selectDistinct({ value: professionals.city })
          .from(professionals)
          .where(eq(professionals.isActive, true))
          .orderBy(asc(professionals.city)),
        db
          .selectDistinct({ value: professionals.region })
          .from(professionals)
          .where(eq(professionals.isActive, true))
          .orderBy(asc(professionals.region)),
      ]);

      // `unnest` transforme les colonnes text[] en lignes, pour pouvoir dédupliquer.
      const flatten = async (column: SQLWrapper) => {
        const rows = await db
          .selectDistinct({ value: sql<string>`unnest(${column})` })
          .from(professionals)
          .where(eq(professionals.isActive, true));
        return rows.map((row) => row.value).sort();
      };

      const [languages, specialties, modalities] = await Promise.all([
        flatten(professionals.languages),
        flatten(professionals.specialties),
        flatten(professionals.modalities),
      ]);

      return {
        cities: cities.map((row) => row.value),
        regions: regions.map((row) => row.value),
        languages,
        specialties,
        modalities,
      };
    },

    async listAssociations(city) {
      const conditions = [eq(associations.isActive, true)];
      if (city) conditions.push(sql`lower(${associations.city}) = lower(${city})`);
      return db
        .select()
        .from(associations)
        .where(and(...conditions))
        .orderBy(asc(associations.name));
    },

    async findAssociation(id) {
      const [row] = await db
        .select()
        .from(associations)
        .where(and(eq(associations.id, id), eq(associations.isActive, true)))
        .limit(1);
      return row;
    },

    async createContactRequest(data) {
      const [row] = await db.insert(contactRequests).values(data).returning();
      return row as ContactRequestRow;
    },
  };
}
