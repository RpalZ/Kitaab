export default {}

export const COLORS = {
  // Main colors
  primary: '#1A1A1A',    // Almost black
  secondary: '#2D2D2D',  // Dark gray
  tertiary: '#121212',   // Dark background
  accent: '#007AFF',     // Professional blue for important actions
  
  // Base colors
  white: '#FFFFFF',
  background: '#121212',
  blue: '#62B6CB',
  
  // Text colors
  text: {
    primary: '#FFFFFF',    // White for main text
    secondary: '#A0A0A0',  // Light gray for secondary text
    light: '#FFFFFF',      // White text
  },
  
  // UI elements
  border: '#333333',
  success: '#00C853',    // Professional green
  error: '#FF3B30',      // Professional red
  warning: '#FF9500',    // Professional orange
  
  // Card backgrounds
  card: {
    primary: '#1F1F1F',    // Slightly lighter than background
    secondary: '#2D2D2D',  // Even lighter for contrast
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