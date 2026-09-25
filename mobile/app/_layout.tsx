import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="questionnaire/index" options={{ title: "Mini-sondage" }} />
      <Stack.Screen name="questionnaire/adaptatif" options={{ title: "Questionnaire" }} />
      <Stack.Screen name="synthese" options={{ title: "Ma synthèse" }} />
    </Stack>
  );
}
