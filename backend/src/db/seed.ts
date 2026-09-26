import "dotenv/config";
import { getDb } from "./index";
import {
  activityLibrary,
  associations,
  forumCategories,
  forumPosts,
  forumReplies,
  professionals,
  resources,
  surveyQuestions,
} from "./schema";
import type { Language } from "../../../shared/types/survey";

/**
 * Seed — données de démonstration pour le hackathon.
 *
 * Toutes les fiches de l'annuaire sont marquées `isFictional: true` : elles sont
 * clairement identifiées comme fictives et leurs actions de contact sont
 * désactivées côté serveur. Les numéros d'urgence ne sont PAS inventés ici, ils
 * proviennent des constantes partagées et doivent être vérifiés.
 */

const TODAY = new Date().toISOString().slice(0, 10);

const CATEGORIES = [
  {
    id: "cat-stress",
    slug: "stress",
    labelFr: "Stress et gestion des presses",
    labelMg: "Fiainam-baraka sy fitantanana ny ziogan-tra",
    description: "Travail, argent, études : partager ce qui pèse au quotidien.",
    icon: "wind",
    position: 1,
  },
  {
    id: "cat-isolation",
    slug: "isolement",
    labelFr: "Se sentir seul(e)",
    labelMg: "Mihevy fa irery",
    description: "Quand l'on a l'impression que personne ne voit ce que l'on vit.",
    icon: "users",
    position: 2,
  },
  {
    id: "cat-relationships",
    slug: "relations-difficiles",
    labelFr: "Relations difficiles",
    labelMg: "Fifandraisana sarotra",
    description: "Couple, famille, relations de travail : parler de ce qui blesse.",
    icon: "heart",
    position: 3,
  },
  {
    id: "cat-anxiety",
    slug: "anxiete",
    labelFr: "Anxiété et inquiétudes",
    labelMg: "Fahatahotra sy fanontaniana",
    description: "Pour ceux qui n'arrivent pas à décrocher.",
    icon: "cloud",
    position: 4,
  },
  {
    id: "cat-family",
    slug: "vie-familiale",
    labelFr: "Vie familiale",
    labelMg: "Fiainam-bidy",
    description: "Parenté, enfants : « on ne peut pas en parler à la maison ».",
    icon: "home",
    position: 5,
  },
  {
    id: "cat-sleep",
    slug: "sommeil",
    labelFr: "Sommeil et fatigue",
    labelMg: "Torimaso sy rindrina",
    description: "Nuits courtes, journées lourdes.",
    icon: "moon",
    position: 6,
  },
  {
    id: "cat-moments",
    slug: "bons-moments",
    labelFr: "Petites victoires",
    labelMg: "Fahombiazana kely",
    description: "Ce qui va mieux, aussi cela compte et se partage.",
    icon: "sun",
    position: 7,
  },
];

const FORUM_POSTS = [
  { id: "post-demo-001", pseudonym: "Lumière_du_soir", avatarSeed: "demo-lumiere", content: "Je teste une routine sans écran avant de dormir. Ce qui m'aide le plus, c'est de noter une seule pensée avant de poser le téléphone.", categoryId: "cat-sleep", daysAgo: 1 },
  { id: "post-demo-002", pseudonym: "Pas_après_pas", avatarSeed: "demo-pas", content: "Cette semaine, j'ai réussi à sortir marcher dix minutes malgré une journée lourde. Je partage cette petite victoire.", categoryId: "cat-moments", daysAgo: 2 },
  { id: "post-demo-003", pseudonym: "Miora", avatarSeed: "demo-miora", content: "Comment faites-vous quand les inquiétudes reviennent le soir ? Je cherche des idées simples à essayer.", categoryId: "cat-anxiety", daysAgo: 3 },
  { id: "post-demo-004", pseudonym: "Etudiant_zen", avatarSeed: "demo-etudiant", content: "Les examens approchent et la pression monte. Respirer lentement avant de commencer m'aide à retrouver un peu de concentration.", categoryId: "cat-stress", daysAgo: 4 },
];

const FORUM_REPLIES = [
  { id: "reply-demo-001", postId: "post-demo-001", pseudonym: "Aina", avatarSeed: "demo-aina", content: "J'écris aussi trois lignes dans un carnet. Cela m'aide à ne pas garder toutes mes pensées en tête." },
  { id: "reply-demo-002", postId: "post-demo-003", pseudonym: "Mandroso", avatarSeed: "demo-mandroso", content: "La respiration 4-6 et l'exercice 5-4-3-2-1 sont faciles à essayer quand l'inquiétude monte." },
  { id: "reply-demo-003", postId: "post-demo-004", pseudonym: "Tiana", avatarSeed: "demo-tiana", content: "Je découpe mes révisions en petites étapes et je fais une vraie pause entre deux." },
];

/** Les 5 questions du mini-sondage (étape 1 du parcours). */
const MINI_QUESTIONS: {
  id: string;
  domain: string;
  text: string;
  textMg: string;
  choices: { id: string; label: string; labelMg: string }[];
  position: number;
}[] = [
  {
    id: "mini-mood",
    domain: "mood",
    text: "Comment décrirais-tu ton humeur ces derniers jours ?",
    textMg: "Ahoana ny toe-tsainao ny andro farany?",
    choices: [
      { id: "mood-good", label: "Plutôt bien", labelMg: "Tsara ny ankapobeny" },
      { id: "mood-neutral", label: "Nioyen, ça passe", labelMg: "Mba izy" },
      { id: "mood-low", label: "Souvent bas", labelMg: "Matetika ambany" },
      { id: "mood-very-low", label: "Très bas la plupart du temps", labelMg: "Ambany be ny ankapobeny" },
    ],
    position: 1,
  },
  {
    id: "mini-sleep",
    domain: "sleep",
    text: "Comment s'est passé ton sommeil récemment ?",
    textMg: "Ahoana ny torimasonao tatiza?",
    choices: [
      { id: "sleep-good", label: "J'ai dormi normalement", labelMg: "Nitory mahazatra aho" },
      { id: "sleep-light", label: "Sommeil léger, réveils fréquents", labelMg: "Torimaso malemy, matetika mamoha" },
      { id: "sleep-hard", label: "J'ai du mal à m'endormir", labelMg: "Sarotra ny mitondra torr-dia" },
      { id: "sleep-very-hard", label: "Je dors presque pas", labelMg: "Tsy dia matory aho" },
    ],
    position: 2,
  },
  {
    id: "mini-stress",
    domain: "stress",
    text: "Face aux pressions du quotidien, tu te sens…",
    textMg: "Ny ziogan-tra andavanandro, mahatsatra ny hoe…",
    choices: [
      { id: "stress-calm", label: "Je arrive à gérer", labelMg: "Takatra ny fitantanana azy" },
      { id: "stress-medium", label: "Parfois dépassée(e)", labelMg: "Indraindray miatoatra" },
      { id: "stress-high", label: "Souvent dépassée(e)", labelMg: "Matetika miatoatra" },
      { id: "stress-overwhelmed", label: "Je ne sais plus comment faire", labelMg: "Tsy hitany intsony ny fomba" },
    ],
    position: 3,
  },
  {
    id: "mini-relationships",
    domain: "relationships",
    text: "Dans tes relations proches (famille, amis, couple)…",
    textMg: "Ao amin'ny fifandraisanao akaiky (fampiharana, saramay, vadim-piainana)…",
    choices: [
      { id: "rel-supported", label: "Je me sens soutenu(e)", labelMg: "Mahatsiaro manohana aho" },
      { id: "rel-mixed", label: "C'est variable", labelMg: "Miova-miova" },
      { id: "rel-alone", label: "Je me sens souvent seul(e)", labelMg: "Matetika mahatsiaro ho irery aho" },
      { id: "rel-hard", label: "C'est vraiment difficile", labelMg: "Tena sarotra" },
    ],
    position: 4,
  },
  {
    id: "mini-motivation",
    domain: "motivation",
    text: "Pour les choses simples du quotidien…",
    textMg: "Ho an'ny zavatra tsotra andavanandro…",
    choices: [
      { id: "motivation-ok", label: "J'ai encore envie", labelMg: "Mbola manana fanantenana aho" },
      { id: "motivation-low", label: "Ça prend beaucoup d'effort", labelMg: "Mila fanamby be" },
      { id: "motivation-very-low", label: "Je n'ai presque plus envie de rien", labelMg: "Tsy dia manana fanantenana ny zavatra rehetra" },
    ],
    position: 5,
  },
];

const PROFESSIONALS = [
  {
    id: "pro-001",
    name: "Dr. Rakoto Marie (FICTIF)",
    title: "Psychologue clinicienne",
    city: "Antananarivo",
    region: "Analamanga",
    languages: ["fr", "mg"] as Language[],
    specialties: ["anxiété", "humeur", "TCC", "gestion du stress"],
    modalities: ["in-person", "online"] as const,
    address: "Antananarivo, Madagascar",
    bio: "Fiche de démonstration. Elle n'existe pas réellement.",
    fee: null,
    schedule: null,
    acceptsNewPatients: true,
  },
  {
    id: "pro-002",
    name: "Dr. Razafy Jean-Paul (FICTIF)",
    title: "Psychiatre",
    city: "Toamasina",
    region: "Atsinanana",
    languages: ["fr"] as Language[],
    specialties: ["burn-out", "stress post-traumatique", "sommeil"],
    modalities: ["in-person"] as const,
    address: "Toamasina, Madagascar",
    bio: "Fiche de démonstration. Elle n'existe pas réellement.",
    fee: null,
    schedule: null,
    acceptsNewPatients: false,
  },
  {
    id: "pro-003",
    name: "Mme Andrianina Voahangy (FICTIF)",
    title: "Psychologue, spécialiste du lien familial",
    city: "Fianarantsoa",
    region: "Haute Matsiatra",
    languages: ["mg", "fr"] as Language[],
    specialties: ["relations toxiques", "emprise", "abus émotionnel", "vie familiale"],
    modalities: ["in-person"] as const,
    address: "Fianarantsoa, Madagascar",
    bio: "Fiche de démonstration. Elle n'existe pas réellement.",
    fee: null,
    schedule: null,
    acceptsNewPatients: true,
  },
  {
    id: "pro-004",
    name: "Dr. Ranaivoson Tiana (FICTIF)",
    title: "Psychologue clinicien, TCC",
    city: "Mahajanga",
    region: "Boeny",
    languages: ["fr"] as Language[],
    specialties: ["anxiété", "phobies", "estime de soi", "confiance en soi"],
    modalities: ["online"] as const,
    address: null,
    bio: "Fiche de démonstration. Elle n'existe pas réellement.",
    fee: null,
    schedule: null,
    acceptsNewPatients: true,
  },
];

const ASSOCIATIONS = [
  {
    id: "assoc-001",
    name: "Association d'écoute (FICTIVE)",
    description:
      "Écoute anonyme et gratuite entre pairs. Fiche de démonstration : elle n'existe pas réellement.",
    descriptionMg: "Fikarohana ara-pifamonjono. Karatra fanandramana.",
    city: "Antananarivo",
    region: "Analamanga",
    phone: null,
    email: null,
    website: null,
  },
  {
    id: "assoc-002",
    name: "Ligne d'écoute en malagasy (FICTIVE)",
    description:
      "Écoute en langue malagasy. Fiche de démonstration : aucun numéro réel n'est publié ici.",
    descriptionMg: "Fikarohana amin'ny teny malagasy. Karatra fanandramana.",
    city: "Antsirabe",
    region: "Vakinankaratra",
    phone: null,
    email: null,
    website: null,
  },
];

const RESOURCES = [
  {
    id: "res-001",
    slug: "respirer-quand-l-angoisse-arrive",
    type: "exercise",
    title: "Respirer quand l'angoisse arrive",
    titleMg: "Mialà sasatra rehefa tonga ny fahatahotra",
    summary:
      "Un exercice de respiration très court, utilisable partout, même là où personne ne peut vous voir.",
    summaryMg: "Fanatanterahana fofonaina fohy azo ampiasaina na aiza na aiza.",
    body: [
      "Quand l'angoisse monte, le corps cherche à respirer plus vite. C'est ce rythme rapide qui entretient la tension.",
      "1. Installe-toi si tu peux, sinon reste debout, pieds au sol.",
      "2. Inspire par le nez pendant 4 temps.",
      "3. Bloque doucement 2 temps.",
      "4. Souffle par la bouche pendant 6 temps — l'expiration est plus longue que l'inspiration.",
      "5. Répète 4 fois. Tu n'as pas besoin de le faire parfaitement.",
      "Si tu as des vertiges, arrête et respire normalement.",
    ].join("\n\n"),
    bodyMg: null,
    tags: ["angoisse", "respiration", "exercice"],
    readingMinutes: 2,
    isOfflineAvailable: true,
    isPublished: true,
  },
  {
    id: "res-002",
    slug: "comprendre-le-stress",
    type: "article",
    title: "Comprendre ce qu'est le stress",
    titleMg: "Fahatakarana ny stress",
    summary:
      "Le stress n'est pas forcément un ennemi : comprendre son mécanisme permet de mieux le gérer.",
    summaryMg: "Ny stress dia tsy mety ho fohy foana.",
    body: [
      "Le stress est une réponse normale du corps face à une difficulté. Il mobilise l'énergie et l'attention.",
      "Il devient problématique lorsqu'il reste élevé en permanence, même au repos : le corps n'a plus le temps de récupérer.",
      "Quelques signes d'un stress durable : troubles du sommeil, irritabilité, difficulté à se concentrer, fatigue au réveil.",
      "Si ces signes durent plusieurs semaines et gênent votre quotidien, c'est un bon moment pour en parler à quelqu'un.",
    ].join("\n\n"),
    bodyMg: null,
    tags: ["stress", "compréhension"],
    readingMinutes: 3,
    isOfflineAvailable: true,
    isPublished: true,
  },
  {
    id: "res-003",
    slug: "reperer-une-relation-toxique",
    type: "article",
    title: "Repérer les signes d'une relation qui blesse",
    titleMg: "Fanamarinana ny fifandraisana manampatra",
    summary:
      "Distinguer un désaccord ordinaire d'un schéma qui répète l'humiliation, l'isolement ou la peur.",
    summaryMg: "Feparitana ny fifaninana tsotra sy ny toe-javatra miverina.",
    body: [
      "Une relation conflictuelle comporte des désaccords, mais le désaccord reste possible et la parole reste ouverte.",
      "Un schéma qui blesse se répète : on est fréquemment mis en cause, isolé de ses proches, ou on a peur de la réaction de l'autre.",
      "Chercher des conseils auprès d'une personne de confiance ou d'un professionnel est une démarche de force, pas un aveu de faiblesse.",
      "Si vous ressentez une peur physique de la réaction de l'autre, prioritize votre sécurité et les numéros d'urgence.",
    ].join("\n\n"),
    bodyMg: null,
    tags: ["relations", "estime de soi", "isolement"],
    readingMinutes: 4,
    isOfflineAvailable: true,
    isPublished: true,
  },
  {
    id: "res-004",
    slug: "quand-se-faire-aider",
    type: "guide",
    title: "Comment décider de se faire accompagner",
    titleMg: "Fomba hanatarana ny fanampiana",
    summary:
      "Ce n'est pas seulement quand c'est très grave qu'on a le droit d'aller chercher de l'aide.",
    summaryMg: "Tsy ilaina ny mihevitra ny fahadisoana vao mahazo fanampiana.",
    body: [
      "Idée reçue : « j'attendrai que ça aille vraiment mal ». En réalité, demander de l'aide tôt rend le chemin plus court.",
      "Trois questions simples : est-ce que cela dure depuis plusieurs semaines ? est-ce que cela gêne mon travail, mon sommeil ou mes relations ? est-ce que j'en parle à personne ?",
      "Si vous répondez oui à l'une de ces questions, un premier pas suffit : un mot à une association, ou une ligne d'écoute.",
      "Les psychologues et psychiatres à Madagascar sont peu nombreux et souvent chers. L'annuaire de l'application permet de chercher par ville, langue et modalité.",
    ].join("\n\n"),
    bodyMg: null,
    tags: ["aide", "orientation", "annuaire"],
    readingMinutes: 3,
    isOfflineAvailable: true,
    isPublished: true,
  },
  {
    id: "res-005",
    slug: "temoignages-difficiles-une-crise-dangoisse",
    type: "article",
    title: "Témoigner est difficile : quelques pistes",
    titleMg: "Ny fijoronana dia sarotra",
    summary:
      "Se raconter, même brièvement, demande des mots. Voici des amorces simples, sans obligation de tout dire.",
    summaryMg: "Ny mitantara dia mitady ny teny.",
    body: [
      "Il n'est pas nécessaire de raconter toute une histoire. Une phrase sur ce qui s'est passé cette semaine suffit souvent.",
      "Astuces si les mots manquent : commencez par la journée, par un moment précis, ou par ce qui a été dit et non par ce qui a été vécu.",
      "Dans l'espace communautaire, tout est publié sous pseudonyme. Rappel : un pseudonyme masque votre identité aux autres membres, mais ne garantit pas un anonymat technique absolu.",
      "Vos réponses aux questionnaires et vos conversations restent privées et séparées du forum : rien n'y est publié automatiquement.",
    ].join("\n\n"),
    bodyMg: null,
    tags: ["témoignage", "forum", "confidentialité"],
    readingMinutes: 3,
    isOfflineAvailable: true,
    isPublished: true,
  },
];

const ACTIVITIES = [
  {
    id: "act-001",
    slug: "respiration-4-7-8",
    name: "Respiration 4-7-8",
    category: "breathing",
    durationMinSeconds: 60,
    durationMaxSeconds: 180,
    kolbModes: ["accommodating", "converging"],
    stateTargets: ["tension", "agitation", "colère"],
    energyLevels: ["very_low", "low", "medium", "high"],
    contraindications: [],
    descriptionFr: "Inspirez 4 temps, bloquez 7 temps, soufflez 8 temps. Cet exercice active le système nerveux parasympathique et réduit rapidement le stress.",
    descriptionMg: "Misintona 4 taona, mihazona 7 taona, mitsoka 8 taona.",
    isActive: true,
  },
  {
    id: "act-002",
    slug: "respiration-coherente",
    name: "Respiration cohérente (5-5)",
    category: "breathing",
    durationMinSeconds: 120,
    durationMaxSeconds: 300,
    kolbModes: ["assimilating", "converging"],
    stateTargets: ["tension", "rumination", "fatigue"],
    energyLevels: ["very_low", "low", "medium"],
    contraindications: [],
    descriptionFr: "Inspirez 5 secondes, expirez 5 secondes. Cette cadence de 6 respirations/minute synchronise le cœur et le cerveau.",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-003",
    slug: "ancrage-5-4-3-2-1",
    name: "Ancrage sensoriel 5-4-3-2-1",
    category: "grounding",
    durationMinSeconds: 120,
    durationMaxSeconds: 300,
    kolbModes: ["diverging", "accommodating"],
    stateTargets: ["agitation", "tension", "rumination"],
    energyLevels: ["low", "medium", "high"],
    contraindications: [],
    descriptionFr: "Nommez 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez. Revient dans le moment présent.",
    descriptionMg: "Lazao ny zavatra 5 hitanao, 4 azoanao, 3 renao, 2 vonahinao, 1 andramainao.",
    isActive: true,
  },
  {
    id: "act-004",
    slug: "scan-corporel",
    name: "Scan corporel bienveillant",
    category: "grounding",
    durationMinSeconds: 180,
    durationMaxSeconds: 600,
    kolbModes: ["diverging", "assimilating"],
    stateTargets: ["tension", "fatigue", "tristesse"],
    energyLevels: ["very_low", "low", "medium"],
    contraindications: [],
    descriptionFr: "Parcourez mentalement votre corps de la tête aux pieds. Notez les sensations sans les juger. Relâchez les tensions identifiées à l'expiration.",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-005",
    slug: "meteo-interieure",
    name: "Météo intérieure",
    category: "emotion",
    durationMinSeconds: 60,
    durationMaxSeconds: 180,
    kolbModes: ["diverging", "accommodating"],
    stateTargets: ["tristesse", "solitude", "fatigue"],
    energyLevels: ["very_low", "low", "medium"],
    contraindications: [],
    descriptionFr: "Imaginez que vos émotions sont la météo du moment. Quel temps fait-il en vous ? Nuageux, ensoleillé, orageux ? Observez sans juger.",
    descriptionMg: "Ahoana ny toetr'andro ao anatinao ankehitriny?",
    isActive: true,
  },
  {
    id: "act-006",
    slug: "roue-des-emotions",
    name: "Roue des émotions",
    category: "emotion",
    durationMinSeconds: 120,
    durationMaxSeconds: 300,
    kolbModes: ["assimilating", "diverging"],
    stateTargets: ["tristesse", "colère", "agitation"],
    energyLevels: ["low", "medium", "high"],
    contraindications: [],
    descriptionFr: "Identifiez votre émotion principale, puis cherchez les nuances autour. De la colère vient souvent de la peur ou de la tristesse en dessous.",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-007",
    slug: "lettre-a-soi",
    name: "Lettre bienveillante à soi",
    category: "cognitive",
    durationMinSeconds: 300,
    durationMaxSeconds: 900,
    kolbModes: ["assimilating", "diverging"],
    stateTargets: ["tristesse", "solitude", "rumination"],
    energyLevels: ["low", "medium"],
    contraindications: [],
    descriptionFr: "Écrivez une lettre à vous-même comme vous l'écririez à un ami qui traverse la même chose. Que lui diriez-vous avec bienveillance ?",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-008",
    slug: "recadrage-cognitif",
    name: "Recadrage d'une pensée automatique",
    category: "cognitive",
    durationMinSeconds: 180,
    durationMaxSeconds: 600,
    kolbModes: ["converging", "assimilating"],
    stateTargets: ["rumination", "tension", "agitation"],
    energyLevels: ["medium", "high"],
    contraindications: [],
    descriptionFr: "Identifiez une pensée qui revient. Posez-vous : est-ce un fait ou une interprétation ? Que dirait quelqu'un de bienveillant à ce sujet ?",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-009",
    slug: "liste-gratitude",
    name: "3 choses qui ont bien été",
    category: "cognitive",
    durationMinSeconds: 120,
    durationMaxSeconds: 300,
    kolbModes: ["accommodating", "converging"],
    stateTargets: ["tristesse", "fatigue", "solitude"],
    energyLevels: ["very_low", "low", "medium"],
    contraindications: [],
    descriptionFr: "Notez 3 choses qui se sont bien passées aujourd'hui, aussi petites soient-elles. Entraîne le cerveau à remarquer ce qui va bien.",
    descriptionMg: "Soraty ny zavatra 3 tsara nitranga androany.",
    isActive: true,
  },
  {
    id: "act-010",
    slug: "action-minuscule",
    name: "L'action minuscule",
    category: "behavioral",
    durationMinSeconds: 30,
    durationMaxSeconds: 120,
    kolbModes: ["accommodating", "converging"],
    stateTargets: ["fatigue", "tristesse", "rumination"],
    energyLevels: ["very_low", "low"],
    contraindications: [],
    descriptionFr: "Choisissez une action tellement petite qu'il serait ridicule de ne pas la faire. Debout, un verre d'eau, une fenêtre ouverte. Juste ça.",
    descriptionMg: "Misafidiana hetsika kely iray fotsiny.",
    isActive: true,
  },
  {
    id: "act-011",
    slug: "pause-movement",
    name: "Pause mouvement (2 min)",
    category: "behavioral",
    durationMinSeconds: 120,
    durationMaxSeconds: 180,
    kolbModes: ["accommodating", "converging"],
    stateTargets: ["tension", "agitation", "fatigue"],
    energyLevels: ["low", "medium", "high"],
    contraindications: [],
    descriptionFr: "Levez-vous, étirez les bras, les jambes. Marchez 2 minutes. Le mouvement régule le cortisol et décharge la tension physique.",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-012",
    slug: "valeurs-prioritaires",
    name: "Mes valeurs prioritaires",
    category: "values",
    durationMinSeconds: 300,
    durationMaxSeconds: 600,
    kolbModes: ["assimilating", "diverging"],
    stateTargets: ["rumination", "tristesse"],
    energyLevels: ["medium", "high"],
    contraindications: [],
    descriptionFr: "Listez vos 5 valeurs les plus importantes. Pour chacune, notez une action concrète de la semaine qui les reflète. Y a-t-il un écart ?",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-013",
    slug: "carte-relationnelle",
    name: "Carte relationnelle",
    category: "relational",
    durationMinSeconds: 300,
    durationMaxSeconds: 900,
    kolbModes: ["diverging", "assimilating"],
    stateTargets: ["solitude", "tristesse"],
    energyLevels: ["medium", "high"],
    contraindications: [],
    descriptionFr: "Dessinez un cercle avec vous au centre. Placez les personnes de votre vie autour selon leur proximité. Qui vous manque ? Qui vous nourrit ?",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-014",
    slug: "kolb-experience",
    name: "Réflexion sur une expérience récente",
    category: "cognitive",
    durationMinSeconds: 300,
    durationMaxSeconds: 600,
    kolbModes: ["diverging", "assimilating"],
    stateTargets: ["rumination", "tension"],
    energyLevels: ["medium", "high"],
    contraindications: [],
    descriptionFr: "Décrivez une situation récente difficile : que s'est-il passé ? Qu'avez-vous ressenti ? Qu'avez-vous appris ? Que feriez-vous différemment ?",
    descriptionMg: null,
    isActive: true,
  },
  {
    id: "act-015",
    slug: "visualisation-lieu-sur",
    name: "Visualisation du lieu sûr",
    category: "grounding",
    durationMinSeconds: 180,
    durationMaxSeconds: 480,
    kolbModes: ["diverging", "accommodating"],
    stateTargets: ["tension", "agitation", "tristesse", "colère"],
    energyLevels: ["very_low", "low", "medium"],
    contraindications: [],
    descriptionFr: "Fermez les yeux. Imaginez un endroit où vous vous sentez en sécurité. Engagez tous vos sens. Restez-y le temps dont vous avez besoin.",
    descriptionMg: "Misinona. Eritreretao ny toerana iray izay azo antoka ho anao.",
    isActive: true,
  },
];

async function seed() {
  console.log("🌱 Seeding Mythenena (données de démonstration)...");
  const db = getDb();

  await db
    .insert(forumCategories)
    .values(CATEGORIES)
    .onConflictDoNothing();
  console.log(`   ✓ ${CATEGORIES.length} thématiques de forum`);

  await db.insert(forumPosts).values(FORUM_POSTS.map((post) => ({
    id: post.id,
    authorSessionId: null,
    pseudonym: post.pseudonym,
    avatarSeed: post.avatarSeed,
    content: `${post.content} [Donnée de démonstration]`,
    categoryId: post.categoryId,
    moderationStatus: "visible",
    isFlagged: false,
    createdAt: new Date(Date.now() - post.daysAgo * 86400000),
    updatedAt: new Date(Date.now() - post.daysAgo * 86400000),
  }))).onConflictDoNothing();
  await db.insert(forumReplies).values(FORUM_REPLIES.map((reply) => ({
    ...reply,
    authorSessionId: null,
    content: `${reply.content} [Donnée de démonstration]`,
    moderationStatus: "visible",
    isFlagged: false,
  }))).onConflictDoNothing();
  console.log(`   ✓ ${FORUM_POSTS.length} publications et ${FORUM_REPLIES.length} réponses fictives`);

  await db
    .insert(surveyQuestions)
    .values(
      MINI_QUESTIONS.map((question) => ({
        id: question.id,
        surveyType: "mini",
        domain: question.domain,
        type: "single",
        text: question.text,
        textMg: question.textMg,
        allowSkip: true,
        choices: question.choices,
        position: question.position,
        isActive: true,
      }))
    )
    .onConflictDoNothing();
  console.log(`   ✓ ${MINI_QUESTIONS.length} questions du mini-sondage`);

  await db
    .insert(professionals)
    .values(
      PROFESSIONALS.map((pro) => ({
        id: pro.id,
        name: pro.name,
        title: pro.title,
        city: pro.city,
        region: pro.region,
        languages: pro.languages,
        specialties: pro.specialties,
        modalities: [...pro.modalities],
        phone: null,
        email: null,
        address: pro.address,
        lat: null,
        lng: null,
        bio: pro.bio,
        fee: pro.fee,
        schedule: pro.schedule,
        lastVerified: TODAY,
        isFictional: true,
        acceptsNewPatients: pro.acceptsNewPatients,
        isActive: true,
      }))
    )
    .onConflictDoNothing();
  console.log(`   ✓ ${PROFESSIONALS.length} fiches professionnelles (toutes fictives)`);

  await db
    .insert(associations)
    .values(
      ASSOCIATIONS.map((assoc) => ({
        ...assoc,
        lastVerified: TODAY,
        isFictional: true,
        isActive: true,
      }))
    )
    .onConflictDoNothing();
  console.log(`   ✓ ${ASSOCIATIONS.length} associations (toutes fictives)`);

  await db
    .insert(resources)
    .values(
      RESOURCES.map((resource) => ({
        ...resource,
        publishedAt: new Date(),
        author: "Équipe Mythenena",
      }))
    )
    .onConflictDoNothing();
  console.log(`   ✓ ${RESOURCES.length} ressources`);

  await db
    .insert(activityLibrary)
    .values(ACTIVITIES)
    .onConflictDoNothing();
  console.log(`   ✓ ${ACTIVITIES.length} activités interactives`);

  console.log("✅ Seed terminé.");
  console.log("   ⚠️  Toutes les fiches de l'annuaire sont fictives : aucun contact n'est possible.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
