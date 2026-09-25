> **Mis à jour** — Toutes les sous-tâches ci-dessous ont été implémentées lors de la session précédente. Voir [`mythenena-final-plan.md`](mythenena-final-plan.md) pour les tâches restantes (ST1–ST5).

# Mythenena — Plan de continuation : Backend + Backend IA + Supabase

## Vue d'ensemble

**Objectif :** Faire fonctionner complètement le backend existant (Hono + Drizzle) et y intégrer le module IA (Gemini pour le chat adaptatif et la synthèse, Groq pour la transcription vocale), le tout connecté à une base Supabase réelle et opérationnelle.

**État de départ :**
- Backend non-IA : code complet, 108 tests verts, mais **aucune base de données déployée**
- Module IA : 3 fonctions stub, 7 endpoints retournant 501
- `.env` inexistant → le serveur ne peut pas démarrer contre Supabase
- `aiService.ts` utilise OpenAI ; le plan décide de basculer sur **Gemini** (Free Tier, hackathon)
- Supabase : projet créé mais schéma jamais appliqué, tables vides

**Périmètre hors-plan :**
- Frontend web (Next.js) et mobile (Expo) — pas touchés ici
- Shared/ — lecture seule, aucune modification
- Migrations versionnées (BLOQUANT 4) — reportées après le hackathon
- CI (SECU 6) — reportée après le hackathon

---

## Sous-tâches

---

### Sous-tâche 1 — Créer le fichier `.env` et connecter Supabase

**Statut :** `[x] done`

**Intent**
Sans `.env`, le serveur refuse de démarrer et `drizzle-kit push` échoue à l'authentification. C'est le débloquant absolu de tout le reste.

**Expected Outcomes**
- `backend/.env` existe avec `DATABASE_URL`, `JWT_SECRET`, `MODERATOR_TOKENS`, `GEMINI_API_KEY`, `GROQ_API_KEY`
- `npm run db:push` (dans `backend/`) s'exécute sans erreur et crée toutes les tables
- `npm run db:seed` peuple les catégories de forum, les questions du mini-sondage, les ressources et les fiches fictives
- `GET /health` répond `200 { status: "ok" }` une fois le serveur lancé

**Todo List**
1. Récupérer la Connection String sur Supabase > Settings > Database > Connection string > URI (transaction pooler ou direct)
2. Générer `JWT_SECRET` : `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
3. Générer `MODERATOR_TOKENS` : `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
4. Récupérer `GEMINI_API_KEY` sur Google AI Studio (https://aistudio.google.com/)
5. Récupérer `GROQ_API_KEY` sur https://console.groq.com/keys
6. Créer `backend/.env` avec toutes ces valeurs (voir template ci-dessous)
7. Exécuter `npm run db:push` depuis `backend/`
8. Exécuter `npm run db:seed` depuis `backend/`
9. Lancer `npm run dev` et tester `GET /health`

**Template `.env` attendu :**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=<généré>
JWT_TTL_DAYS=30
NODE_ENV=development
PORT=4000
WEB_URL=http://localhost:3000
MODERATOR_TOKENS=<généré>
GEMINI_API_KEY=<clé Google AI Studio>
GEMINI_TEXT_MODEL=gemini-1.5-flash
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts
GEMINI_TTS_LANGUAGE=mg-MG
GROQ_API_KEY=<clé Groq>
GROQ_STT_MODEL=whisper-large-v3-turbo
```

**Relevant Context**
- [`backend/src/config/env.ts`](backend/src/config/env.ts) — schéma Zod de validation ; il faut y ajouter les nouvelles variables Gemini et Groq
- [`backend/.env.example`](backend/.env.example) — template existant (ne contient pas encore Gemini/Groq)
- [`backend/src/db/index.ts`](backend/src/db/index.ts) — lit `DATABASE_URL` via `loadEnv()`
- [`backend/src/db/seed.ts`](backend/src/db/seed.ts) — script de seed

---

### Sous-tâche 2 — Étendre `env.ts` pour les nouvelles variables IA

**Statut :** `[x] done`

**Intent**
Le schéma Zod actuel dans [`backend/src/config/env.ts`](backend/src/config/env.ts) ne connaît pas `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL`, `GROQ_API_KEY`, etc. Sans cette extension, le service IA ne peut pas lire ses clés de manière fiable et typée.

**Expected Outcomes**
- `loadEnv()` parse et valide toutes les nouvelles variables
- Les variables Gemini et Groq sont optionnelles au démarrage (le backend non-IA ne doit pas tomber si elles manquent), mais leur absence est détectée au moment où le service IA les appelle
- `.env.example` est mis à jour pour inclure toutes les nouvelles variables

**Todo List**
1. Dans [`backend/src/config/env.ts`](backend/src/config/env.ts), ajouter au schéma Zod :
   - `GEMINI_API_KEY` (string, optional)
   - `GEMINI_TEXT_MODEL` (string, default `"gemini-1.5-flash"`)
   - `GEMINI_TTS_MODEL` (string, default `"gemini-2.5-flash-preview-tts"`)
   - `GEMINI_TTS_LANGUAGE` (string, default `"mg-MG"`)
   - `GROQ_API_KEY` (string, optional)
   - `GROQ_STT_MODEL` (string, default `"whisper-large-v3-turbo"`)
2. Dans [`backend/src/config/config.ts`](backend/src/config/config.ts), ajouter les champs correspondants à `AppConfig`
3. Dans `buildConfig()`, propager les nouvelles valeurs
4. Mettre à jour [`backend/.env.example`](backend/.env.example) avec les nouveaux blocs

**Relevant Context**
- [`backend/src/config/env.ts`](backend/src/config/env.ts) — source à modifier
- [`backend/src/config/config.ts`](backend/src/config/config.ts) — interface `AppConfig`
- [`api.txt`](api.txt) lignes 92–93 et 144–147 — noms exacts des variables

---

### Sous-tâche 3 — Corriger le bug de fuite de pool (BUG 2) et le `/health` mensonger (BUG 3)

**Statut :** `[x] done`

**Intent**
Ces deux bugs sont rapides à corriger et impactent directement la fiabilité de la démo. Un pool non fermé fait crasher le process proprement, et un `/health` qui ment rend tout monitoring impossible.

**Expected Outcomes**
- `closeDb()` appelle réellement `client.end()` et nettoie la connexion
- `GET /health` retourne `503` si la base ne répond pas dans 2 secondes (via `SELECT 1`)
- `GET /health` retourne `200` quand la base est disponible

**Todo List**
1. Dans [`backend/src/db/index.ts`](backend/src/db/index.ts) :
   - Stocker `client` dans une variable module séparée (pas seulement `cached`)
   - Modifier `closeDb()` pour appeler `await client.end()` si `client` existe
2. Dans [`backend/src/index.ts`](backend/src/index.ts) :
   - Câbler `closeDb()` sur `SIGINT` et `SIGTERM`
3. Dans [`backend/src/app.ts`](backend/src/app.ts) :
   - Modifier le handler `GET /health` pour faire un `SELECT 1` via `getDb()`
   - Entourer d'un `Promise.race` avec un timeout de 2 secondes
   - Retourner `503` si la base ne répond pas ou si une exception est levée

**Relevant Context**
- [`backend/src/db/index.ts`](backend/src/db/index.ts) — fuite de pool documentée (BUG 2 de balt.txt)
- [`backend/src/app.ts`](backend/src/app.ts) lignes 42–60 — handler `/health` actuel
- [`backend/src/index.ts`](backend/src/index.ts) — point d'entrée du serveur

---

### Sous-tâche 4 — Implémenter le service IA : chat Gemini + questionnaire adaptatif

**Statut :** `[x] done`

**Intent**
Remplacer les trois stubs dans [`backend/src/services/aiService.ts`](backend/src/services/aiService.ts) par des implémentations réelles utilisant Gemini (Free Tier). C'est le cœur du module IA.

Le service doit :
- utiliser Gemini pour générer les questions adaptatives (format JSON défini dans `api.txt`)
- conduire la conversation de soutien (TCC, empathie, bilingue FR/MG)
- générer la synthèse pédagogique (sans diagnostic, sans score clinique)

**Expected Outcomes**
- `generateNextQuestion()` appelle l'API Gemini, valide le JSON retourné (domain, reason, question, choices), et retourne `null` si la limite de questions est atteinte
- `chat()` appelle l'API Gemini avec le contexte du questionnaire injecté dans le system prompt
- `generateSynthesis()` appelle l'API Gemini et produit une synthèse sans diagnostic ni probabilité de maladie
- Si la clé Gemini est absente, une `ApiError` claire est levée (pas un crash silencieux)

**Todo List**
1. Installer le SDK Gemini dans `backend/` : `npm install @google/generative-ai`
2. Réécrire [`backend/src/services/aiService.ts`](backend/src/services/aiService.ts) :
   - Remplacer l'import OpenAI par `@google/generative-ai`
   - Lire `GEMINI_API_KEY` et `GEMINI_TEXT_MODEL` depuis `process.env`
   - `generateNextQuestion()` : construire un prompt avec l'historique → appel Gemini → parser le JSON → valider les champs → retourner ou `null`
   - `chat()` : system prompt (écoute active TCC, pas de diagnostic, bilingue) → injecter le contexte du sondage → appel Gemini → retourner la réponse
   - `generateSynthesis()` : prompt de synthèse exploratoire → appel Gemini → valider l'absence de score clinique → retourner
3. Ajouter un helper `requireGeminiKey()` qui lève `ApiError.serviceUnavailable()` si la clé est absente
4. Vérifier le format JSON attendu pour `generateNextQuestion()` (voir `api.txt` lignes 96–108)

**Relevant Context**
- [`backend/src/services/aiService.ts`](backend/src/services/aiService.ts) — fichier à réécrire
- [`api.txt`](api.txt) lignes 58–108 — détails Gemini, format JSON attendu
- [`maharavo.txt`](maharavo.txt) étapes 2–3–4 — comportement attendu du questionnaire adaptatif et du chat
- `shared/constants/urgency.ts` — `SAFETY_KEYWORDS_FR`, `SAFETY_KEYWORDS_MG` — à utiliser dans le contexte de sécurité

---

### Sous-tâche 5 — Implémenter les routes IA (chat, synthèse, questionnaire adaptatif)

**Statut :** `[x] done`

**Intent**
Brancher les routes qui retournent 501 sur les implémentations réelles du service IA. Chaque route doit lire/écrire dans la base Supabase via les repositories Drizzle existants et appeler `aiService`.

**Expected Outcomes**
- `POST /api/chat/message` accepte un message, appelle `aiService.chat()`, persiste le message en base, retourne la réponse
- `GET /api/chat/:sessionId` retourne l'historique des messages depuis Supabase
- `POST /api/synthese/generate` appelle `aiService.generateSynthesis()` avec les réponses du sondage, persiste la synthèse
- `GET /api/synthese/:sessionId` retourne la synthèse persistée
- `POST /api/synthese/:sessionId/correct` persiste une correction utilisateur
- `POST /api/survey/adaptive/next` appelle `aiService.generateNextQuestion()`, retourne la prochaine question
- `POST /api/survey/adaptive/answer` persiste la réponse adaptative

**Todo List**
1. Réécrire [`backend/src/routes/chat.ts`](backend/src/routes/chat.ts) :
   - `POST /message` : valider le body (sessionId, message, language) → appeler `safetyService.checkText()` → si critical, retourner les ressources d'urgence → sinon appeler `aiService.chat()` → persister via `chatMessages` → retourner réponse + éventuelle alerte sécurité
   - `GET /:sessionId` : retourner les messages de la session depuis la base
2. Réécrire [`backend/src/routes/synthese.ts`](backend/src/routes/synthese.ts) :
   - `POST /generate` : récupérer les réponses du sondage → appeler `aiService.generateSynthesis()` → persister en `syntheses` → retourner
   - `GET /:sessionId` : retourner la synthèse depuis la base
   - `POST /:sessionId/correct` : persister la correction dans `synthesisCorrections`
3. Dans [`backend/src/routes/survey.ts`](backend/src/routes/survey.ts) :
   - `POST /adaptive/next` : appeler `aiService.generateNextQuestion()` avec l'historique → retourner la question ou `{ done: true }` si null
   - `POST /adaptive/answer` : valider et persister via le repo survey existant
4. Vérifier que le middleware auth est bien appliqué sur toutes ces routes (déjà câblé dans `app.ts`)
5. Contrôler les messages entrants ET les réponses générées avec `safetyService.checkText()` avant de les persister ou retourner

**Relevant Context**
- [`backend/src/routes/chat.ts`](backend/src/routes/chat.ts) — stubs actuels
- [`backend/src/routes/synthese.ts`](backend/src/routes/synthese.ts) — stubs actuels
- [`backend/src/routes/survey.ts`](backend/src/routes/survey.ts) lignes 109–115 — stubs adaptatif
- [`backend/src/services/safetyService.ts`](backend/src/services/safetyService.ts) — sécurité des messages
- [`backend/src/db/schema.ts`](backend/src/db/schema.ts) — tables `chatMessages`, `syntheses`, `synthesisCorrections`
- [`backend/src/repositories/`](backend/src/repositories/) — repos existants à réutiliser

---

### Sous-tâche 6 — Implémenter la transcription vocale (Groq Whisper)

**Statut :** `[x] done`

**Intent**
Ajouter un endpoint de transcription pour que l'application Expo puisse envoyer un fichier audio et recevoir le texte transcrit. C'est un endpoint indépendant, sans impact sur le reste.

**Expected Outcomes**
- `POST /api/transcription` accepte un fichier audio multipart (WAV, WEBM, M4A) ≤ 25 Mo
- Appelle l'API Groq avec le modèle `whisper-large-v3-turbo`
- Retourne `{ text: "...", language_detected: "fr"|"mg" }`
- Si la clé Groq est absente, retourne 503 avec un message clair

**Todo List**
1. Installer le SDK Groq : `npm install groq-sdk`
2. Créer [`backend/src/services/transcriptionService.ts`](backend/src/services/transcriptionService.ts) :
   - Lire `GROQ_API_KEY` et `GROQ_STT_MODEL` depuis `process.env`
   - Appeler `groq.audio.transcriptions.create()` avec le fichier reçu
   - Retourner le texte et la langue détectée
3. Créer [`backend/src/routes/transcription.ts`](backend/src/routes/transcription.ts) :
   - `POST /` : parser le multipart → appeler `transcriptionService` → retourner le résultat
   - Valider la taille et le type du fichier avant l'appel Groq
4. Enregistrer la route dans [`backend/src/app.ts`](backend/src/app.ts) : `app.route("/api/transcription", ...)`
5. Ajouter `GROQ_API_KEY` et `GROQ_STT_MODEL` au `.env.example` (déjà dans Sous-tâche 2, vérifier la cohérence)

**Relevant Context**
- [`api.txt`](api.txt) lignes 113–156 — détails Groq, limits (25 Mo), modèle, flux
- [`backend/src/app.ts`](backend/src/app.ts) — enregistrement des routes

---

### Sous-tâche 7 — Vérification finale : tests, `/health` réel et démarrage complet

**Statut :** `[x] done`

**Intent**
Valider que tout s'assemble : le backend non-IA répond correctement sur Supabase, les routes IA fonctionnent en mode connecté, et les 108 tests existants passent toujours (ils utilisent des fakes, ils ne doivent pas être cassés).

**Expected Outcomes**
- `npm run typecheck` → 0 erreur TypeScript
- `npm run test` → 108 / 108 verts (tests existants non cassés)
- `npm run dev` → serveur sur port 4000
- `GET /health` → `200` avec `status: "ok"` et `db: "ok"` (ou `503` si base injoignable)
- `POST /api/session/start` → crée une session et retourne un JWT
- `GET /api/survey/mini` → retourne les 5 questions (données du seed)
- `POST /api/chat/message` → retourne une réponse Gemini (ou 503 si clé absente)
- `POST /api/transcription` → retourne texte transcrit (ou 503 si clé Groq absente)

**Todo List**
1. Lancer `npm run typecheck` dans `backend/` et corriger les erreurs TypeScript introduites
2. Lancer `npm run test` et s'assurer que tous les tests existants passent encore
3. Vérifier manuellement les endpoints critiques avec curl ou un client HTTP
4. Vérifier que `/health` retourne `db: "ok"` quand Supabase est joignable
5. Tester un parcours complet : session → mini-sondage → chat → synthèse
6. Mettre à jour `backend/.env.example` pour refléter toutes les variables finales

**Relevant Context**
- [`backend/src/__tests__/`](backend/src/__tests__/) — suite de tests existante
- [`backend/src/app.ts`](backend/src/app.ts) — handler `/health`
- [`balt.txt`](balt.txt) section 7 — ordre de traitement conseillé

---

## Ordre d'exécution recommandé

```
Sous-tâche 1 (env + DB)
  → Sous-tâche 2 (env.ts étendu)
    → Sous-tâche 3 (bugs pool + health)
      → Sous-tâche 4 (service IA Gemini)
        → Sous-tâche 5 (routes IA)
          → Sous-tâche 6 (transcription Groq)
            → Sous-tâche 7 (validation finale)
```

Les sous-tâches 1 et 2 sont des prérequis stricts pour toutes les suivantes.
Les sous-tâches 3 et 4 peuvent être travaillées en parallèle une fois 1 et 2 terminées.
La sous-tâche 6 est indépendante de 4 et 5, mais dépend de 2.

---

## Décisions à prendre avant l'implémentation

- **Clé Gemini disponible ?** — La sous-tâche 4 est bloquée sans elle.
- **Clé Groq disponible ?** — La sous-tâche 6 est bloquée sans elle.
- **Connection string Supabase disponible ?** — La sous-tâche 1 est bloquée sans elle.
- **BUG 1 (forum replies orphelines) à traiter ?** — Non planifié ici, peut être ajouté.
- **SECU 1 (rate limiting) à traiter ?** — Non planifié ici, peut être ajouté.
