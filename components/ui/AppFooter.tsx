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
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.iconPill}>
            <Ionicons name="code-slash-outline" size={12} color={colors.primaryDark} />
          </View>
          <Text style={styles.text}>Built by </Text>
          <TouchableOpacity onPress={openGitHub} style={styles.link} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.linkText}>anointedthedeveloper</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.iconPill}>
            <Ionicons name="flash-outline" size={12} color={colors.primaryDark} />
          </View>
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
    paddingTop: spacing.lg,
  },
  content: {
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  text: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  iconPill: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
