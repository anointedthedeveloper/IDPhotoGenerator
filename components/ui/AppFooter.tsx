import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export function AppFooter() {
  const openGitHub = () => {
    Linking.openURL('https://github.com/anointedthedeveloper');
  };

  const openAnobyte = () => {
    Linking.openURL('mailto:anointedthedeveloper@gmail.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="code-slash-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.text}>Developed by </Text>
          <TouchableOpacity onPress={openGitHub} style={styles.link} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.linkText}>anointedthedeveloper</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Ionicons name="flash-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.text}>Powered by </Text>
          <TouchableOpacity onPress={openAnobyte} style={styles.link} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.linkText}>Anobyte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  content: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  text: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
