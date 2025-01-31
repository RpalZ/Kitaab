export default {}

export const COLORS = {
  // Main colors
  primary: '#A78BFA',    // Soft purple accent for important elements
  secondary: '#8B5CF6',  // Slightly darker purple for secondary actions
  tertiary: '#13111C',   // Dark background with purple tint
  quaternary: '#907AD6', // Additional purple shade if needed
  accent: '#A78BFA',     // Matching primary for consistency
  
  
  // Base colors
  background: '#0E0C15', // Main dark background with subtle purple tint
  white: '#FFFFFF',
  blue: '#62B6CB',
  error: '#EF4444',      // Red for errors
  warning: '#fcd703',    // yellow for warning
  success: '#10B981',    // Green for success states
  
  // Text colors
  text: {
    primary: '#FFFFFF',   // White for primary text
    secondary: '#9CA3AF', // Neutral gray for secondary text
    light: '#FFFFFF',     // White text for dark backgrounds
  },
  
  // Card backgrounds
  card: {
    primary: '#171522',   // Slightly lighter with purple undertone
    secondary: '#1E1B2C', // Even lighter with purple undertone
  },
  
  border: '#231F35',      // Subtle purple-tinted border
  
  // Additional colors for specific uses
  gradient: {
    start: '#A78BFA',
    end: '#8B5CF6',
  },
  
  shadow: {
    color: '#000000',
    opacity: 0.2,
  }
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