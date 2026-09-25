import { View, Text } from "react-native";
import type { SafetyAlert } from "../../shared/types/chat";

// Bandeau d'alerte sécurité — affiché quand un signal de détresse est détecté
// Props: alert (SafetyAlert)
// TODO: afficher le message + boutons d'appel vers les ressources d'urgence
export default function SafetyBanner({ alert }: { alert?: SafetyAlert }) {
  if (!alert) return null;
  return (
    <View>
      <Text>{alert.message}</Text>
    </View>
  );
}
