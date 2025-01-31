import { db } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from 'app/styles/theme';
import { DocumentPickerAsset, getDocumentAsync } from 'expo-document-picker';
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type AddAssignmentModalProps = {
  visible: boolean;
  onClose: () => void;
  classId: string;
  assignmentToEdit?: Assignment | null;
};

export function AddAssignmentModal({ visible, onClose, classId, assignmentToEdit }: AddAssignmentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<DocumentPickerAsset | null>(null);

  useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.title);
      setDescription(assignmentToEdit.description);
      setTotalPoints(assignmentToEdit.totalPoints.toString());
      setDueDate(assignmentToEdit.dueDate.toDate());
    }
  }, [assignmentToEdit]);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.dateButton}>
          <MaterialIcons name="event" size={24} color={COLORS.text.primary} />
          <input
            type="date"
            value={dueDate.toISOString().split('T')[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                setDueDate(newDate);
              }
            }}
            style={{
              backgroundColor: 'transparent',
              color: COLORS.text.primary,
              border: 'none',
              flex: 1,
              marginLeft: 10,
              fontSize: 14,
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              WebkitAppearance: 'none',
            }}
          />
        </View>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="event" size={24} color={COLORS.text.primary} />
          <Text style={styles.dateButtonText}>
            Due Date: {dueDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </>
    );
  };

  const pickDocument = async () => {
    try {
      const result = await getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets.length > 0) {
        setAttachedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      alert('Failed to pick document');
    }
  };

  const uploadFile = async () => {
    if (!attachedFile) return null;

    const storage = getStorage();
    const fileRef = ref(storage, `assignments/${classId}/${Date.now()}_${attachedFile.name}`);
    
    const response = await fetch(attachedFile.uri);
    const blob = await response.blob();
    
    await uploadBytes(fileRef, blob);
    const downloadURL = await getDownloadURL(fileRef);
    
    return {
      url: downloadURL,
      filename: attachedFile.name,
      type: attachedFile.mimeType?.includes('pdf') ? 'PDF' : 'Image'
    };
  };

  const handleCreate = async () => {
    if (!title.trim() || !totalPoints) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let fileData = null;
      if (attachedFile) {
        fileData = await uploadFile();
      }

      const assignmentData = {
        title: title.trim(),
        description: description.trim(),
        totalPoints: parseInt(totalPoints),
        dueDate: Timestamp.fromDate(dueDate),
        status: 'active',
        createdAt: serverTimestamp(),
        type: 'assignment',
        file: fileData || assignmentToEdit?.file
      };

      if (assignmentToEdit) {
        await updateDoc(doc(db, 'classes', classId, 'assignments', assignmentToEdit.id), assignmentData);
      } else {
        await addDoc(collection(db, 'classes', classId, 'assignments'), assignmentData);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setTotalPoints('');
      setDueDate(new Date());
      setAttachedFile(null);
      onClose();
      alert(`Assignment ${assignmentToEdit ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Failed to save assignment');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Create New Assignment</Text>

          <TextInput
            style={styles.input}
            placeholder="Assignment Title"
            placeholderTextColor={COLORS.text.secondary}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor={COLORS.text.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={styles.input}
            placeholder="Total Points"
            placeholderTextColor={COLORS.text.secondary}
            value={totalPoints}
            onChangeText={setTotalPoints}
            keyboardType="numeric"
          />

          {renderDatePicker()}

          <TouchableOpacity
            style={styles.fileButton}
            onPress={pickDocument}
          >
            <MaterialIcons name="attach-file" size={24} color={COLORS.text.primary} />
            <Text style={styles.fileButtonText}>
              {attachedFile ? attachedFile.name : 'Attach File (optional)'}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
            >
              <Text style={styles.createButtonText}>Create</Text>
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
    width: '90%',
    backgroundColor: COLORS.card.primary,
    borderRadius: 20,
    padding: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.card.secondary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  createButtonText: {
    color: COLORS.text.light,
    textAlign: 'center',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateButtonText: {
    color: COLORS.text.primary,
    marginLeft: 10,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  fileButtonText: {
    color: COLORS.text.primary,
    marginLeft: 10,
  },
}); 