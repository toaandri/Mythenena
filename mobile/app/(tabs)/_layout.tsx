import { Redirect, Tabs, useGlobalSearchParams, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Text } from '@/components/OutfitText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import MythenenaLogo from '@/components/MythenenaLogo';

export default function TabLayout() {
  const { t } = useI18n();
  const { session, loading, onboardingComplete } = useSession();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const params = useGlobalSearchParams<{ thread?: string | string[] }>();
  const activeTab = segments[segments.length - 1];
  const isInMessageThread = typeof params.thread === 'string' && params.thread.length > 0;
  const hideLanguageSwitcher = activeTab === 'chat' || activeTab === 'annuaire';
  const hideAppName = activeTab === 'chat' || (activeTab === 'annuaire' && isInMessageThread);
  const showHomeTopControls = activeTab === '(tabs)';
  const showSettingsTrigger = showHomeTopControls;

  if (loading || (session && onboardingComplete === null)) return <View style={{ flex: 1, backgroundColor: '#f8f6f0', justifyContent: 'center' }}><ActivityIndicator color="#276653" /></View>;
  if (session && onboardingComplete === false) return <Redirect href="/onboarding" />;

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#276653',
          tabBarInactiveTintColor: '#63756c',
          tabBarShowLabel: true,
          headerShown: false,
          tabBarBackground: () => (
            <BlurView
              intensity={92}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: Math.max(insets.bottom, 10),
            height: 64,
            paddingBottom: 7,
            paddingTop: 7,
            borderRadius: 32,
            borderTopWidth: 0,
            backgroundColor: Platform.OS === 'android' ? '#ffffffdd' : 'transparent',
            elevation: 0,
            shadowColor: '#1f2f2a',
            shadowOffset: { width: 0, height: 7 },
            shadowOpacity: 0.1,
            shadowRadius: 14,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: -1,
          },
          tabBarItemStyle: {
            borderRadius: 22,
            marginHorizontal: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tab.home'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'heart' : 'heart-outline'}
                size={17}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: t('tab.assistant'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={17}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="annuaire"
          options={{
            title: t('tab.messages'),
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconWithBadge}>
                <Ionicons
                  name={focused ? 'chatbox' : 'chatbox-outline'}
                  size={17}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="psy"
          options={{
            title: t('tab.psy'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'medkit' : 'medkit-outline'}
                size={17}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ressources"
          options={{
            title: t('tab.resources'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'book' : 'book-outline'}
                size={17}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="forum"
          options={{
            title: t('tab.forum'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={17}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      {!hideAppName && (
        <View pointerEvents="none" style={[styles.brandContainer, { top: insets.top + 8 }]}> 
          <MythenenaLogo size={25} />
          <Text style={styles.brandText}>MYTHENENA</Text>
        </View>
      )}
      {!hideLanguageSwitcher && (
        <LanguageSwitcher
          showSettingsTrigger={showSettingsTrigger}
          topOffset={hideAppName ? 8 : 38}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: '#f8f6f0',
  },
  brandContainer: {
    position: 'absolute',
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 1,
    opacity: 0.72,
  },
  brandLogo: {
    width: 25,
    height: 25,
    borderRadius: 7,
  },
  brandText: {
    color: '#276653',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  iconWithBadge: {
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -7,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 10,
  },
});
