export default {}

export const COLORS = {
  // Main colors
  primary: '#2A4365',    // Deep blue
  secondary: '#4299E1',  // Bright blue
  tertiary: '#EBF8FF',   // Light blue background
  accent: '#ED8936',     // Orange accent for important actions
  
  // Base colors
  white: '#FFFFFF',
  background: '#F7FAFC',
  
  // Text colors
  text: {
    primary: '#1A365D',    // Dark blue for main text
    secondary: '#4A5568',  // Gray for secondary text
    light: '#FFFFFF',      // White text
  },
  
  // UI elements
  border: '#E2E8F0',
  success: '#48BB78',    // Green for success states
  error: '#F56565',      // Red for error states
  warning: '#ECC94B',    // Yellow for warnings
  
  // Card backgrounds
  card: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
  },
};

export const SPACING = {
  xs: 8,
  sm: 15,
  md: 20,
  lg: 40,
  xl: 50,
};

export const FONTS = {
  sizes: {
    xs: 12,
    sm: 16,
    md: 18,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "bold" as const,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}; 