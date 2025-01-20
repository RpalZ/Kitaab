import { Platform, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

const TAB_HEIGHT = Platform.OS === 'ios' ? 90 : 60;

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: COLORS.tertiary,
    position: 'relative',
    zIndex: 2,
    paddingBottom: TAB_HEIGHT,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.light,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statBox: {
    backgroundColor: COLORS.card.primary,
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.light,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.light,
    marginTop: 4,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: SPACING.xs,
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.text.light,
    textAlign: 'center',
    fontWeight: FONTS.weights.medium,
  },
  card: {
    backgroundColor: COLORS.card.primary,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  className: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
  },
  classInfo: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  classTeacher: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
}); 