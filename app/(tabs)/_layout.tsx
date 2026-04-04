import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          height: Platform.select({ ios: insets.bottom + 68, android: insets.bottom + 68, default: 72 }),
          paddingTop: spacing.sm,
          paddingBottom: Platform.select({ ios: insets.bottom + 10, android: insets.bottom + 10, default: spacing.sm }),
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          ...shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? tabStyles.activeIconWrap : null}>
              <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={26} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'images' : 'images-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = {
  activeIconWrap: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    padding: 2,
  },
};
