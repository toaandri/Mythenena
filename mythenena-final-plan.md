# Mythenena — Plan final : ce qui reste à faire

## Vue d'ensemble

**État au moment de ce plan :**
- Tout le code backend est écrit et complet : schéma DB, repositories, services (Gemini, Groq, interviewEngine, activityEngine), routes, seed, env.ts, app.ts, index.ts.
- `backend/.env` existe avec les vraies clés (Supabase, Gemini, Groq).
- Les 108 tests existants passent.
- Ce qui manque : (1) la DB Supabase n'a peut-être pas encore reçu le schéma ni les données de seed ; (2) `safetyService.ts` est un demi-stub ; (3) les `fakeRepos` pour interview/profile/activities sont des no-op qui ne testent rien ; (4) les deux anciens plans de continuation ont des statuts obsolètes.

**Périmètre :**
- Backend uniquement — aucun frontend.
- Ne pas casser les 108 tests existants.
- Ne pas réécrire ce qui fonctionne.

**Hors-plan :**
- Frontend web / mobile
- Migrations versionnées (drizzle generate + migrate)
- CI/CD
- Rate limiting

---

## Sous-tâches

---

### Sous-tâche 1 — Appliquer le schéma et peupler la base Supabase

**Statut :** `[x] done`

**Intent**
Si `db:push` et `db:seed` n'ont jamais été exécutés contre la vraie base Supabase, aucune table n'existe et le serveur plante à la première requête DB. Cette sous-tâche vérifie et exécute ces deux commandes.

**Expected Outcomes**
- Toutes les tables du schéma existent dans Supabase (vérifiable via Supabase Dashboard > Table Editor)
- `GET /health` retourne `{ status: "ok", db: "ok" }` une fois le serveur lancé
- `GET /api/ressources` retourne les 5 ressources
- `GET /api/survey/mini` retourne les 5 questions

**Todo List**
1. Depuis `backend/`, lancer `npm run db:push` — vérifier qu'il s'exécute sans erreur d'authentification
2. Depuis `backend/`, lancer `npm run db:seed` — vérifier la sortie : 7 catégories, 5 questions, 4 pros, 2 associations, 5 ressources, 15 activités
3. Lancer `npm run dev` depuis `backend/`
4. Tester `GET http://localhost:4000/health` — attendre `{ status: "ok", db: "ok" }`
5. Tester `GET http://localhost:4000/api/ressources` — attendre une liste non vide
6. Tester `GET http://localhost:4000/api/survey/mini` avec un JWT valide (créer une session d'abord)

**Relevant Context**
- `backend/src/db/index.ts` — connexion Supabase via DATABASE_URL
- `backend/drizzle.config.ts` — config drizzle-kit
- `backend/src/db/seed.ts` — données de démo (15 activités, 5 questions, etc.)
- `backend/.env` — doit contenir DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, GROQ_API_KEY

---

### Sous-tâche 2 — Compléter safetyService.ts

**Statut :** `[x] done`

**Intent**
`backend/src/services/safetyService.ts` contient deux TODO critiques :
1. `SAFETY_KEYWORDS_MG` est vide dans `shared/constants/urgency.ts` — une personne en détresse qui écrit en malagasy ne déclenche aucune alerte.
2. Le niveau retourné est toujours `"warning"` — il n'y a jamais de `"critical"`, donc le parcours d'urgence dans les routes (qui teste `safety.level === "critical"`) ne se déclenche jamais.

Cette sous-tâche corrige ces deux points sans modifier la signature de `checkText()`.

**Expected Outcomes**
- `SAFETY_KEYWORDS_MG` contient au moins 10 mots-clés en malagasy couvrant les idées suicidaires, l'automutilation et la détresse aiguë
- Quand un message contient un mot-clé (FR ou MG), `checkText()` retourne `level: "critical"` (pas `"warning"`)
- `POST /api/chat/message` avec un message contenant un mot-clé retourne les ressources d'urgence au lieu d'appeler Gemini
- `POST /api/interview/:id/respond` avec un message contenant un mot-clé retourne un event SSE `safety_alert` et stoppe le stream

**Todo List**
1. Ouvrir `shared/constants/urgency.ts` et ajouter dans `SAFETY_KEYWORDS_MG` au minimum :
   - `"hamono tena"` (se tuer), `"tsy te ho velona"` (ne plus vouloir vivre), `"maty"` (mourir — avec contexte), `"marary be"` (très douloureux), `"tsy mahazaka"` (ne plus supporter), `"mitsabo tena"` (se blesser), `"vonoy aho"` (tuez-moi), `"ho faty"` (vais mourir), `"faty tsara"` (mieux mort), `"tsy misy antony hiainana"` (pas de raison de vivre)
2. Dans `backend/src/services/safetyService.ts`, changer le niveau retourné quand un mot-clé est trouvé : passer de `"warning"` à `"critical"`
3. Vérifier que le message d'alerte est cohérent avec `level: "critical"` (le champ `alert.level` doit aussi être `"critical"`)
4. Tester manuellement : envoyer `POST /api/chat/message` avec `{ "message": "je veux mourir", "language": "fr" }` et vérifier que la réponse contient `safetyAlert` et pas de texte Gemini

**Relevant Context**
- `backend/src/services/safetyService.ts` lignes 24-38 — logique de détection actuelle
- `shared/constants/urgency.ts` — `SAFETY_KEYWORDS_FR`, `SAFETY_KEYWORDS_MG`, `EMERGENCY_RESOURCES`
- `backend/src/routes/chat.ts` lignes 46-55 — utilise `safety.level === "critical"`
- `backend/src/services/interviewEngine.ts` ligne 141 — utilise `safety.level === "critical"`

---

### Sous-tâche 3 — Enrichir fakeRepos pour les modules interview, profile et activities

**Statut :** `[x] done`

**Intent**
Les implémentations fake de `interview`, `profile` et `activities` dans `fakeRepos.ts` sont des no-op complets (retournent toujours `undefined` ou `[]`). Conséquence : les routes interview, profile et activities ne peuvent pas être testées dans la suite vitest existante. Cette sous-tâche ajoute des implémentations en mémoire fonctionnelles, sur le même modèle que les fakes `sessions`, `surveys`, `forum` déjà présents.

Elle n'ajoute pas de nouveaux fichiers de test — elle rend les fakes suffisamment riches pour que des tests puissent être écrits plus tard sans modifier les 108 tests existants.

**Expected Outcomes**
- `fakeRepos.interview` : `createSession`, `findSessionById`, `findActiveSessionByUser`, `updateSession`, `addTurn`, `listTurns`, `addEvidence`, `saveProfileDelta`, `listProfileDeltas` — tous fonctionnels en mémoire
- `fakeRepos.profile` : tous les CRUD en mémoire (addLifeEvent, listLifeEvents, upsertIdentityDomain, listIdentityDomains, upsertValue, listValues, addBehaviorPattern, listBehaviorPatterns, addHypothesis, updateHypothesis, listHypotheses, addContradiction, listContradictions, upsertLearningPreferences, getLearningPreferences)
- `fakeRepos.activities` : findBySlug, listAll, listActive, createSession, completeSession, abandonSession, listUserSessions — tous fonctionnels en mémoire
- `FakeData` étendu pour inclure les nouvelles collections
- Les 108 tests existants passent toujours (aucune modification des tests existants)

**Todo List**
1. Ouvrir `backend/src/__tests__/helpers/fakeRepos.ts`
2. Importer les nouveaux types Row depuis `../../db/schema` : `InterviewSessionRow`, `InterviewTurnRow`, `EvidenceItemRow`, `ProfileSnapshotRow`, `LifeEventRow`, `IdentityDomainRow`, `ValuesMapRow`, `BehaviorPatternRow`, `HypothesisRow`, `ContradictionRow`, `LearningPreferencesRow`, `ActivityLibraryRow`, `ActivitySessionRow`
3. Étendre `FakeData` avec les nouvelles collections : `interviewSessions`, `interviewTurns`, `evidenceItems`, `profileSnapshots`, `lifeEvents`, `identityDomains`, `valuesMap`, `behaviorPatterns`, `hypotheses`, `contradictions`, `learningPreferences`, `activityLibrary`, `activitySessions`
4. Initialiser ces collections à `[]` dans `createFakeData()`
5. Remplacer les no-op de `interview` par des implémentations en mémoire : insert/find/filter sur `data.interviewSessions`, `data.interviewTurns`, `data.evidenceItems`, `data.profileSnapshots`
6. Remplacer les no-op de `profile` par des implémentations en mémoire : insert/filter sur chaque collection, upsert via find+assign pour identityDomains (par userId+domain) et valuesMap (par userId+valueName) et learningPreferences (par userId)
7. Remplacer les no-op de `activities` par des implémentations en mémoire : filter sur `data.activityLibrary` et `data.activitySessions`
8. Lancer `npm run test` dans `backend/` — vérifier 108/108 verts

**Relevant Context**
- `backend/src/__tests__/helpers/fakeRepos.ts` lignes 528-568 — no-op actuels à remplacer
- `backend/src/repositories/interview.repo.ts` — interface `InterviewRepo` à implémenter
- `backend/src/repositories/profile.repo.ts` — interface `ProfileRepo` à implémenter
- `backend/src/repositories/activity.repo.ts` — interface `ActivityRepo` à implémenter
- Pattern existant : voir `fakeRepos.sessions` (lignes 145-171) et `fakeRepos.surveys` (lignes 173-214) pour le style à reproduire

---

### Sous-tâche 4 — Vérification finale : typecheck + tests + smoke test

**Statut :** `[x] done`

**Intent**
S'assurer que tout s'assemble : zéro erreur TypeScript, 108 tests verts, serveur opérationnel, parcours complet fonctionnel.

**Expected Outcomes**
- `npm run typecheck` → 0 erreur TypeScript
- `npm run test` → 108 / 108 verts
- `npm run dev` → serveur démarre sur port 4000 sans erreur
- Parcours complet smoke-test (curl ou client HTTP) :
  - `POST /api/session/start` → JWT
  - `GET /api/survey/mini` → 5 questions
  - `POST /api/survey/mini/answer` → réponse enregistrée
  - `POST /api/chat/message` → réponse Gemini
  - `POST /api/synthese/generate` → synthèse exploratoire
  - `POST /api/interview/start` → première question
  - `POST /api/interview/:id/respond` → stream SSE avec tokens
  - `GET /api/profile` → profil vide (pour une nouvelle session)
  - `POST /api/activities/recommend` → activité recommandée
  - `POST /api/transcription` avec fichier audio → texte transcrit (ou 503 si clé absente)

**Todo List**
1. Depuis `backend/`, lancer `npm run typecheck` et corriger toute erreur TypeScript
2. Lancer `npm run test` — vérifier 108/108 verts
3. Lancer `npm run dev`
4. Exécuter les smoke tests ci-dessus avec curl ou un client HTTP (Insomnia, Postman, etc.)
5. Pour le test SSE : utiliser `curl -N -X POST http://localhost:4000/api/interview/:id/respond -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"message":"Je commence tout mais je ne finis rien","language":"fr"}'`
6. Vérifier que `/health` retourne `db: "ok"` et liste les modules disponibles

**Relevant Context**
- `backend/src/app.ts` — toutes les routes enregistrées
- `backend/src/__tests__/` — suite de tests existante
- `backend/src/services/safetyService.ts` — doit être corrigé (ST2) avant ce smoke test

---

### Sous-tâche 5 — Mettre à jour les anciens plans de continuation

**Statut :** `[x] done`

**Intent**
Les fichiers `mythenena-continuation-plan.md` et `interview-activities-plan.md` listent toutes leurs sous-tâches comme `[ ] pending` alors que le code correspondant est entièrement écrit. Les laisser en l'état est trompeur pour quiconque reprend le projet.

**Expected Outcomes**
- Chaque sous-tâche des deux anciens plans est marquée `[x] done` avec une note indiquant qu'elle a été implémentée dans la session précédente
- Un commentaire en tête de chaque ancien fichier indique la date de mise à jour et renvoie à ce plan

**Todo List**
1. Dans `mythenena-continuation-plan.md` : remplacer tous les `[ ] pending` par `[x] done` et ajouter en tête : `> Mis à jour — code implémenté. Voir mythenena-final-plan.md pour les tâches restantes.`
2. Dans `interview-activities-plan.md` : même opération
3. Vérifier que les statuts sont cohérents avec le code réellement présent

**Relevant Context**
- `mythenena-continuation-plan.md` — 7 sous-tâches toutes pending
- `interview-activities-plan.md` — 9 sous-tâches toutes pending

---

## Ordre d'exécution

```
ST1 (db:push + db:seed)
  → ST2 (safetyService)
    → ST3 (fakeRepos enrichis)
      → ST4 (typecheck + tests + smoke test)
        → ST5 (mettre à jour anciens plans)
```

ST1 débloque le serveur. ST2 et ST3 peuvent être travaillées en parallèle une fois ST1 validée. ST4 dépend de ST2 et ST3.

---

## Récapitulatif des endpoints opérationnels après ce plan

| Module | Route | Auth | État visé |
|---|---|---|---|
| Session | POST /api/session/start | non | ✅ déjà fonctionnel |
| Mini-sondage | GET /api/survey/mini | oui | ✅ déjà fonctionnel |
| Sondage adaptatif | POST /api/survey/adaptive/next | oui | ✅ Gemini |
| Chat | POST /api/chat/message | oui | ✅ Gemini |
| Synthèse | POST /api/synthese/generate | oui | ✅ Gemini |
| Entretien | POST /api/interview/start | oui | ✅ Gemini SSE |
| Entretien | POST /api/interview/:id/respond | oui | ✅ Gemini SSE |
| Profil | GET /api/profile | oui | ✅ agrégation deltas |
| Profil | PATCH /api/profile/hypotheses/:id | oui | ✅ correction utilisateur |
| Activités | POST /api/activities/recommend | oui | ✅ Gemini + filtre Kolb |
| Activités | GET /api/activities | oui | ✅ bibliothèque |
| Transcription | POST /api/transcription | non | ✅ Groq Whisper |
| Sécurité | checkText() | interne | ⚠️ ST2 requis |
