import { StyleSheet } from 'react-native';
import { spacing, borderRadius, typography } from '../../styles/theme';

export function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: colors.background,
    },
    headerBack: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...typography.title,
      fontSize: 20,
      color: colors.text,
      marginLeft: spacing.md,
    },
    sectionLabel: {
      ...typography.caption,
      color: colors.textMuted,
      letterSpacing: 1,
      marginLeft: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    card: {
      marginHorizontal: spacing.lg,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    optionContent: { flex: 1 },
    optionTitle: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionSubtitle: {
      ...typography.caption,
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    checkWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#0df2cc',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomPadding: { paddingBottom: spacing.xl },
  });
}
