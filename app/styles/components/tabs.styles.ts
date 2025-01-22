import { Platform, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export const tabStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  tabText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text.light,
    fontWeight: '600',
  },
}); 