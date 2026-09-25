import "dotenv/config";
import { getDb } from "./index";
import {
  associations,
  forumCategories,
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

async function seed() {
  console.log("🌱 Seeding Mythenena (données de démonstration)...");
  const db = getDb();

  await db
    .insert(forumCategories)
    .values(CATEGORIES)
    .onConflictDoNothing();
  console.log(`   ✓ ${CATEGORIES.length} thématiques de forum`);

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

  console.log("✅ Seed terminé.");
  console.log("   ⚠️  Toutes les fiches de l'annuaire sont fictives : aucun contact n'est possible.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
