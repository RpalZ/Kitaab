import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Menu } from 'react-native-paper';

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
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>{assignment.title}</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <MaterialIcons name="more-vert" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              }
            >
              {onEdit && (
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    onEdit();
                  }} 
                  title="Edit" 
                  leadingIcon="edit"
                />
              )}
              {onDelete && (
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    onDelete();
                  }} 
                  title="Delete" 
                  leadingIcon="delete"
                  titleStyle={{ color: COLORS.error }}
                />
              )}
            </Menu>
          </View>

          <ScrollView style={styles.content}>
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
                <Text style={styles.description}>{assignment.description}</Text>
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
                  <Text style={styles.fileName}>{assignment.file.filename}</Text>
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
    marginBottom: 20,
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
  description: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  deleteText: {
    color: COLORS.text.primary,
  },
}); 