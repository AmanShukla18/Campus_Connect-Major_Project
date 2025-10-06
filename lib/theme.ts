// New file: lib/theme.ts
export const lightTheme = {
  colors: {
    primary: '#3366FF',
    onPrimary: '#FFFFFF',
    surface: '#F7F9FC',
    onSurface: '#0B1220',
    surfaceVariant: '#EDF2FF',
    onSurfaceVariant: '#6B7280',
    outline: '#D1D5DB',
    error: '#FF4D4F'
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16
  },
  typography: {
    title: 18,
    subtitle: 15,
    body: 14,
    caption: 12
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#4F7CFF',
    onPrimary: '#0B1220',
    surface: '#0B1220',
    onSurface: '#F7F9FC',
    surfaceVariant: '#0F1724',
    onSurfaceVariant: '#9CA3AF',
    outline: '#1F2937',
    error: '#FF6B6B'
  }
};

export default lightTheme;