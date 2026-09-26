import type { Language } from './i18n';
const fr = {
  eyebrow: 'Le lien fait du bien', title: 'Chacun son chemin.\nEnsemble, un peu plus loin.', confidence: 'Confiance en soi', emotions: 'Moral & émotions', community: 'Un espace pour partager', communityNote: 'À votre rythme, sous pseudonyme', quote: 'Un message, une pensée, une petite victoire : vous pouvez la partager ici.', support: 'Partager dans le forum', join: 'Rejoindre les échanges', checkin: 'Et vous, comment ça va ?', privateTitle: 'Un espace rien que pour vous', privateNote: 'Discuter avec l’assistant IA', pause: 'Faire une pause', pauseNote: 'Des ressources à votre rythme',
  welcome: 'Faisons connaissance', intro: '5 questions facultatives pour faire le point. Vos réponses restent sur cet appareil et ne sont pas envoyées à l’IA.', skipAll: 'Tout passer', skip: 'Passer cette question', next: 'Continuer', finish: 'Accéder à l’accueil', back: 'Précédent', question: 'Question', of: 'sur', error: 'Impossible d’enregistrer. Réessayez.',
  questions: [
    { title: 'Comment vous sentez-vous aujourd’hui ?', options: ['Bien', 'Ça dépend des moments', 'Le moral est bas', 'Je ne sais pas encore'] },
    { title: 'Qu’aimeriez-vous trouver ici ?', options: ['Un espace pour parler', 'Des échanges avec les autres', 'Des exercices pour souffler', 'Un accompagnement humain'] },
    { title: 'Quel sujet vous intéresse le plus ?', options: ['La confiance en soi', 'Le stress et les émotions', 'Les habitudes et les addictions', 'Je préfère découvrir'] },
    { title: 'Comment préférez-vous vous exprimer ?', options: ['En écrivant', 'Avec la voix', 'Les deux me conviennent', 'Je préfère lire pour commencer'] },
    { title: 'À quel rythme souhaitez-vous avancer ?', options: ['Quelques minutes par jour', 'Quelques fois par semaine', 'Quand j’en ressens le besoin', 'Sans rythme défini'] },
  ],
};
const en: typeof fr = {
  eyebrow: 'Connection feels good', title: 'Your own path.\nA little further, together.', confidence: 'Self-confidence', emotions: 'Mood & emotions', community: 'A space to share', communityNote: 'At your pace, under a pseudonym', quote: 'A thought, a message, a small win: you can share it here.', support: 'Share in the forum', join: 'Join the conversations', checkin: 'And you, how are you?', privateTitle: 'A space just for you', privateNote: 'Talk with the AI assistant', pause: 'Take a pause', pauseNote: 'Resources at your pace',
  welcome: 'Let’s get to know you', intro: '5 optional questions to check in. Answers stay on this device and are not sent to the AI.', skipAll: 'Skip all', skip: 'Skip this question', next: 'Continue', finish: 'Go to home', back: 'Back', question: 'Question', of: 'of', error: 'Could not save. Please try again.',
  questions: [
    { title: 'How are you feeling today?', options: ['Good', 'It depends on the moment', 'Feeling low', 'I’m not sure yet'] },
    { title: 'What would you like to find here?', options: ['A space to talk', 'Conversations with others', 'Exercises to unwind', 'Human support'] },
    { title: 'What interests you most?', options: ['Self-confidence', 'Stress and emotions', 'Habits and addictions', 'I’d rather explore'] },
    { title: 'How do you prefer to express yourself?', options: ['Writing', 'Speaking', 'Either works for me', 'I’d rather read first'] },
    { title: 'What pace would suit you?', options: ['A few minutes a day', 'A few times a week', 'When I feel the need', 'No set pace'] },
  ],
};
const mg: typeof fr = {
  eyebrow: 'Mahasoa ny fifandraisana', title: 'Samy manana ny lalany.\nMandroso miaraka.', confidence: 'Fahatokisan-tena', emotions: 'Toe-po sy fihetseham-po', community: 'Toerana hifampizarana', communityNote: 'Araka izay mety aminao, amin’ny solonanarana', quote: 'Hevitra, hafatra na fandresena kely: azonao zaraina eto.', support: 'Hizara ao amin’ny forum', join: 'Handray anjara amin’ny fifanakalozana', checkin: 'Ary ianao, manao ahoana?', privateTitle: 'Toerana ho anao manokana', privateNote: 'Hiresaka amin’ny mpanampy IA', pause: 'Haka aina', pauseNote: 'Loharano araka izay mety aminao',
  welcome: 'Andao hifankafantatra', intro: 'Fanontaniana 5 tsy voatery valiana. Mijanona eto amin’ity fitaovana ity ny valiny ary tsy alefa amin’ny IA.', skipAll: 'Handalo azy rehetra', skip: 'Handalo ity fanontaniana ity', next: 'Hanohy', finish: 'Ho any amin’ny fandraisana', back: 'Hiverina', question: 'Fanontaniana', of: 'amin’ny', error: 'Tsy voatahiry. Andramo indray.',
  questions: [
    { title: 'Manao ahoana ny fihetseham-ponao androany?', options: ['Tsara', 'Miovaova', 'Kivy', 'Mbola tsy fantatro'] },
    { title: 'Inona no tadiavinao eto?', options: ['Toerana hiresahana', 'Fifanakalozana amin’ny hafa', 'Fanazaran-tena hakana aina', 'Fanampian’olona'] },
    { title: 'Inona no lohahevitra mahaliana anao?', options: ['Fahatokisan-tena', 'Adin-tsaina sy fihetseham-po', 'Fahazarana sy fiankinan-doha', 'Hijery aloha aho'] },
    { title: 'Ahoana no tianao hanehoana ny hevitrao?', options: ['An-tsoratra', 'Amin’ny feo', 'Samy mety amiko', 'Hamaky aloha aho'] },
    { title: 'Amin’ny fotoana ahoana no tianao handrosoana?', options: ['Minitra vitsy isan’andro', 'Indraindray isan-kerinandro', 'Rehefa mila izany aho', 'Tsy misy fotoana voafaritra'] },
  ],
};
export const welcomeCopy: Record<Language, typeof fr> = { fr, en, mg };
