// Theme configuration for the application
// This provides consistent colors, gradients, and styling options

export const colors = {
  // Primary brand colors
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  
  // Secondary brand colors
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  
  // Accent colors
  accent: {
    blue: {
      light: '#93c5fd',
      default: '#3b82f6',
      dark: '#1d4ed8',
    },
    teal: {
      light: '#5eead4',
      default: '#14b8a6',
      dark: '#0f766e',
    },
    amber: {
      light: '#fcd34d',
      default: '#f59e0b',
      dark: '#b45309',
    },
    rose: {
      light: '#fda4af',
      default: '#f43f5e',
      dark: '#be123c',
    },
  },
  
  // Semantic colors
  semantic: {
    success: {
      light: '#86efac',
      default: '#22c55e',
      dark: '#15803d',
    },
    warning: {
      light: '#fed7aa',
      default: '#f97316',
      dark: '#c2410c',
    },
    error: {
      light: '#fca5a5',
      default: '#ef4444',
      dark: '#b91c1c',
    },
    info: {
      light: '#a5b4fc',
      default: '#6366f1',
      dark: '#4338ca',
    },
  },
  
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
};

// Gradient presets
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[700]} 100%)`,
  blueViolet: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`,
  greenTeal: `linear-gradient(135deg, #10b981 0%, #0d9488 100%)`,
  orangeRed: `linear-gradient(135deg, #f97316 0%, #ef4444 100%)`,
  pinkPurple: `linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)`,
  grayBlue: `linear-gradient(135deg, #64748b 0%, #475569 100%)`,
};

// Shadow styles
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  colored: '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)',
};

// Border radius presets
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Typography styles
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
};

// Animation durations
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
};

// Spacing system
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
}; 