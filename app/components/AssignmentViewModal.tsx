import { db, FIREBASE_AUTH } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import * as DocumentPicker from 'expo-document-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Keyboard, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface AssignmentResource {
  id: string;
  title: string;
  description?: string;
  url: string;
}

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
    resources?: AssignmentResource[];
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

  // Add console log to check resources when modal opens
  useEffect(() => {
    if (visible) {
      console.log('Assignment in modal:', assignment);
      console.log('Resources:', assignment.resources);
    }
  }, [visible, assignment]);

  const renderResource = (resource: AssignmentResource) => (
    <TouchableOpacity
      key={resource.id}
      style={styles.resourceCard}
      onPress={() => {
        console.log('Opening resource:', resource);
        if (!resource.url) {
          alert('Resource URL not available');
          return;
        }
        Linking.openURL(resource.url);
      }}
    >
      <MaterialIcons 
        name="description" 
        size={24} 
        color={COLORS.primary} 
      />
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle}>
          {resource.title || 'Untitled Resource'}
        </Text>
        {resource.description && (
          <Text style={styles.resourceDescription} numberOfLines={1}>
            {resource.description}
          </Text>
        )}
      </View>
      <MaterialIcons 
        name="open-in-new" 
        size={20} 
        color={COLORS.primary} 
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.points}>{assignment.totalPoints} points</Text>
            </View>

            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Assignment Details */}
              <Text style={styles.title}>{assignment.title}</Text>
              <Text style={styles.dueDate}>
                Due: {assignment.dueDate.toLocaleDateString()}
              </Text>
              <Text style={styles.description}>{assignment.description}</Text>

              {/* Resources Section */}
              {assignment.resources && assignment.resources.length > 0 && (
                <View style={styles.resourcesSection}>
                  <Text style={styles.sectionTitle}>Resources</Text>
                  {assignment.resources.map(renderResource)}
                </View>
              )}

              {/* Submission Section */}
              <View style={styles.submissionSection}>
                <Text style={styles.sectionTitle}>Your Submission</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment (optional)"
                  placeholderTextColor={COLORS.text.secondary}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  blurOnSubmit={true}
                />

                <TouchableOpacity 
                  style={styles.filePicker} 
                  onPress={pickDocument}
                >
                  <MaterialIcons 
                    name="attach-file" 
                    size={24} 
                    color={COLORS.text.secondary} 
                  />
                  <Text style={styles.filePickerText}>
                    {attachedFile?.assets?.[0]?.name || "Attach a file (optional)"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Action Buttons */}
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
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: Platform.OS === 'ios' ? 45 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 8,
  },
  points: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  scrollContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    padding: 16,
    paddingBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  resourcesSection: {
    padding: 16,
    backgroundColor: COLORS.card.secondary,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.primary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  resourceDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  submissionSection: {
    padding: 16,
  },
  commentInput: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
    fontSize: 16,
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
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: COLORS.card.primary,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
  },
}); 