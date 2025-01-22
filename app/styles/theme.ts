export default {}

export const COLORS = {
  // Main colors
  primary: '#6B46C1',    // More muted purple (was #7C3AED)
  secondary: '#553C9A',  // Darker muted purple (was #6D28D9)
  tertiary: '#000000',   // Pure matte black
  quaternary: '#805AD5', // Slightly lighter muted purple
  accent: '#6B46C1',     // Matching primary
  
  // Base colors
  background: '#000000', // Pure matte black
  white: '#FFFFFF',
  blue: '#62B6CB',
  error: '#FF3B30',
  
  // Text colors
  text: {
    primary: '#FFFFFF',    // White for main text
    secondary: '#9CA3AF',  // Gray for secondary text
    light: '#FFFFFF',      // White text
  },
  
  // Card backgrounds
  card: {
    primary: '#121212',    // Very dark gray
    secondary: '#1A1A1A',  // Slightly lighter dark gray
  },
  
  // Additional colors
  gradient: {
    start: '#6B46C1',
    end: '#553C9A',
  },
  
  border: '#1A1A1A',      // Very dark border
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