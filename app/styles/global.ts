import { Platform, StyleSheet } from 'react-native';
import { COLORS } from './theme';

export const globalStyles = StyleSheet.create({
  scrollViewStyle: {
    ...(Platform.OS === 'web' ? {
      scrollbarWidth: 'thin',
      scrollbarColor: `${COLORS.scrollbar.thumb} ${COLORS.scrollbar.track}`,
    } : {}),
  }
});

// For web platforms, we need to inject CSS
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${COLORS.scrollbar.track};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${COLORS.scrollbar.thumb};
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${COLORS.scrollbar.thumbHover};
    }
  `;
  document.head.appendChild(style);
} 