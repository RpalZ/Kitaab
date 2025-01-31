import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { useState } from 'react';
import { Keyboard, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

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
      statusBarTranslucent
    >
      <TouchableOpacity 
        style={styles.centeredView} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
            style={styles.modalView}
          >
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>
                {submission.studentName}'s Submission
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              <View style={styles.infoSection}>
                <Text style={styles.label}>Submitted</Text>
                <Text style={styles.value}>
                  {submission.submittedAt.toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
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
            </ScrollView>

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
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                <Text style={styles.label}>Feedback</Text>
                <TextInput
                  style={styles.feedbackInput}
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="Enter feedback"
                  placeholderTextColor={COLORS.text.secondary}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit={true}
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
          </TouchableOpacity>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalView: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.card.primary,
    borderRadius: 20,
    padding: 16,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: '60%',
  },
  contentContainer: {
    paddingBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  fileName: {
    color: COLORS.text.primary,
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  gradingSection: {
    marginTop: 16,
    gap: 8,
  },
  gradeInput: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text.primary,
    fontSize: 14,
  },
  feedbackInput: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  gradeButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  gradeButtonText: {
    color: COLORS.text.light,
    fontWeight: '500',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 