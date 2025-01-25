import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../styles/theme';

type SignOutModalProps = {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function SignOutModal({ visible, onClose, onSignOut }: SignOutModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Sign Out</Text>
          <Text style={styles.modalText}>
            Are you sure you want to sign out?
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={onSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: COLORS.card.primary,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  modalText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    borderRadius: 12,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.card.secondary,
  },
  signOutButton: {
    backgroundColor: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  signOutButtonText: {
    color: COLORS.text.light,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
}); 