/**
 * Tema global Tuky - paletas oscuro y claro, acento #0df2cc
 */
export const darkColors = {
  background: '#1A2021',
  backgroundSecondary: '#2C3A3D',
  surface: '#252D2E',
  primary: '#0df2cc',
  primaryDark: '#0bc4a8',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#888888',
  placeholder: '#6B7B7C',
  border: '#3D4A4C',
  borderLight: 'rgba(13, 242, 204, 0.4)',
  iconActive: '#0df2cc',
  iconInactive: '#FFFFFF',
  danger: '#F44336',
};

export const lightColors = {
  background: '#F5F5F5',
  backgroundSecondary: '#FFFFFF',
  surface: '#EEEEEE',
  primary: '#0df2cc',
  primaryDark: '#0bc4a8',
  text: '#1A2021',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  placeholder: '#A0AEC0',
  border: '#E2E8F0',
  borderLight: 'rgba(13, 242, 204, 0.5)',
  iconActive: '#0df2cc',
  iconInactive: '#1A2021',
  danger: '#F44336',
};

/** @deprecated Usar useTheme() o darkColors/lightColors según contexto */
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};

export default { colors, spacing, borderRadius, typography };
