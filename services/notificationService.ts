import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

// We now primarily use in-app notifications (InAppNotification.tsx)
// This is kept as a fallback for background notifications only
export const scheduleGenerationCompleteNotification = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('id-photo-complete', {
        name: 'Photo Generation',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
        enableVibrate: true,
        showBadge: false,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ID Photo Ready!',
        body: 'Your professional ID photo has been generated successfully.',
        data: { screen: 'results' },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'id-photo-complete' }),
      },
      trigger: null,
    });
  } catch (err) {
    console.error('Notification error:', err);
  }
};
