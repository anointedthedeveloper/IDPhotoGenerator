export const colors = {
  // Core backgrounds
  background: '#F0F4FF',
  backgroundAlt: '#E8EEFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFF',
  surfaceHover: '#F3F6FF',

  // Borders
  border: '#DDE3F0',
  borderLight: '#EBF0FB',
  borderActive: '#4F6EF5',

  // Brand - deep indigo-blue
  primary: '#4F6EF5',
  primaryLight: '#E8EDFF',
  primaryMid: '#C7D2FF',
  primaryDark: '#3451D1',
  primaryGradientStart: '#5B7BFF',
  primaryGradientEnd: '#3451D1',

  // Accent - warm violet
  accent: '#7C5CFC',
  accentLight: '#EDE9FF',

  // Text
  text: '#0F1729',
  textSecondary: '#5C6A8A',
  textTertiary: '#94A3BB',

  // Semantic
  success: '#0EA874',
  successLight: '#D0F5E8',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#E53E3E',
  errorLight: '#FED7D7',

  // Utility
  overlay: 'rgba(15, 23, 41, 0.55)',
  shadow: 'rgba(79, 110, 245, 0.12)',
  shadowDark: 'rgba(15, 23, 41, 0.14)',

  // ID photo backgrounds
  bgWhite: '#FFFFFF',
  bgGray: '#E5E7EB',
  bgBlue: '#DBEAFE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#4F6EF5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F1729',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F1729',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  brand: {
    shadowColor: '#4F6EF5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 23,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 23,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
};
