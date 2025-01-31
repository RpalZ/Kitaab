import { db, FIREBASE_AUTH } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import * as DocumentPicker from 'expo-document-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AssignmentViewModalProps {
  visible: boolean;
  onClose: () => void;
  assignment: {
    id: string;
    classId: string;
    title: string;
    description: string;
    dueDate: Date;
    totalPoints: number;
    status: 'pending' | 'completed' | 'late';
    file?: {
      url: string;
      filename: string;
      type: string;
    };
  };
}

export function AssignmentViewModal({ visible, onClose, assignment }: AssignmentViewModalProps) {
  const [comment, setComment] = useState('');
  const [attachedFile, setAttachedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets.length > 0) {
        setAttachedFile(result);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      alert('Failed to pick document');
    }
  };

  const uploadFile = async () => {
    if (!attachedFile?.assets?.[0]) return null;

    const storage = getStorage();
    const fileRef = ref(storage, `submissions/${assignment.classId}/${assignment.id}/${FIREBASE_AUTH.currentUser?.uid}/${Date.now()}_${attachedFile.assets[0].name}`);
    
    try {
      const response = await fetch(attachedFile.assets[0].uri);
      const blob = await response.blob();
      
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      
      return {
        url: downloadURL,
        filename: attachedFile.assets[0].name,
        type: attachedFile.assets[0].mimeType
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let fileData = null;
      if (attachedFile) {
        fileData = await uploadFile();
      }

      const submissionData = {
        status: 'completed',
        submittedAt: new Date(),
        comment: comment.trim(),
        file: fileData
      };

      // Update the student's assignment progress
      const progressRef = doc(
        db, 
        'classes', 
        assignment.classId, 
        'students', 
        FIREBASE_AUTH.currentUser!.uid
      );

      await updateDoc(progressRef, {
        [`assignments.${assignment.id}`]: submissionData
      });

      alert('Assignment submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsComplete = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const progressRef = doc(
        db, 
        'classes', 
        assignment.classId, 
        'students', 
        FIREBASE_AUTH.currentUser!.uid
      );

      await updateDoc(progressRef, {
        [`assignments.${assignment.id}`]: {
          status: 'completed',
          submittedAt: new Date()
        }
      });

      alert('Assignment marked as complete!');
      onClose();
    } catch (error) {
      console.error('Error marking assignment as complete:', error);
      alert('Failed to update assignment status');
    } finally {
      setSubmitting(false);
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
          <View style={styles.header}>
            <Text style={styles.title}>{assignment.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{assignment.description}</Text>
          
          <Text style={styles.dueDate}>
            Due: {assignment.dueDate.toLocaleDateString()}
          </Text>

          <View style={styles.submissionSection}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor={COLORS.text.secondary}
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <TouchableOpacity style={styles.filePicker} onPress={pickDocument}>
              <MaterialIcons name="attach-file" size={24} color={COLORS.text.secondary} />
              <Text style={styles.filePickerText}>
                {attachedFile?.assets?.[0]?.name || "Attach a file (optional)"}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.markCompleteButton]}
                onPress={handleMarkAsComplete}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>Mark Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>Submit with Resources</Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: '80%',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 15,
  },
  dueDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  submissionSection: {
    gap: 15,
  },
  commentInput: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 12,
    borderRadius: 10,
  },
  filePickerText: {
    color: COLORS.text.secondary,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  markCompleteButton: {
    backgroundColor: COLORS.warning,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.text.light,
    fontWeight: '500',
  },
}); 