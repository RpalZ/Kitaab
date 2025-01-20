import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.tertiary,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.light,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    gap: SPACING.sm,
    backgroundColor: COLORS.card.primary,
    padding: SPACING.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    borderRadius: 10,
    fontSize: FONTS.sizes.sm,
    backgroundColor: COLORS.white,
  },
  button: {
    padding: SPACING.sm,
    borderRadius: 10,
    marginTop: SPACING.md,
    backgroundColor: COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.text.light,
    textAlign: 'center',
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.md,
    padding: SPACING.sm,
    zIndex: 1,
  },
}); 