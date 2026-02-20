import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header de navegación
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.text,
  },

  // Perfil header (avatar, nombre, membresía)
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  ratingText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  profileName: {
    ...typography.title,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  membershipLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
  },

  // Selector de modo (cápsula)
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  modeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  modeOptionActive: {
    backgroundColor: colors.primary,
  },
  modeOptionInactive: {},
  modeOptionText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  modeOptionTextActive: {
    color: colors.text,
    fontWeight: '600',
  },

  // Estadísticas
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.title,
    fontSize: 26,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },

  // Secciones de menú
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  menuCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconWrap: {
    width: 36,
    alignItems: 'center',
  },
  menuIconHelp: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.md,
  },
  menuTextDanger: {
    color: colors.danger,
  },
  menuChevron: {
    color: colors.textMuted,
  },
  logoutIconWrap: {
    width: 36,
    alignItems: 'center',
  },
  logoutIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomPadding: {
    height: spacing.xl,
  },
});
