import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { updatePassword } from 'firebase/auth';
import { COLORS } from '../../styles/theme';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) throw new Error('No user logged in');

      await updatePassword(user, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Change Password</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={COLORS.text.secondary}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setError('');
            }}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor={COLORS.text.secondary}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError('');
            }}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.changeButton]} 
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text.light} />
              ) : (
                <Text style={styles.buttonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 35,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: COLORS.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.card.primary,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.text.light,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 10,
    textAlign: 'center',
  }
});