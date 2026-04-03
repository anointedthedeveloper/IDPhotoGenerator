import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { PhotoLibraryProvider } from '@/contexts/PhotoLibraryContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AlertProvider>
        <PhotoLibraryProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </PhotoLibraryProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
