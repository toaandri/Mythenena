import { useI18n } from './i18n';
const copy = {
  messages: ['Vos échanges, tout simplement.', 'Your conversations, made simple.', 'Mifanakalo amim-pahatsorana.'],
  care: ['Une personne pour vous écouter.', 'Someone to listen to you.', 'Olona iray hihaino anao.'],
  forum: ['Un espace pour se retrouver.', 'A space to connect.', 'Sehatra hifampizarana.'],
  all: ['Tous', 'All', 'Rehetra'], unread: ['Non lus', 'Unread', 'Tsy voavaky'],
  back: ['← Retour', '← Back', '← Hiverina'],
  demo: ['Démonstration : ces échanges restent sur cet écran et ne sont pas transmis.', 'Demo: these messages stay on this screen and are not delivered.', 'Fanandramana: eto ihany ireo hafatra ireo, tsy alefa.'],
  write: ['Écrivez votre message…', 'Write your message…', 'Soraty ny hafatrao…'],
  send: ['Envoyer', 'Send', 'Alefa'],
  empty: ['Aucun résultat pour le moment.', 'No results yet.', 'Tsy mbola misy valiny.'],
  profile: ['Découvrir le profil →', 'View profile →', 'Hijery ny mombamomba →'],
  languages: ['Langues', 'Languages', 'Fiteny'],
  specialty: ['Spécialités', 'Specialties', 'Sehatra iasana'],
  location: ['Lieu', 'Location', 'Toerana'],
  about: ['À propos', 'About', 'Mombamomba'],
  contact: ['Écrire un premier message', 'Write a first message', 'Hanoratra hafatra voalohany'],
  request: ['Enregistrer ma demande', 'Submit my request', 'Handefa ny fangatahako'],
  saved: ['Votre demande est enregistrée.', 'Your request has been recorded.', 'Voaray ny fangatahanao.'],
  terms: ['Tarif, format et disponibilités à préciser avant toute séance.', 'Confirm fees, format and availability before any session.', 'Hamarino ny sarany, ny endrika ary ny fotoana alohan’ny fihaonana.'],
  share: ['Partager quelque chose', 'Share something', 'Hizara zavatra'],
  together: ['Un mot, une expérience, un petit pas. Ici, chacun avance à son rythme.', 'A thought, an experience, a small step. Everyone moves at their own pace.', 'Teny, traikefa, dingana kely. Samy mandroso araka ny vitany.'],
  publish: ['Publier', 'Publish', 'Hamoaka'],
  cancel: ['Annuler', 'Cancel', 'Ajanona'],
  support: ['Soutenir', 'Support', 'Manohana'],
  replies: ['Réponses', 'Replies', 'Valiny'],
  reply: ['Répondre', 'Reply', 'Hamaly'],
  rules: ['Les règles de cet espace', 'Community guidelines', 'Fitsipiky ny sehatra'],
  respect: ['Écouter sans juger. Respecter le vécu de chacun. Préserver les informations personnelles. Signaler les contenus dangereux ou les violences.', 'Listen without judgement. Respect others’ experiences. Protect personal information. Report dangerous or abusive content.', 'Mihainoa tsy mitsara. Hajao ny traikefan’ny hafa. Arovy ny mombamomba manokana. Ampahafantaro ny votoaty mampidi-doza na mahery setra.'],
  report: ['Signaler', 'Report', 'Hampandre'],
  reason: ['Décrivez le problème…', 'Describe the issue…', 'Farito ny olana…'],
  reported: ['Signalement transmis à la modération.', 'Report sent to moderators.', 'Nalefa amin’ny mpandrindra ny tatitra.'],
  retry: ['Réessayer', 'Retry', 'Andramo indray'],
  error: ['Le service est indisponible. Réessayez dans un instant.', 'Service unavailable. Please try again shortly.', 'Tsy afaka ampiasaina izao. Andramo indray afaka fotoana fohy.'],
} as const;
export function useSocialCopy() {
  const { language } = useI18n();
  return (key: keyof typeof copy) => copy[key][language === 'en' ? 1 : language === 'mg' ? 2 : 0];
}
