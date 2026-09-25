import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Navigation principale par onglets
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6BAF8D", // vert apaisant — à ajuster selon le design
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Écoute IA",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="annuaire"
        options={{
          title: "Annuaire",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ressources"
        options={{
          title: "Ressources",
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
