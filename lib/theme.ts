// Lokolo Brand Theme Configuration
// Change colors, fonts, and styles here - they'll apply across the entire app

export const theme = {
  // Brand Colors (from your logo)
  colors: {
    // Primary - Orange/Rust (from logo background)
    primary: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',  // Main orange
      600: '#EA580C',
      700: '#C2410C',  // Darker orange from logo
      800: '#9A3412',
      900: '#7C2D12',
    },
    
    // Secondary - Yellow/Gold (from logo text and pin)
    secondary: {
      50: '#FEFCE8',
      100: '#FEF9C3',
      200: '#FEF08A',
      300: '#FDE047',
      400: '#FACC15',
      500: '#EAB308',  // Main yellow
      600: '#CA8A04',
      700: '#A16207',
      800: '#854D0E',
      900: '#713F12',
    },
    
    // Accent - Teal/Green (from logo pin center)
    accent: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',  // Main teal
      600: '#0D9488',
      700: '#0F766E',  // Logo pin center
      800: '#115E59',
      900: '#134E4A',
    },
    
    // Neutral Colors
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Typography
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

// Helper function to get color value
export const getColor = (colorPath: string): string => {
  const parts = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const part of parts) {
    value = value[part];
  }
  
  return value as string;
};

// Quick access to common colors
export const brandColors = {
  primary: theme.colors.primary[500],      // Orange
  primaryDark: theme.colors.primary[700],  // Darker orange
  secondary: theme.colors.secondary[500],  // Yellow
  accent: theme.colors.accent[700],        // Teal
  background: theme.colors.gray[50],
  text: theme.colors.gray[900],
  textLight: theme.colors.gray[600],
};

// Gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',       // Orange gradient
  secondary: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',     // Yellow gradient
  hero: 'linear-gradient(135deg, #C2410C 0%, #F97316 50%, #FACC15 100%)', // Full brand gradient
  background: 'linear-gradient(to bottom right, #FFF7ED, #FEFCE8)',   // Soft gradient for backgrounds
};

export default theme;
