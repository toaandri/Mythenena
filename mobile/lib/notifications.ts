import * as Device from 'expo-device';
import { Platform } from 'react-native';

type NotificationsModule = {
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  getExpoPushTokenAsync: () => Promise<{ data: string | null }>;
  scheduleNotificationAsync: (options: any) => Promise<string>;
  cancelScheduledNotificationAsync: (identifier: string) => Promise<void>;
  cancelAllScheduledNotificationsAsync: () => Promise<void>;
};

let Notifications: NotificationsModule | null = null;

try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('expo-notifications unavailable in this environment:', error);
}

if (Notifications && Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function initNotifications() {
  try {
    if (Platform.OS === 'web' || !Notifications) {
      return null;
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notifications permission not granted');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    }

    console.warn('Must use physical device for Push Notifications');
    return null;
  } catch (err) {
    console.warn('initNotifications error', err);
    return null;
  }
}

export async function sendImmediateNotification(title: string, body?: string) {
  try {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: body ?? undefined,
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('sendImmediateNotification error', err);
  }
}

export async function scheduleRepeatingNotification(id: string, title: string, body: string, secondsInterval: number) {
  try {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }

    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        seconds: secondsInterval,
        repeats: true,
      },
    });
  } catch (err) {
    console.warn('scheduleRepeatingNotification error', err);
  }
}

export async function cancelAllScheduledNotifications() {
  try {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('cancelAllScheduledNotifications error', err);
  }
}
