import { Platform, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

const TAB_HEIGHT = Platform.OS === 'ios' ? 80 : 60;

export const profileStyles = StyleSheet.create({
  container: {
    
    flex: 1,
    backgroundColor: COLORS.tertiary,
    paddingBottom: TAB_HEIGHT,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios'? SPACING.xl + 10 : SPACING.lg,
    alignItems: 'center',
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.text.light,
    fontWeight: FONTS.weights.bold,
  },
  emailText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.light,
    marginTop: SPACING.xs,
  },
  section: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  signOutButton: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: COLORS.text.light,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
}); 