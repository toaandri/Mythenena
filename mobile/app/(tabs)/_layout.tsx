import { Tabs, useGlobalSearchParams, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';

export default function TabLayout() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const params = useGlobalSearchParams<{ thread?: string | string[] }>();
  const unreadMessagesCount = 3;
  const activeTab = segments[segments.length - 1];
  const isInMessageThread = typeof params.thread === 'string' && params.thread.length > 0;
  const hideLanguageSwitcher = activeTab === 'chat' || activeTab === 'annuaire';
  const hideAppName = activeTab === 'chat' || (activeTab === 'annuaire' && isInMessageThread);
  const showHomeTopControls = activeTab === '(tabs)';
  const showPremiumTrigger = showHomeTopControls;
  const showSettingsTrigger = showHomeTopControls;

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2d9c86',
          tabBarInactiveTintColor: '#8b9591',
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
            bottom: 10,
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
                {unreadMessagesCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</Text>
                  </View>
                )}
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
          <Text style={styles.brandText}>MYTHENENA</Text>
        </View>
      )}
      {!hideLanguageSwitcher && (
        <LanguageSwitcher
          showPremiumTrigger={showPremiumTrigger}
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
  },
  brandContainer: {
    position: 'absolute',
    right: 10,
    zIndex: 1,
    opacity: 0.26,
  },
  brandText: {
    color: '#2d9c86',
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