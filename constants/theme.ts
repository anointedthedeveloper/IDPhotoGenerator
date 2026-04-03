export const colors = {
  background: '#F4F7FB',
  backgroundAlt: '#EEF3FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  surfaceHover: '#F1F5F9',
  border: '#DDE5F0',
  borderLight: '#EEF2F7',
  borderActive: '#4F7CFF',
  primary: '#4F7CFF',
  primaryLight: '#E0E9FF',
  primaryDark: '#365CE0',
  accent: '#7C5CFF',
  accentLight: '#ECE5FF',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  success: '#16A34A',
  successLight: '#DCFCE7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  overlay: 'rgba(15, 23, 42, 0.55)',
  shadow: 'rgba(15, 23, 42, 0.12)',
  
  // Background colors for ID photos
  bgWhite: '#FFFFFF',
  bgGray: '#E5E7EB',
  bgBlue: '#E0E9FF',
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
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};
