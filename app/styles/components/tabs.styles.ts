import { Platform, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

export const tabStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.sm,
    paddingInline: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.text.light,
    fontWeight: FONTS.weights.semibold,
  },
}); 