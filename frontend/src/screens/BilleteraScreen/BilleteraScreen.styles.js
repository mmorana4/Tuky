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
  headerHelp: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card saldo
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 160,
  },
  balanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    ...typography.caption,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  balanceScanner: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  balanceCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  balanceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceVerDetalles: {
    backgroundColor: '#1A2021',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  balanceVerDetallesText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Botones Recargar / Métodos
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionButtonIconRecargar: {
    backgroundColor: colors.primary,
  },
  actionButtonIconMetodos: {
    backgroundColor: '#1A2021',
  },
  actionButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  // Actividad reciente
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.text,
  },
  verTodoLink: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  transactionList: {
    marginHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  transactionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionIconNegative: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  transactionIconPositive: {
    backgroundColor: 'rgba(13, 242, 204, 0.2)',
  },
  transactionContent: {
    flex: 1,
  },
  transactionDesc: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
  },
  transactionAmount: {
    ...typography.subtitle,
    fontSize: 16,
    fontWeight: '700',
  },
  transactionAmountNegative: {
    color: colors.text,
  },
  transactionAmountPositive: {
    color: colors.primary,
  },
});
