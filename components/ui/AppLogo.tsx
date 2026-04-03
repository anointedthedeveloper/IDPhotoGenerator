import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZE_MAP = {
  sm: { icon: 28, title: 16, gap: spacing.sm },
  md: { icon: 36, title: 20, gap: spacing.md },
  lg: { icon: 48, title: 26, gap: spacing.md },
};

interface AppLogoProps {
  size?: LogoSize;
}

export function AppLogo({ size = 'md' }: AppLogoProps) {
  const s = SIZE_MAP[size];
  return (
    <View style={[styles.container, { gap: s.gap }]}>
      <View style={[styles.iconBox, { width: s.icon, height: s.icon, borderRadius: borderRadius.sm }]}>
        <Image
          source={require('@/assets/logo.png')}
          style={{ width: s.icon, height: s.icon, borderRadius: borderRadius.sm }}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.title, { fontSize: s.title }]}>IDPhoto AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    fontWeight: '700',
  },
});
