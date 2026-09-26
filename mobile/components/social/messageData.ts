export type ThreadId = 'marie' | 'thomas' | 'sophie' | 'forum';

export type Thread = {
  id: ThreadId;
  name: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
  color: string;
  participants: string[];
  messages: { author: string; text: string }[];
};

export const conversations: Thread[] = [
  {
    id: 'marie',
    name: 'Marie D.',
    role: 'Thérapeute référente',
    preview: 'Continuons sur cette lancée la semaine prochaine.',
    time: '10:42',
    unread: 2,
    color: '#44665d',
    participants: ['Marie', 'Vous'],
    messages: [
      { author: 'Marie D.', text: 'Bonjour, comment vous sentez-vous aujourd’hui ?' },
      { author: 'Vous', text: 'Un peu fatigué mais plus calme.' },
      { author: 'Marie D.', text: 'Continuons sur cette lancée la semaine prochaine.' },
    ],
  },
  {
    id: 'thomas',
    name: 'Thomas R.',
    role: 'Groupe confiance en soi',
    preview: 'Merci pour votre écoute.',
    time: 'Hier',
    unread: 0,
    color: '#2f506b',
    participants: ['Thomas', 'Vous', 'Aina'],
    messages: [
      { author: 'Thomas R.', text: 'On essaie tous d’avancer un pas à la fois.' },
      { author: 'Vous', text: 'Merci pour votre écoute.' },
    ],
  },
  {
    id: 'sophie',
    name: 'Sophie L.',
    role: 'Intervenante',
    preview: 'Votre rendez-vous est confirmé.',
    time: 'Lun.',
    unread: 1,
    color: '#806279',
    participants: ['Sophie', 'Vous'],
    messages: [
      { author: 'Sophie L.', text: 'Votre rendez-vous est confirmé.' },
      { author: 'Vous', text: 'Parfait, merci.' },
    ],
  },
];

export const forumConversation: Thread = {
  id: 'forum',
  name: 'Forum groupe',
  role: 'Nouvelle discussion',
  preview: 'Une nouvelle discussion a été ajoutée depuis le forum.',
  time: 'À l’instant',
  unread: 1,
  color: '#276653',
  participants: ['Aina', 'Thomas', 'Lova', 'Vous'],
  messages: [
    { author: 'Aina', text: 'Bienvenue dans le groupe. On partage nos idées ici.' },
    { author: 'Thomas', text: 'J’ai commencé à noter ce qui m’apaise le soir.' },
    { author: 'Vous', text: 'Je rejoins la discussion.' },
  ],
};

