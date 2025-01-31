import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AssignmentSubmissionModalProps {
  visible: boolean;
  onClose: () => void;
  onGrade?: (grade: number, feedback: string) => Promise<void>;
  submission: {
    studentName: string;
    submittedAt: Date;
    status: string;
    comment?: string;
    file?: {
      url: string;
      filename: string;
      type: string;
    };
    grade?: number;
    feedback?: string;
  };
  totalPoints: number;
}

export function AssignmentSubmissionModal({ 
  visible, 
  onClose, 
  onGrade,
  submission,
  totalPoints
}: AssignmentSubmissionModalProps) {
  const [grade, setGrade] = useState(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenFile = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open file');
    }
  };

  const handleGrade = async () => {
    if (!onGrade) return;
    
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > totalPoints) {
      alert(`Please enter a valid grade between 0 and ${totalPoints}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onGrade(gradeNum, feedback);
      onClose();
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to grade submission');
    } finally {
      setIsSubmitting(false);
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
            <Text style={styles.title}>{submission.studentName}'s Submission</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.infoSection}>
              <Text style={styles.label}>Submitted</Text>
              <Text style={styles.value}>
                {submission.submittedAt.toLocaleString()}
              </Text>
            </View>

            {submission.comment && (
              <View style={styles.infoSection}>
                <Text style={styles.label}>Student Comment</Text>
                <Text style={styles.value}>{submission.comment}</Text>
              </View>
            )}

            {submission.file && (
              <View style={styles.infoSection}>
                <Text style={styles.label}>Submitted File</Text>
                <TouchableOpacity 
                  style={styles.fileButton}
                  onPress={() => handleOpenFile(submission.file!.url)}
                >
                  <MaterialIcons 
                    name={submission.file.type.includes('pdf') ? 'picture-as-pdf' : 'image'} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.fileName}>{submission.file.filename}</Text>
                </TouchableOpacity>
              </View>
            )}

            {onGrade && (
              <View style={styles.gradingSection}>
                <Text style={styles.label}>Grade (out of {totalPoints})</Text>
                <TextInput
                  style={styles.gradeInput}
                  value={grade}
                  onChangeText={setGrade}
                  keyboardType="number-pad"
                  placeholder="Enter grade"
                  placeholderTextColor={COLORS.text.secondary}
                />

                <Text style={styles.label}>Feedback</Text>
                <TextInput
                  style={[styles.feedbackInput]}
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="Enter feedback"
                  placeholderTextColor={COLORS.text.secondary}
                  multiline
                />

                <TouchableOpacity
                  style={[styles.gradeButton, isSubmitting && styles.disabledButton]}
                  onPress={handleGrade}
                  disabled={isSubmitting}
                >
                  <Text style={styles.gradeButtonText}>Submit Grade</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
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
  content: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 15,
    borderRadius: 10,
  },
  fileName: {
    color: COLORS.text.primary,
    marginLeft: 10,
    fontSize: 16,
  },
  gradingSection: {
    marginTop: 20,
    gap: 10,
  },
  gradeInput: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text.primary,
  },
  feedbackInput: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  gradeButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  gradeButtonText: {
    color: COLORS.text.light,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 