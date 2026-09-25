import { TouchableOpacity, Text } from "react-native";

// Bouton "Quitter rapidement" — ferme l'app discrètement
// Doit être visible mais discret, accessible depuis tous les écrans sensibles
// TODO: utiliser expo-router pour naviguer vers une page neutre ou minimiser l'app
export default function PanicButton() {
  return (
    <TouchableOpacity>
      <Text>✕ Quitter</Text>
    </TouchableOpacity>
  );
}
