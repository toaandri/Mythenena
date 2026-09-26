import json

with open('D:/Mythenena/web/locales/fr.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['confidentialite'] = {
    'title': 'Conditions de confidentialit\u00e9',
    'intro': 'Derni\u00e8re mise \u00e0 jour : Septembre 2026. Mythenena s\'engage \u00e0 prot\u00e9ger votre vie priv\u00e9e. Cette politique explique quelles donn\u00e9es nous collectons, comment nous les utilisons et vos droits.',
    'importantTitle': 'Point important',
    'importantContent': 'Mythenena est un outil d\'\u00e9coute et d\'information, pas un service m\u00e9dical. En cas d\'urgence, contactez les services d\'urgence (+261 20 22 XXX XX) ou rendez-vous aux urgences.',
    'sections': {
        'dataProtection': {
            'title': 'Protection de vos donn\u00e9es',
            'content': 'Nous ne collectons que les donn\u00e9es strictement n\u00e9cessaires : nom d\'affichage, email/t\u00e9l\u00e9phone (pour la connexion), et vos r\u00e9ponses aux \u00e9valuations (anonymis\u00e9es). Aucune donn\u00e9e sensible n\'est stock\u00e9e sans votre consentement explicite.'
        },
        'anonymity': {
            'title': 'Anonymat garanti',
            'content': 'Sur le forum, le chat IA et les groupes de parole, vous \u00eates identifi\u00e9 uniquement par un pseudonyme. Votre identit\u00e9 r\u00e9elle n\'est jamais visible par les autres utilisateurs. Les professionnels de l\'annuaire ne voient que ce que vous choisissez de partager lors d\'une demande de rendez-vous.'
        },
        'dataUsage': {
            'title': 'Utilisation des donn\u00e9es',
            'content': 'Vos donn\u00e9es servent uniquement \u00e0 : vous authentifier, personnaliser votre exp\u00e9rience, am\u00e9liorer nos services (statistiques anonymes), et vous contacter si vous le demandez (rendez-vous). Nous ne vendons jamais vos donn\u00e9es.'
        },
        'sharing': {
            'title': 'Partage avec des tiers',
            'content': 'Aucun partage commercial. Seuls cas de partage : 1) Vous demandez un rendez-vous (transmis au professionnel choisi), 2) Obligation l\u00e9gale (signalement danger imminent), 3) Prestataires techniques (h\u00e9bergement, IA) sous contrat de confidentialit\u00e9 strict.'
        },
        'rights': {
            'title': 'Vos droits',
            'content': 'Conform\u00e9ment au RGPD et \u00e0 la loi malagasy : droit d\'acc\u00e8s, de rectification, d\'effacement, de portabilit\u00e9, de limitation, d\'opposition. Pour exercer vos droits : contactez-nous via la page Confidentialit\u00e9. Suppression du compte possible depuis les param\u00e8tres (\u00e0 venir).'
        },
        'limits': {
            'title': 'Limites de responsabilit\u00e9',
            'content': 'Mythenena n\'est pas un service m\u00e9dical d\'urgence. L\'IA peut se tromper. Les groupes de parole sont mod\u00e9r\u00e9s mais pas surveill\u00e9s 24/7. En cas de crise, contactez imm\u00e9diatement les secours.'
        },
        'contact': {
            'title': 'Nous contacter',
            'content': 'Pour toute question sur vos donn\u00e9es : confidentialite@mythenena.mg ou via le formulaire de contact. D\u00e9l\u00e9gu\u00e9 \u00e0 la protection des donn\u00e9es : DPO Mythenena.'
        }
    }
};

data['connexion'] = {
    'title': 'Connexion',
    'subtitle': 'Connectez-vous pour acc\u00e9der \u00e0 votre espace personnel',
    'identifierLabel': 'Email ou num\u00e9ro de t\u00e9l\u00e9phone',
    'passwordLabel': 'Mot de passe',
    'passwordPlaceholder': '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
    'submit': 'Se connecter',
    'noAccount': 'Pas encore de compte ?',
    'signupLink': 'S\'inscrire',
    'demoNote': 'Mode d\u00e9mo : tout identifiant/mot de passe fonctionne',
    'successMessage': 'Connexion r\u00e9ussie ! Redirection...',
    'errors': {
        'required': 'Veuillez remplir tous les champs',
        'invalidIdentifier': 'Entrez un email ou un num\u00e9ro de t\u00e9l\u00e9phone valide',
        'invalidCredentials': 'Identifiants incorrects'
    }
};

data['inscription'] = {
    'title': 'Cr\u00e9er un compte',
    'subtitle': 'Rejoignez Mythenena pour acc\u00e9der \u00e0 votre espace personnel',
    'nameLabel': 'Nom d\'affichage',
    'namePlaceholder': 'Votre pr\u00e9nom ou pseudo',
    'identifierLabel': 'Email ou num\u00e9ro de t\u00e9l\u00e9phone',
    'passwordLabel': 'Mot de passe',
    'passwordPlaceholder': 'Au moins 6 caract\u00e8res',
    'confirmPasswordLabel': 'Confirmer le mot de passe',
    'confirmPasswordPlaceholder': 'R\u00e9p\u00e9tez le mot de passe',
    'submit': 'Cr\u00e9er mon compte',
    'hasAccount': 'D\u00e9j\u00e0 un compte ?',
    'loginLink': 'Se connecter',
    'termsNote': 'En cr\u00e9ant un compte, vous acceptez nos ',
    'termsLink': 'Conditions de confidentialit\u00e9',
    'demoNote': 'Mode d\u00e9mo : l\'inscription est simul\u00e9e',
    'successMessage': 'Compte cr\u00e9\u00e9 avec succ\u00e8s ! Redirection vers la connexion...',
    'errors': {
        'required': 'Veuillez remplir tous les champs',
        'nameTooShort': 'Le nom doit contenir au moins 2 caract\u00e8res',
        'invalidIdentifier': 'Entrez un email ou un num\u00e9ro de t\u00e9l\u00e9phone valide',
        'passwordTooShort': 'Le mot de passe doit contenir au moins 6 caract\u00e8res',
        'passwordMismatch': 'Les mots de passe ne correspondent pas'
    }
};

data['aide'] = {
    'title': 'Aide \u00e0 l\'utilisation',
    'searchPlaceholder': 'Rechercher une question...',
    'quickLinksTitle': 'Acc\u00e8s rapide',
    'faqTitle': 'Questions fr\u00e9quentes',
    'noResults': 'Aucun r\u00e9sultat pour votre recherche',
    'contactTitle': 'Besoin d\'aide suppl\u00e9mentaire ?',
    'contactSubtitle': 'Contactez notre \u00e9quipe support',
    'contactDesc': 'Notre \u00e9quipe est l\u00e0 pour vous aider. R\u00e9ponse sous 24h ouvr\u00e9es.',
    'contactEmail': 'Nous contacter par email',
    'contactForum': 'Poser une question sur le forum',
    'emergencyTitle': '\u26a0\ufe0f Situation d\'urgence',
    'emergencyDesc': 'Si vous \u00eates en danger imm\u00e9diat ou si quelqu\'un l\'est, n\'attendez pas : appelez le +261 20 22 XXX XX (ligne d\'\u00e9coute Madagascar) ou rendez-vous aux urgences les plus proches. Vous n\'etes pas seul.',
    'emergencyLink': 'Voir tous les contacts d\'urgence',
    'categories': {
        'gettingStarted': 'D\u00e9marrer avec Mythenena',
        'evaluation': 'Votre \u00c9valuation Personnelle',
        'forum': 'Forum d\'entraide & Groupes de parole',
        'chat': 'Aide Instantan\u00e9e par IA',
        'premium': 'Offres Premium & Suivi',
        'account': 'Mon compte & Confidentialit\u00e9'
    },
    'quickLinks': {
        'evaluation': 'Faire mon \u00e9valuation',
        'forum': 'Rejoindre le forum',
        'chat': 'Parler \u00e0 l\'assistant IA',
        'resources': 'Exercices & Ressources',
        'annuaire': 'Trouver un professionnel',
        'premium': 'Voir les offres Premium'
    },
    'faq': {
        'q1': 'Comment commencer sur Mythenena ?',
        'a1': 'Rien de plus simple : aucune inscription n\'est requise pour commencer. Cliquez sur \"Commencer mon \u00e9valuation\" sur la page d\'accueil, r\u00e9pondez aux 5 questions, et d\u00e9couvrez vos ressources personnalis\u00e9es. Vous pouvez cr\u00e9er un compte plus tard pour sauvegarder votre historique.',
        'q2': 'L\'application est-elle vraiment gratuite ?',
        'a2': 'Oui, l\'\u00e9valuation, le forum, l\'assistant IA, les exercices de respiration et l\'annuaire sont 100% gratuits. Les offres Premium (Suivi Essentiel \u00e0 115 000 Ar/mois et Suivi Intensif \u00e0 207 000 Ar/mois) ajoutent des s\u00e9ances avec des professionnels.',
        'q3': 'Mes donn\u00e9es sont-elles en s\u00e9curit\u00e9 ?',
        'a3': 'Absolument. Nous utilisons le chiffrement TLS, ne stockons que le strict n\u00e9cessaire, et ne vendons jamais vos donn\u00e9es. Voir nos Conditions de confidentialit\u00e9 pour tous les d\u00e9tails.',
        'q4': 'Puis-je utiliser Mythenena sans cr\u00e9er de compte ?',
        'a4': 'Oui ! Toutes les fonctionnalit\u00e9s principales (\u00e9valuation, forum anonyme, chat IA, exercices, annuaire) sont accessibles sans compte. Le compte sert seulement \u00e0 synchroniser votre historique entre appareils.',
        'q5': '\u00c0 quoi sert l\'\u00c9valuation Personnelle ?',
        'a5': 'C\'est un bilan exploratoire de 5 questions (humeur, sommeil, stress, relations, motivation) qui vous donne un aper\u00e7u visuel de votre bien-\u00eatre et vous oriente vers les ressources adapt\u00e9es. Ce n\'est pas un diagnostic m\u00e9dical.',
        'q6': 'Puis-je refaire l\'\u00e9valuation ?',
        'a6': 'Autant de fois que vous voulez. Chaque \u00e9valuation est dat\u00e9e, vous pouvez suivre votre \u00e9volution dans \"Mon bilan\" (page Synth\u00e8se).',
        'q7': 'Que faire si mon score est bas ?',
        'a7': 'Un score bas indique une d\u00e9tresse. L\'application vous sugg\u00e8re automatiquement : exercices de respiration, chat IA, forum, ou prise de rendez-vous avec un professionnel. En cas d\'urgence, appelez le +261 20 22 XXX XX.',
        'q8': 'Comment rejoindre un groupe de parole ?',
        'a8': 'Allez sur \"Forum d\'entraide\", choisissez un groupe (D\u00e9pression, Estime de soi, Sobri\u00e9t\u00e9), cliquez dessus. Vous entrez directement dans le tchat de groupe anonyme. 15 participants par groupe en moyenne.',
        'q9': 'Les groupes sont-ils mod\u00e9r\u00e9s ?',
        'a9': 'Oui, par une \u00e9quipe de mod\u00e9ration et des filtres automatiques. Mais ce n\'est pas une surveillance 24/7. Signalez tout contenu inqui\u00e9tant. En cas de crise, contactez les secours.',
        'q10': 'Puis-je cr\u00e9er mon propre groupe ?',
        'a10': 'La fonctionnalit\u00e9 \"Cr\u00e9er un nouveau groupe\" arrive bient\u00f4t. Pour l\'instant, les 3 groupes principaux couvrent les besoins les plus fr\u00e9quents.',
            'q11': 'Quel est le rôle de l\'assistant IA ?',
            'a11': 'C\'est un outil d\'écoute et d\'orientation disponible 24h/24. Il aide à clarifier vos ressentis, à identifier des ressources utiles et à vous orienter vers les bonnes étapes suivantes.',
        'q12': 'Mes conversations avec l\'IA sont-elles priv\u00e9es ?',
        'a12': 'Oui, elles sont chiffr\u00e9es et anonymis\u00e9es. Elles ne sont pas lues par des humains sauf signalement de danger imminent (obligation l\u00e9gale de protection).',
        'q13': 'L\'IA parle-t-elle malagasy ?',
        'a13': 'Oui ! L\'assistant comprend et r\u00e9pond en fran\u00e7ais, malagasy et anglais. Changez la langue dans le menu (ic\u00f4ne globe en haut \u00e0 droite).',
        'q14': 'Qu\'inclut l\'offre Suivi Essentiel (115 000 Ar/mois) ?',
        'a14': 'Tout le gratuit + 1 s\u00e9ance de 2h par semaine avec un professionnel de l\'\u00e9coute (psychologue/psychiatre v\u00e9rifi\u00e9), suivi personnalis\u00e9 confidentiel, r\u00e9siliable \u00e0 tout moment.',
        'q15': 'Comment prendre rendez-vous avec un professionnel ?',
        'a15': 'Depuis l\'onglet \"Annuaire\" ou apr\u00e8s avoir choisi une offre Premium, cliquez sur \"Prendre RDV\", indiquez vos disponibilit\u00e9s et le motif. Le professionnel vous contacte via la plateforme.',
        'q16': 'Comment supprimer mon compte ?',
        'a16': 'La suppression de compte sera disponible prochainement dans les param\u00e8tres. En attendant, contactez-nous via la page Confidentialit\u00e9 pour demander la suppression (trait\u00e9 sous 30 jours).',
        'q17': 'J\'ai oubli\u00e9 mon mot de passe, comment faire ?',
        'a17': 'Sur la page Connexion, cliquez sur \"Mot de passe oubli\u00e9\" (\u00e0 venir). Vous recevrez un lien de r\u00e9initialisation par email ou SMS selon votre identifiant.',
        'q18': 'Puis-je changer mon email/t\u00e9l\u00e9phone ?',
        'a18': 'Oui, depuis les param\u00e8tres de votre compte (ic\u00f4ne engrenage en haut \u00e0 droite > Connexion > modifier).'
    }
};

with open('D:/Mythenena/web/locales/fr.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('fr.json updated with all new pages')