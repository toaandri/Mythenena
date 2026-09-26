import { ExpoRoot } from 'expo-router';

// Fallback root entry for monorepo launches from workspace root.
export default function App() {
  const context = require.context('./mobile/app');
  return <ExpoRoot context={context} />;
}
