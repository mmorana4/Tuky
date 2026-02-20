import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerPlaceholder: {
    width: 40,
  },

  // Secciones
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(13, 242, 204, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardChevron: {
    color: colors.textMuted,
  },
  toggleWrap: {
    padding: 2,
  },

  // Zona de peligro
  dangerCard: {
    backgroundColor: 'rgba(139, 69, 69, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  dangerIconWrap: {
    backgroundColor: 'rgba(244, 67, 54, 0.25)',
  },
  dangerTitle: {
    color: colors.danger,
    fontWeight: '600',
  },
  dangerSubtitle: {
    color: colors.textMuted,
  },

  bottomPadding: {
    paddingBottom: spacing.xl,
  },
});
