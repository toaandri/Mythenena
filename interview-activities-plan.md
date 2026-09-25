> **Mis à jour** — Toutes les sous-tâches ci-dessous ont été implémentées lors de la session précédente. Voir [`mythenena-final-plan.md`](mythenena-final-plan.md) pour les tâches restantes (ST1–ST5).

# Mythenena — Module Entretien Analytique + Activités Interactives

## Vue d'ensemble

**Objectif :** Ajouter deux modules entièrement nouveaux au backend existant (Hono + Drizzle + Supabase) :

1. **Module Entretien Analytique** — L'IA mène un entretien structuré en 9 phases, construit un profil évolutif de l'utilisateur (événements de vie, hypothèses, schémas comportementaux, valeurs, identité), et met à jour ce profil à chaque réponse.

2. **Module Activités Interactives** — L'IA sélectionne et orchestre des activités guidées (respiration, ancrage sensoriel, météo intérieure, exercices Kolb, etc.) selon l'état du moment, l'énergie disponible, l'objectif immédiat et le profil de la personne.

**Contraintes :**
- Backend uniquement (Hono + Drizzle + Supabase) — aucun frontend
- `user_id` dans les nouvelles tables = `sessionId` de la table `sessions` existante (FK → sessions.id)
- Anonymat absolu maintenu — aucune donnée d'identité réelle
- Même stack et mêmes patterns que l'existant (repos, routes, services, Gemini)
- Tout est codé même si le prototype ne démontre que quelques scénarios

**Décisions d'architecture :**
- **Streaming SSE** sur `POST /api/interview/:id/respond` — Gemini stream la réponse texte token par token via Server-Sent Events. Le client reçoit les tokens immédiatement. L'extraction structurée du profil et la mise à jour en base se font APRES la fin du stream, de manière transparente.
- **Deltas de profil uniquement** dans `profileSnapshots` — on ne sauvegarde pas le profil complet à chaque turn, seulement le delta JSON contenant les changements (nouveaux éléments, hypothèses modifiées). Le profil complet est reconstruit à la demande en agrégeant tous les deltas depuis le début.

**Hors-plan :**
- Frontend/mobile — pas touché
- Shared/ — lecture seule
- Tests d'intégration contre vraie DB

---

## Sous-tâches

---

### Sous-tâche 1 — Schéma DB : 11 nouvelles tables

**Statut :** `[x] done`

**Intent**
Ajouter les 11 tables du module entretien + 2 tables pour les activités dans `schema.ts`. Sans ces tables, rien d'autre ne peut fonctionner.

**Expected Outcomes**
- Les 13 tables sont définies dans `backend/src/db/schema.ts`
- Tous les types Row correspondants sont exportés
- `npm run db:push` applique les nouvelles tables sur Supabase sans erreur

**Todo List**
1. Ouvrir `backend/src/db/schema.ts` et ajouter à la fin, après `synthesisCorrections` :

**Tables du module entretien analytique :**

- `interviewSessions` — id, userId (FK→sessions.id cascade), objective, currentPhase (0-9), status (active/completed/paused), kolbProfile (jsonb, préférences Kolb observées), createdAt, updatedAt
- `interviewTurns` — id, interviewSessionId (FK→interviewSessions.id cascade), role (user/assistant), content, methodUsed (narrative/oars/socratic/values/kolb/identity/synthesis), questionGoal, createdAt
- `evidenceItems` — id, userId (FK→sessions.id cascade), turnId, type (event/emotion/belief/value/goal/action/contradiction/unknown), content, period, confidence (low/medium/high), createdAt
- `lifeEvents` — id, userId (FK→sessions.id cascade), period, event, emotion, meaningGiven, decision, consequence, evidenceIds (text array), createdAt
- `identityDomains` — id, userId (FK→sessions.id cascade), domain (personal/family/social/cultural/school_work/digital/projected/history), content (jsonb), evidenceIds (text array), confidence (low/medium/high), updatedAt
- `valuesMap` — id, userId (FK→sessions.id cascade), valueName, claimedImportance (high/medium/low), behaviorExamples (jsonb), conflicts (jsonb), confidence (low/medium/high), updatedAt
- `behaviorPatterns` — id, userId (FK→sessions.id cascade), trigger, interpretation, emotion, action, shortTermResult, longTermResult, evidenceFor (text array), evidenceAgainst (text array), confidence (low/medium/high), createdAt, updatedAt
- `hypotheses` — id, userId (FK→sessions.id cascade), text, evidenceFor (text array), evidenceAgainst (text array), confidence (low/medium/high), status (exploring/plausible/confirmed/corrected/rejected), userCorrection, createdAt, updatedAt
- `contradictions` — id, userId (FK→sessions.id cascade), statementA, statementB, contextDifference, status (open/explained/resolved), createdAt
- `learningPreferences` — id, userId (FK→sessions.id cascade) UNIQUE, domain, actionScore (0.0), observationScore (0.0), conceptualizationScore (0.0), applicationScore (0.0), evidenceIds (text array), lastUpdated
- `profileSnapshots` — id, userId (FK→sessions.id cascade), delta (jsonb — UNIQUEMENT les changements du turn : nouveaux events, hypothèses modifiées, valeurs mises à jour), turnId (référence au turn source), createdAt

**Tables du module activités :**

- `activityLibrary` — id, slug (unique), name, category (breathing/grounding/emotion/cognitive/behavioral/values/relational), durationSeconds (min/max), kolbModes (text array), stateTargets (text array), energyLevels (text array), contraindications (text array), descriptionFr, descriptionMg, isActive
- `activitySessions` — id, userId (FK→sessions.id cascade), activitySlug, stateAxes (jsonb — les 6 axes), startedAt, completedAt, feedback (better/same/worse), feedbackNote, wasAbandoned

2. Exporter tous les types Row pour les nouvelles tables
3. Lancer `npm run db:push` pour appliquer le schéma

**Relevant Context**
- `backend/src/db/schema.ts` — pattern existant à suivre (pgTable, text, boolean, jsonb, timestamp, index, uniqueIndex)
- `backend/drizzle.config.ts` — lit DATABASE_URL
- Types exportés ligne 404-419 du schéma actuel

---

### Sous-tâche 2 — Seed des activités interactives

**Statut :** `[x] done`

**Intent**
Peupler la table `activityLibrary` avec les 15 activités définies dans le document (sections 5.1-5.15). Sans ce seed, le moteur d'activités ne peut rien proposer.

**Expected Outcomes**
- 15 entrées dans `activityLibrary` après `npm run db:seed`
- Chaque activité a ses `stateTargets`, `kolbModes`, `energyLevels` et `contraindications` corrects
- Le seed existant n'est pas cassé

**Todo List**
1. Ouvrir `backend/src/db/seed.ts` et ajouter un bloc `ACTIVITIES` avec les 15 activités :
   - `breathing-bubble` (bulle de respiration, tous modes Kolb)
   - `grounding-54321` (ancrage sensoriel, énergie faible à moyenne)
   - `weather-inside` (météo intérieure, expression émotionnelle)
   - `mental-battery` (batterie mentale, évaluation énergie)
   - `fact-vs-interpretation` (tri fait/interprétation, rumination)
   - `leaves-on-river` (feuilles sur rivière, pensées intrusives)
   - `micro-mission` (micro-mission d'activation, énergie très faible)
   - `values-compass` (boussole des valeurs, tous contextes)
   - `perspective-wheel` (roue des perspectives, mode divergent)
   - `solution-lab` (laboratoire de solutions, mode convergent)
   - `why-map` (carte du pourquoi, mode assimilateur)
   - `try-and-observe` (défis essaie et observe, mode accommodateur)
   - `conversation-rehearsal` (répétition conversation, relationnel)
   - `focus-minute` (minute de concentration, TDAH/rumination)
   - `personal-chest` (coffre des ressources personnelles, tous contextes)
2. Insérer dans `activityLibrary` si elle est vide (upsert par slug)
3. Tester que `npm run db:seed` s'exécute sans erreur

**Relevant Context**
- `backend/src/db/seed.ts` — pattern existant (tableaux de constantes + insert)
- Document sections 5.1 à 5.15 — définition de chaque activité
- Document section 7 — matrice Kolb par objectif

---

### Sous-tâche 3 — Repositories : entretien + profil + activités

**Statut :** `[x] done`

**Intent**
Créer les repositories Drizzle pour les nouvelles tables, en suivant exactement le pattern existant (interface + types + factory function). Cela isole la couche DB des routes et permet les tests.

**Expected Outcomes**
- `backend/src/repositories/interview.repo.ts` — opérations CRUD sur interviewSessions, interviewTurns
- `backend/src/repositories/profile.repo.ts` — opérations sur evidenceItems, lifeEvents, identityDomains, valuesMap, behaviorPatterns, hypotheses, contradictions, learningPreferences, profileSnapshots
- `backend/src/repositories/activity.repo.ts` — lecture activityLibrary, écriture activitySessions
- `backend/src/repositories/index.ts` mis à jour — Repos interface + createRepos étendus

**Todo List**
1. Créer `backend/src/repositories/interview.repo.ts` :
   - `InterviewRepo` interface : createSession, findSession, updateSession, listTurns, addTurn
   - Types : NewInterviewSession, NewInterviewTurn
   - Factory : createInterviewRepo(db)

2. Créer `backend/src/repositories/profile.repo.ts` :
   - `ProfileRepo` interface : upsertEvidence, listEvidence, upsertLifeEvent, listLifeEvents, upsertIdentityDomain, getIdentityDomains, upsertValue, getValues, upsertPattern, listPatterns, upsertHypothesis, listHypotheses, updateHypothesisStatus, upsertContradiction, listContradictions, upsertLearningPreferences, getLearningPreferences, saveSnapshot, getLatestSnapshot
   - Factory : createProfileRepo(db)

3. Créer `backend/src/repositories/activity.repo.ts` :
   - `ActivityRepo` interface : listActivities, findActivity, createActivitySession, updateActivitySession, listUserActivityHistory
   - Factory : createActivityRepo(db)

4. Mettre à jour `backend/src/repositories/index.ts` :
   - Ajouter `interview: InterviewRepo`, `profile: ProfileRepo`, `activity: ActivityRepo` à `Repos`
   - Ajouter dans `createRepos(db)`

**Relevant Context**
- `backend/src/repositories/session.repo.ts` — pattern exact à reproduire
- `backend/src/repositories/survey.repo.ts` — pattern upsert avec conflict
- `backend/src/repositories/index.ts` — Repos interface actuelle

---

### Sous-tâche 4 — Service moteur d'entretien (interviewEngine.ts)

**Statut :** `[x] done`

**Intent**
Créer le cerveau du module : le moteur d'entretien analytique qui suit les 9 phases, applique la boucle de raisonnement en 8 étapes, choisit la prochaine question, **streame la réponse via SSE**, puis extrait les éléments structurés et met à jour le profil en arrière-plan après la fin du stream.

**Expected Outcomes**
- `backend/src/services/interviewEngine.ts` exportant `streamResponse()` et `startInterview()`
- `streamResponse()` : retourne un `AsyncGenerator<string>` — chaque yield est un token de texte envoyé immédiatement au client. Après épuisement du générateur, l'extraction structurée et la mise à jour du profil se font en fond.
- `startInterview()` : crée la session, génère la première question (non streamée — réponse courte), retourne la réponse complète
- Fallback si Gemini échoue en cours de stream : terminer le stream avec un message de repli, ne pas corrompre le profil

**Todo List**
1. Créer `backend/src/services/interviewEngine.ts`

2. Définir les types internes :
   - `InterviewState` — phase actuelle, profil reconstruit depuis deltas, historique turns, objectif suivant
   - `StreamChunk` — token texte ou event de fin `{ done: true, phase, nextGoal, methodUsed }`
   - `ProfileDelta` — objet JSON avec seulement les changements du turn (nouveaux events, hypothèses modifiées)

3. Implémenter `startInterview(repos, sessionId, objective, language)` :
   - Créer `interviewSession` en base
   - Appel Gemini non-streamé (première question courte)
   - Retourner `{ interviewSessionId, phase: 0, firstQuestion, disclaimer }`

4. Implémenter `streamResponse(repos, interviewSessionId, userMessage, language)` retournant `AsyncGenerator<string>` :
   - Phase 1 — AVANT le stream : charger l'historique (max 10 turns) + reconstruire le profil depuis les deltas + construire le system prompt analytique + vérifier la clé Gemini
   - Phase 2 — STREAM : appeler `model.generateContentStream()` → yield chaque token texte reçu
   - Phase 3 — APRES le stream (en fond, non bloquant) :
     - Persister le turn utilisateur + le turn assistant (texte complet accumulé)
     - Appeler Gemini une seconde fois (appel rapide, prompt court) pour extraire le delta structuré
     - Persister le delta dans `profileSnapshots` et mettre à jour les tables profil
     - Mettre à jour la phase de l'interview session

5. Implémenter `reconstructProfile(deltas)` — agrège les deltas dans l'ordre chronologique pour reconstituer le profil complet

6. Implémenter `selectNextQuestionObjective(profile)` — logique déterministe des 9 priorités

7. Implémenter `buildSystemPrompt(phase, profile, language)` — prompt analytique complet

8. Fallback stream : si Gemini échoue, yield un message de repli, ne pas sauvegarder de turn corrompu

**Relevant Context**
- `backend/src/services/aiService.ts` — pattern Gemini existant, extractJson(), ServiceUnavailableError
- Document sections 5, 6, 7, 12 — règles, boucle de raisonnement, priorités, instructions système
- Document section 9 — format JSON du profil structuré
- `backend/src/repositories/profile.repo.ts` (Sous-tâche 3) — ops de mise à jour profil

---

### Sous-tâche 5 — Service moteur d'activités (activityEngine.ts)

**Statut :** `[x] done`

**Intent**
Créer le moteur qui sélectionne et orchestre les activités interactives selon les 6 axes (état, énergie, objectif, Kolb, contexte santé mentale, accessibilité). L'IA orchestre mais ne génère pas librement — elle choisit dans la bibliothèque validée.

**Expected Outcomes**
- `backend/src/services/activityEngine.ts` exportant `selectActivity()` et `recordFeedback()`
- `selectActivity()` : prend les 6 axes → filtre les activités compatibles → appelle Gemini pour choisir et personnaliser la présentation → retourne l'activité + instructions adaptées
- `recordFeedback()` : enregistre le retour utilisateur et met à jour `learningPreferences`
- Les contre-indications sont respectées (contextes de crise → parcours prioritaire, pas d'activité ludique)

**Todo List**
1. Créer `backend/src/services/activityEngine.ts`

2. Définir les types :
   - `ActivityAxes` — state, energyLevel (very_low/low/medium/high), immediateGoal, kolbPreference, mentalHealthContext, accessibility
   - `ActivityRecommendation` — activity, presentationFr, presentationMg, durationSeconds, adaptations

3. Implémenter `selectActivity(repos, userId, axes, language)` :
   - Charger toutes les activités actives depuis `activityRepo.listActivities()`
   - Filtrer : éliminer les activités incompatibles avec l'état et les contre-indications
   - Si contexte critique (risque suicidaire, automutilation) → retourner parcours prioritaire d'urgence (pas une activité ludique)
   - Appeler Gemini pour choisir parmi les activités filtrées et personnaliser la présentation (langue, durée, métaphore selon profil Kolb)
   - Créer une `activitySession` en base
   - Retourner `ActivityRecommendation`

4. Implémenter `recordFeedback(repos, activitySessionId, feedback, note)` :
   - Mettre à jour `activitySession` avec le feedback
   - Mettre à jour `learningPreferences` selon le retour (quelle activité a aidé)

5. Implémenter `filterByAxes(activities, axes)` — logique déterministe de filtrage sans appel IA

**Relevant Context**
- Document sections 2, 3, 4, 5, 6, 7 — les 6 axes, contre-indications, matrice Kolb
- `backend/src/services/aiService.ts` — pattern Gemini à réutiliser
- `backend/src/repositories/activity.repo.ts` (Sous-tâche 3)
- `backend/shared/constants/urgency.ts` — ressources d'urgence pour le parcours prioritaire

---

### Sous-tâche 6 — Routes entretien (interview.ts)

**Statut :** `[x] done`

**Intent**
Exposer les endpoints HTTP du module entretien. Toutes les routes nécessitent une session authentifiée.

**Expected Outcomes**
- `POST /api/interview/start` — crée une session d'entretien, retourne la première question
- `POST /api/interview/:id/respond` — envoie une réponse, reçoit la suivante + profil mis à jour
- `GET /api/interview/:id/state` — retourne la phase, les thèmes, l'objectif suivant

**Todo List**
1. Créer `backend/src/routes/interview.ts` avec factory `createInterviewRoutes(deps)`

2. `POST /start` :
   - Body : `{ objective: string (max 500), language: "fr"|"mg" }`
   - Appeler `interviewEngine.startInterview()`
   - Retourner `{ interviewSessionId, phase, firstQuestion, disclaimer }`

3. `POST /:id/respond` :
   - Body : `{ message: string (max 4000), language: "fr"|"mg" }`
   - Vérifier que l'interviewSession appartient à la session courante
   - Passer d'abord par `safetyService.checkText()` — si critical, retourner 200 JSON avec ressources d'urgence (pas de stream)
   - Ouvrir une réponse SSE : `Content-Type: text/event-stream`
   - Persister le turn utilisateur immédiatement
   - Appeler `interviewEngine.streamResponse()` → itérer sur le générateur async → envoyer chaque token comme `data: <token>\n\n`
   - Une fois le stream terminé, envoyer un event final `data: [DONE]\n\n`
   - La mise à jour du profil se fait en arrière-plan dans le service (non bloquant pour le client)

4. `GET /:id/state` :
   - Vérifier appartenance
   - Retourner `{ phase, currentObjective, coveredDomains, turnCount, status }`

5. Enregistrer la route dans `app.ts` : `app.use("/api/interview/*", auth)` + `app.route("/api/interview", createInterviewRoutes(deps))`

**Relevant Context**
- `backend/src/routes/chat.ts` et `synthese.ts` — pattern exact à suivre
- `backend/src/services/safetyService.ts` — vérification sécurité obligatoire
- `backend/src/app.ts` — enregistrement des routes

---

### Sous-tâche 7 — Routes profil (profile.ts)

**Statut :** `[x] done`

**Intent**
Exposer le profil évolutif de l'utilisateur. Ces endpoints permettent de consulter et corriger ce que l'IA a compris.

**Expected Outcomes**
- `GET /api/profile/story` — chapitres de vie + ligne du temps
- `GET /api/profile/hypotheses` — hypothèses avec indices et niveaux de confiance
- `POST /api/profile/hypotheses/:id/correct` — corriger/confirmer/rejeter une hypothèse
- `GET /api/profile/identity` — carte d'identité personnelle évolutive (7 dimensions)
- `GET /api/profile/evolution` — changements entre snapshots

**Todo List**
1. Créer `backend/src/routes/profile.ts` avec factory `createProfileRoutes(deps)`

2. `GET /story` :
   - Récupérer `lifeEvents` de la session, ordonnés par période
   - Retourner `{ events, totalEvents, disclaimer }`

3. `GET /hypotheses` :
   - Récupérer `hypotheses` de la session, filtrées par status (par défaut : actives)
   - Retourner avec les evidenceFor/Against et confidence

4. `POST /hypotheses/:id/correct` :
   - Body : `{ correction: string, newStatus: "confirmed"|"corrected"|"rejected" }`
   - Vérifier appartenance
   - Appeler `profileRepo.updateHypothesisStatus()`
   - Retourner l'hypothèse mise à jour

5. `GET /identity` :
   - Récupérer `identityDomains` + `valuesMap` + `learningPreferences`
   - Retourner la carte structurée complète

6. `GET /evolution` :
   - Récupérer les derniers `profileSnapshots` (max 10)
   - Retourner les snapshots avec leurs dates

7. Enregistrer dans `app.ts` : `app.use("/api/profile/*", auth)` + `app.route("/api/profile", createProfileRoutes(deps))`

**Relevant Context**
- `backend/src/routes/synthese.ts` — pattern GET + correction
- `backend/src/repositories/profile.repo.ts` (Sous-tâche 3)

---

### Sous-tâche 8 — Routes activités (activities.ts)

**Statut :** `[x] done`

**Intent**
Exposer les endpoints du module activités interactives.

**Expected Outcomes**
- `POST /api/activities/select` — sélectionner une activité selon les 6 axes
- `GET /api/activities/library` — liste des activités disponibles (consultation)
- `POST /api/activities/:sessionId/feedback` — enregistrer le retour après une activité

**Todo List**
1. Créer `backend/src/routes/activities.ts` avec factory `createActivitiesRoutes(deps)`

2. `POST /select` (auth requise) :
   - Body : `{ state, energyLevel, immediateGoal, kolbPreference?, mentalHealthContext?, accessibility?, language }`
   - Appeler `activityEngine.selectActivity()`
   - Si urgence → retourner ressources d'urgence au lieu d'une activité
   - Retourner `{ activitySessionId, activity, presentation, durationSeconds, adaptations }`

3. `GET /library` (public — accessible sans session) :
   - Retourner toutes les activités actives avec leurs métadonnées
   - Filtrable par `?category=` et `?kolbMode=`

4. `POST /:sessionId/feedback` (auth requise) :
   - Body : `{ feedback: "better"|"same"|"worse", note?: string }`
   - Appeler `activityEngine.recordFeedback()`
   - Retourner confirmation

5. Enregistrer dans `app.ts` :
   - `GET /api/activities/library` public
   - `app.use("/api/activities/select", auth)` + `app.use("/api/activities/:sessionId/feedback", auth)`
   - `app.route("/api/activities", createActivitiesRoutes(deps))`

**Relevant Context**
- `backend/src/routes/ressources.ts` — pattern route publique
- `backend/src/services/activityEngine.ts` (Sous-tâche 5)

---

### Sous-tâche 9 — Validation finale

**Statut :** `[x] done`

**Intent**
S'assurer que tout s'assemble : typecheck propre, tests existants toujours verts, serveur démarre, routes répondent correctement.

**Expected Outcomes**
- `npm run typecheck` → 0 erreur TypeScript
- `npm run test` → 108 / 108 verts (tests existants non cassés)
- `npm run db:push` → nouvelles tables créées sur Supabase
- `npm run db:seed` → 15 activités insérées
- `POST /api/interview/start` → retourne une première question
- `GET /api/profile/story` → retourne `{ events: [] }` pour une nouvelle session
- `POST /api/activities/select` → retourne une activité
- Git commit + push sur branche `backend`

**Todo List**
1. Lancer `npm run typecheck` — corriger toutes les erreurs
2. Lancer `npm run test` — vérifier 108/108
3. Lancer `npm run db:push` — appliquer les nouvelles tables
4. Lancer `npm run db:seed` — vérifier les 15 activités
5. Tester manuellement les routes clés
6. `git add` + `git commit` + `git push origin backend`

**Relevant Context**
- `backend/src/__tests__/` — suite existante
- `backend/src/app.ts` — vérifier que toutes les routes sont enregistrées

---

## Ordre d'exécution

```
Sous-tâche 1 (schema DB)
  → Sous-tâche 2 (seed activités)
    → Sous-tâche 3 (repositories)
      → Sous-tâche 4 (moteur entretien)  ← en parallèle avec →  Sous-tâche 5 (moteur activités)
        → Sous-tâche 6 (routes interview)  ←  Sous-tâche 7 (routes profil)  ←  Sous-tâche 8 (routes activités)
          → Sous-tâche 9 (validation finale)
```

Les sous-tâches 1, 2, 3 sont des prérequis stricts.
Les sous-tâches 4 et 5 peuvent être travaillées en parallèle.
Les sous-tâches 6, 7 et 8 dépendent des services (4 et 5).

---

## Récapitulatif des nouveaux endpoints

### Module Entretien Analytique
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /api/interview/start | oui | Démarrer un entretien, recevoir la première question |
| POST | /api/interview/:id/respond | oui | Envoyer une réponse, recevoir la suivante |
| GET | /api/interview/:id/state | oui | Phase, thèmes explorés, objectif suivant |

### Module Profil Évolutif
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | /api/profile/story | oui | Chapitres de vie et ligne du temps |
| GET | /api/profile/hypotheses | oui | Hypothèses avec indices et confiance |
| POST | /api/profile/hypotheses/:id/correct | oui | Corriger/confirmer/rejeter une hypothèse |
| GET | /api/profile/identity | oui | Carte d'identité personnelle (7 dimensions) |
| GET | /api/profile/evolution | oui | Évolution entre snapshots |

### Module Activités Interactives
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /api/activities/select | oui | Sélectionner une activité selon les 6 axes |
| GET | /api/activities/library | non | Bibliothèque des 15 activités |
| POST | /api/activities/:sessionId/feedback | oui | Retour après une activité |
