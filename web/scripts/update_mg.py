import json

with open('D:/Mythenena/web/locales/mg.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['confidentialite'] = {
    'title': 'Lalam-bavaiky fiaraha-miasa',
    'intro': 'Farany voavinana : Septambra 2026. Mythenena dia manohitra ny fiaraha-miasanareo. Ity lalam-panoharana ity dia mampahalala inona no angatainay, ahoana no ampiasainay, ary ny zo rehetra azonao.',
    'importantTitle': 'Zava-dehibe',
    'importantContent': 'Mythenena dia fitaovana fihaino sy fampahalalana, tsy mamerina ny fitaovana ara-pahasalamana. Raha maika, antso ny maika (+261 20 22 XXX XX) na mankany amin\'ny hopitaly.',
    'sections': {
        'dataProtection': {
            'title': 'Fiarovana ny angonao',
            'content': 'Mametraka fotsiny izay ilaina: anarana hita, email/telefaona (hidirana), ary ny valinareo amin\'ny fanombanana (tsy misy anarana). Tsy misy angona tsiambaratelo voatahiry tsy amin\'ny sitraponao.'
        },
        'anonymity': {
            'title': 'Tsy fantatra ny anaranao',
            'content': 'Amin\'ny forum, chat IA, ary vondrona miresaka, dia anarana kely (pseudonym) no hita. Tsy hitan\'ny hafa ny anaranao marina. Ny matihanina amin\'ny boky adiresy dia mahita fotsiny izay mety hampidirinao raha manao fangatahana fotoana.',
        },
        'dataUsage': {
            'title': 'Fampiasana ny angona',
            'content': 'Ny angonao dia azo ampiasaina ho an\'ny: hidirana, fanitsiana ny fiasanao, fanatsarana ny sehatra (tatitra tsy fantatra anarana), ary hifandraisana anao raha te-hanao fangatahana ianao. Tsy mivarotra angona isika.',
        },
        'sharing': {
            'title': 'Fampidirana amin\'ny olona hafa',
            'content': 'Tsy mivarotra. Fotoana fotsiny: 1) Manao fangatahana (alefa ho any amin\'ny matihanina), 2) Lalao ara-dalana (torolalana loza), 3) Mpanolotra teknika (hosting, IA) amin\'ny fanekena fiaraha-miasa.',
        },
        'rights': {
            'title': 'Ny zo rehetra azonao',
            'content': 'Araka ny RGPD sy lalana Malagasy: zo hahita, hanova, hadio, handeha, hanohy, hamely. Mba hampiasa ny zo: miantso antsika amin\'ny pejy Confidentialite. Azonao hadio ny kaonty amin\'ny fikirakirana (ho avy).',
        },
        'limits': {
            'title': 'Fahafahany fananan-tanana',
            'content': 'Mythenena tsy fitaovana maika ara-pitsaboana. Ny IA mety hanao diso. Ny vondrona miresaka dia voazava fa tsy mamy 24/7. Raha maika, miantso ny maika hatrany.',
        },
        'contact': {
            'title': 'Miantso antsika',
            'content': 'Raha misy fanontaniana momba ny angonao: confidentialite@mythenena.mg na amin\'ny formulary. Mpandraikitra fiarovana angona: DPO Mythenena.',
        }
    }
};

data['connexion'] = {
    'title': 'Fidirana',
    'subtitle': 'Miditra mba hahita ny toeram-panantenanao',
    'identifierLabel': 'Email na nisa telefaona',
    'passwordLabel': 'Tenim-pitsipika',
    'passwordPlaceholder': '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
    'submit': 'Miditra',
    'noAccount': 'Tsy misy kaonty mbola ?',
    'signupLink': 'Mamorona kaonty',
    'demoNote': 'Demo : na inona na inona idantina/tenim-pitsipika dia mety',
    'successMessage': 'Fidirana vita! Mandroso...',
    'errors': {
        'required': 'Soraty ny champ rehetra',
        'invalidIdentifier': 'Ampidio email na nisa telefaona mety',
        'invalidCredentials': 'Tsy mety ny idantina'
    }
};

data['inscription'] = {
    'title': 'Mamorona kaonty',
    'subtitle': 'Miara-miasa amin\'ny Mythenena mba hahita ny toeram-panantenanao',
    'nameLabel': 'Anarana hita',
    'namePlaceholder': 'Anaranao na pseudonym',
    'identifierLabel': 'Email na nisa telefaona',
    'passwordLabel': 'Tenim-pitsipika',
    'passwordPlaceholder': 'Ampty 6 litera',
    'confirmPasswordLabel': 'Hamahana ny tenim-pitsipika',
    'confirmPasswordPlaceholder': 'Avereno ny tenim-pitsipika',
    'submit': 'Mamorona ny kaontiako',
    'hasAccount': 'Misy kaonty efa ?',
    'loginLink': 'Miditra',
    'termsNote': 'Raha mamorona kaonty ianao, dia manaiky ny ',
    'termsLink': 'Lalam-bavaiky fiaraha-miasa',
    'demoNote': 'Demo : fanangananana fotsiny',
    'successMessage': 'Kaonty vita! Mandroso any amin\'ny fidirana...',
    'errors': {
        'required': 'Soraty ny champ rehetra',
        'nameTooShort': 'Ilaina 2 litera amin\'ny anarana',
        'invalidIdentifier': 'Ampidio email na nisa telefaona mety',
        'passwordTooShort': 'Ilaina 6 litera amin\'ny tenim-pitsipika',
        'passwordMismatch': 'Tsy mitovy ny tenim-pitsipika roa'
    }
};

data['aide'] = {
    'title': 'Fanohana amin\'ny fampiasana',
    'searchPlaceholder': 'Hikaroka fanontaniana...',
    'quickLinksTitle': 'Fidirana vitsivitsy',
    'faqTitle': 'Fanontaniana matetika',
    'noResults': 'Tsy misy valiny ho an\'ny karazanao',
    'contactTitle': 'Mila fanampiana fanampiny?',
    'contactSubtitle': 'Miantso ny ekipa fanohana',
    'contactDesc': 'Ny ekipa dia eto hampianarina anao. Valiny ao anatin\'ny 24 ora.',
    'contactEmail': 'Miantso amin\'ny email',
    'contactForum': 'Manaova fanontaniana amin\'ny forum',
    'emergencyTitle': '\u26a0\ufe0f Toe-javatra maika',
    'emergencyDesc': 'Raha ao an-toetra loza ianao, aza androandro: antso +261 20 22 XXX XX (tsipika fihaino Madagasikara) na mankany hopitaly. Tsy irery ianao.',
    'emergencyLink': 'Jereo ny fifandraisana maika rehetra',
    'categories': {
        'gettingStarted': 'Manomboka amin\'ny Mythenena',
        'evaluation': 'Ny Fanombanana Anao',
        'forum': 'Fihaonambe Fiarahamonina & Vondrona Miresaka',
        'chat': 'Fanampiana Avy Hatrany amin\'ny IA',
        'premium': 'Karazana Premium & Fanaraha-maso',
        'account': 'Kaontiako & Fiaraha-miasa'
    },
    'quickLinks': {
        'evaluation': 'Manao fanombanana',
        'forum': 'Miditra amin\'ny forum',
        'chat': 'Miresaka amin\'ny IA',
        'resources': 'Fanaovana & Loharanom-baovao',
        'annuaire': 'Hitady matihanina',
        'premium': 'Jereo ny karazana Premium'
    },
    'faq': {
        'q1': 'Ahoana no manomboka amin\'ny Mythenena?',
        'a1': 'Mora foana: tsy mila fanoratana anaran\'iray. Kliky \"Manomboka ny fanombanako\" ao anaty pejy fanjakana, valio ny fanontaniana 5, ary hitanao ny loharano azonao. Afaka manao kaonty ianao aorian\'ny hoe hitahiry ny historicalinao.',
        'q2': 'Moa ve fa maimaim-poana ny sehatra?',
        'a2': 'Eny, ny fanombanana, forum, chat IA, fanaovana aina, ary boky adiresy dia maimaim-poana. Ny karazana Premium (Fanohana Zava-dehibe 115 000 Ar/volana sy Fanohana Mafy 207 000 Ar/volana) dia manampy fanompoana miaraka amin\'ny matihanina.',
        'q3': 'Mety ho antoka ve ny angonao?',
        'a3': 'Eny. Mampiasa fanafody TLS isika, mametraka fotsiny ilaina, tsy mivarotra ny angonao. Jereo ny Lalam-bavaiky fiaraha-miasa ho an\'ny faibeny.',
        'q4': 'Afaka mampiasa Mythenena aho tsy manao kaonty?',
        'a4': 'Eny! Ny fampiasa fototra dia azo atao tsy mila kaonty (fanombanana, forum tsy fantatra, chat IA, fanaovana, boky adiresy). Ny kaonty no hitahiry historicalinao amin\'ny fitaovana hafa.',
        'q5': 'Inona no anjarany ny Fanombanana Anao?',
        'a5': 'Bilan fohy 5 fanontaniana (fihetseham-po, torimaso, tebiteby, fifandraisana, finiavana) hitanao ny endrik\'ny fahasalamanao ary handraisana ho any amin\'ny loharano mety. Tsy diagnosis ara-pitsaboana.',
        'q6': 'Afaka manao fanombanana indray aho?',
        'a6': 'Izao fotoana izao rehetra. Isaky ny fanombanana dia misy daty, afaka asekanao ny fandrosoanao amin\'ny \"Ny famintinako\" (pejy Synthese).',
        'q7': 'Inona no atako raha kely ny isako?',
        'a7': 'Isaky kely dia midika fijaliana. Ny sehatra dia mampitaina: fanaovana aina, chat IA, forum, na fangatahana matihanina. Raha maika, antso +261 20 22 XXX XX.',
        'q8': 'Ahoana no hiditra amin\'ny vondrona miresaka?',
        'a8': 'Mandehana any \"Fihaonambe Fiarahamonina\", safidio vondrona (Faharerahan-tsaina, Fitokisana tena, Fahadiovana), kliky. Miditra ianao amin\'ny torolalana vondrona tsy fantatra. 15 mpikambana isan\'andro.',
        'q9': 'Mba voazava ve ny vondrona?',
        'a9': 'Eny, voazava avy amin\'ny ekipa sy filtre automatique. Fa tsy mamy 24/7. Lazao raha misy zavatra mangalatra. Raha maika, miantso maika.',
        'q10': 'Afaka manao vondrona vao aho?',
        'a10': 'Ny \"Mamorona vondrona vao\" ho avy hoavy. Fa ny vondrona telo voalohany dia ampy ho an\'ny ilain\'ny maro.',
        'q11': 'Mamerina ve ny psikolojia ny IA?',
        'a11': 'Tsy. Fitaovana fihaino sy fanohana 24/24. Mameno loza ary mandraiska ho any amin\'ny maika na matihanina. Tsy manao diagnosis.',
        'q12': 'Mba tsiambaratelo ve ny torolalana amin\'ny IA?',
        'a12': 'Eny, voafanafy sy tsy fantatra ny anarana. Tsy vaky olona na dia loza aza (lalana ara-panantenana mba hiarovana).',
        'q13': 'Miteny malagasy ve ny IA?',
        'a13': 'Eny! Mahay miteny frantsay, malagasy, sy anglisy ny IA. Ovay ny teny amin\'ny menu (glob ikona ambony ankavanana).',
        'q14': 'Inona no ao anatin\'ny Fanohana Zava-dehibe (115 000 Ar/volana)?',
        'a14': 'Ny maimaim-poana rehetra + 1 fanompoana 2 ora isan-kerinandro amin\'ny mpamakafafa mihaino (psikolojia/psykiatri voamarina), fanaraha-maso manokana, azo atsinisyana.',
        'q15': 'Ahoana no fangatahana fotoana amin\'ny matihanina?',
        'a15': 'Avy amin\'ny \"Boky Adiresy\" na afaka safidy karazana Premium, kliky \"Manao fotoana\", ampio ny fotoana azonao sy antony. Ny matihanina no hifandraisana aminao.',
        'q16': 'Ahoana no hadio kaonty?',
        'a16': 'Ny fanaovana hadio kaonty ho avy amin\'ny fikirakirana. Fa azafady miantso amin\'ny pejy Confidentialite mba hangataka fanao (30 andro).',
        'q17': 'Nanadino tenim-pitsipika aho, inona no atako?',
        'a17': 'Ao amin\'ny pejy Fidirana, kliky \"Nanadino tenim-pitsipika\" (ho avy). Hanteraka link hamerina ho any email na SMS.',
        'q18': 'Afaka novaina email/telefaona aho?',
        'a18': 'Eny, ao amin\'ny fikirakirana (ikona engrenage ambony ankavanana > Fidirana > hanova).'
    }
};

with open('D:/Mythenena/web/locales/mg.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('mg.json updated with all new pages')