# 🌿 Mythenena

**Plateforme de pré-dépistage, écoute IA et entraide en santé mentale à Madagascar**

> Prototype hackathon — outil exploratoire d'accompagnement, **pas un substitut médical**.

---

## Structure du projet

```
Mythenena/
├── shared/       # Types TypeScript partagés (mobile + web + backend)
├── mobile/       # Application mobile — Expo (React Native)
├── web/          # Site web — Next.js 14
└── backend/      # API REST — Node.js + Hono
```

---

## Prérequis

- Node.js 20+
- npm ou yarn
- Compte [Supabase](https://supabase.com) (gratuit)
- Clé API [OpenAI](https://platform.openai.com/api-keys)
- [Expo Go](https://expo.dev/go) installé sur le téléphone (pour le mobile)

---

## Installation

### 1. Backend

```bash
cd backend
cp .env.example .env
# Remplir DATABASE_URL, OPENAI_API_KEY, JWT_SECRET dans .env
npm install
npm run db:push   # Créer les tables dans Supabase
npm run db:seed   # Données fictives pour l'annuaire
npm run dev       # Démarrer sur http://localhost:4000
```

### 2. Web

```bash
cd web
npm install
# Créer .env.local avec NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev       # Démarrer sur http://localhost:3000
```

### 3. Mobile

```bash
cd mobile
npm install
# Créer .env avec EXPO_PUBLIC_API_URL=http://[TON_IP_LOCAL]:4000
npx expo start    # Scanner le QR code avec Expo Go
```

---

## Modules — parcours utilisateur

| Étape | Module | Status |
|-------|--------|--------|
| 1 | Onboarding + choix pseudonyme | ⬜ TODO |
| 2 | Mini-sondage 5 questions | ⬜ TODO |
| 3 | Questionnaire adaptatif IA | ⬜ TODO |
| 4 | Chat IA — écoute active | ⬜ TODO |
| 5 | Sécurité & détection de crise | ⬜ TODO |
| 6 | Synthèse pédagogique | ⬜ TODO |
| 7 | Annuaire professionnels | ⬜ TODO |
| 8 | Forum communautaire | ⬜ TODO |
| 9 | Bibliothèque ressources | ⬜ TODO |

---

## Stack technique

| Couche | Techno |
|--------|--------|
| Mobile | Expo (React Native) + Expo Router |
| Web | Next.js 14 + Tailwind CSS |
| Backend | Node.js + Hono |
| Base de données | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| IA | OpenAI GPT-4o-mini |
| State (mobile/web) | Zustand + TanStack Query |
| i18n | FR / Malagasy (i18next / next-intl) |

---

## Règles éthiques — à respecter impérativement

- ❌ Pas de diagnostic médical, pas de score clinique improvisé
- ❌ Pas de probabilités de maladie dans la synthèse
- ✅ Disclaimer visible en permanence : outil exploratoire d'accompagnement
- ✅ Bouton "Passer" sur chaque question — réponse omise ≠ symptôme
- ✅ Sécurité : détection de crise → orientation vers ressources humaines vérifiées
- ✅ Anonymat : pseudonyme, pas d'identité réelle obligatoire
- ✅ Contrôle utilisateur : historique conservé ou supprimé selon son choix
- ✅ Fiches annuaire fictives clairement identifiées et actions de contact désactivées

---

## Équipe

<!-- TODO: ajouter les membres de l'équipe -->
