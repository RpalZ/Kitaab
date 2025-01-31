import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AssignmentDetailModalProps {
  visible: boolean;
  onClose: () => void;
  assignment: {
    id: string;
    title: string;
    description: string;
    totalPoints: number;
    dueDate: Timestamp;
    file?: {
      url: string;
      filename: string;
      type: 'PDF' | 'Image';
    };
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AssignmentDetailModal({ 
  visible, 
  onClose, 
  assignment,
  onEdit,
  onDelete 
}: AssignmentDetailModalProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleOpenFile = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open file');
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
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={e => e.stopPropagation()}
          style={styles.modalView}
        >
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {assignment.title}
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
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>
                {assignment.dueDate.toDate().toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Points</Text>
              <Text style={styles.value}>{assignment.totalPoints}</Text>
            </View>

            {assignment.description && (
              <View style={styles.infoSection}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.description}>
                  {assignment.description}
                </Text>
              </View>
            )}

            {assignment.file && (
              <View style={styles.infoSection}>
                <Text style={styles.label}>Attached File</Text>
                <TouchableOpacity 
                  style={styles.fileButton}
                  onPress={() => handleOpenFile(assignment.file!.url)}
                >
                  <MaterialIcons 
                    name={assignment.file.type === 'PDF' ? 'picture-as-pdf' : 'image'} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {assignment.file.filename}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {(onEdit || onDelete) && (
            <View style={styles.buttonContainer}>
              {onEdit && (
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                  <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: '70%',
  },
  contentContainer: {
    paddingBottom: 16,
  },
  infoSection: {
    backgroundColor: COLORS.card.secondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  fileName: {
    color: COLORS.text.primary,
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.card.secondary,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.light,
  },
  deleteText: {
    color: COLORS.text.light,
  },
}); 