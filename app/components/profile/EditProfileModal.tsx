import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { COLORS, FONTS, SPACING } from '../../styles/theme';
import { getAuth } from 'firebase/auth';


type EditProfileModalProps = {
    visible: boolean;
    onSave: (name: string, email: string) => void;
    onClose: () => void;
    initialName?: string;
    initialEmail?: string;
  };

export function EditProfileModal({ visible, onSave, onClose, initialName = '', initialEmail = ''  }: EditProfileModalProps) {
    
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail)

    const handleSubmit = () => {
        onSave(name, email);
      };


  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
        <View style={styles.centeredView}>
        <View style={styles.modalView}>

        <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalText}>Name</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.modalText}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />


            <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.signOutButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.signOutButtonText}>Apply</Text>
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
        marginBottom: SPACING.sm,
        textAlign: 'center',
      },
      input: {
        borderWidth: 1.5,
        borderColor: COLORS.quaternary,
        padding: SPACING.sm,
        borderRadius: 10,
        fontSize: FONTS.sizes.sm,
        backgroundColor: COLORS.white,
        marginBottom:SPACING.sm,
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
})