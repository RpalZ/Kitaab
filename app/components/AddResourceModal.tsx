import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../styles/theme';

interface AddResourceModalProps {
  visible: boolean;
  onClose: () => void;
  onAddResource: (resource: { name: string; type: string }) => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ visible, onClose, onAddResource }) => {
  const [resourceName, setResourceName] = useState('');
  const [resourceType, setResourceType] = useState('quiz');

  const handleAdd = () => {
    onAddResource({ name: resourceName, type: resourceType });
    setResourceName('');
    setResourceType('quiz');
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Resource</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter resource name"
            value={resourceName}
            onChangeText={setResourceName}
          />
          <Picker
            selectedValue={resourceType}
            style={styles.picker}
            onValueChange={(itemValue: React.SetStateAction<string>) => setResourceType(itemValue)}
          >
            <Picker.Item label="Quiz" value="quiz" />
            <Picker.Item label="PDF File" value="pdf" />
            <Picker.Item label="PowerPoint" value="powerpoint" />
          </Picker>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text.primary,
  },
  input: {
    height: 40,
    borderColor: COLORS.border,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: COLORS.text.primary,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  buttonText: {
    color: COLORS.text.light,
    fontWeight: 'bold',
  },
});