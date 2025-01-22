import { Platform, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
    padding: SPACING.sm,
    paddingTop: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
  },
  scrollView: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 90 : 60, 
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  SearchBar: {
    color: COLORS.white,
  },
  resourceButton: {
    color: COLORS.text.light,
    textAlign: 'center',
    fontWeight: FONTS.weights.medium,
    backgroundColor: COLORS.secondary,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textStyle: {
    color: COLORS.text.secondary,
  },
  titleTextStyle: {
  color: COLORS.white,
  fontSize: FONTS.sizes.lg
  }, 
  addButton: {
    backgroundColor: "#9d4edd",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    width: "80%",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#6200ea",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6200ea",
    fontSize: 16,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fileNameText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 12,
  },
  filePickerText: {
    marginLeft: 8,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
  },
  resourceContainer: {
    position: 'relative',
    marginBottom: 10,
  },
}); 