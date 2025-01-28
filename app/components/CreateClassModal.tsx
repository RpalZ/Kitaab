import { db } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from 'app/styles/theme';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Student = {
  id: string;
  name: string;
  email: string;
};

type CreateClassModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateClass: (classData: {
    name: string;
    subject: string;
    students: Student[];
  }) => void;
};

export function CreateClassModal({ visible, onClose, onCreateClass }: CreateClassModalProps) {
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  const handleCreateClass = async () => {
    if (!className.trim() || !subject.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      onCreateClass({
        name: className,
        subject,
        students
      });

      // Reset form
      setClassName('');
      setSubject('');
      setStudents([]);
      onClose();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    }
  };

  const addStudent = async () => {
    if (!studentEmail.trim()) return;

    // Create a new student profile if it doesn't exist
    try {
      const studentId = Date.now().toString(); // You might want to use a better ID generation method
      const newStudent: Student = {
        id: studentId,
        name: studentEmail.split('@')[0],
        email: studentEmail.trim()
      };

      // Add student to the students collection
      await addDoc(collection(db, 'users'), {
        ...newStudent,
        role: 'student',
        classIds: []
      });

      setStudents([...students, newStudent]);
      setStudentEmail('');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    }
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
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
          <Text style={styles.modalTitle}>Create New Class</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Class Name"
            placeholderTextColor={COLORS.text.secondary}
            value={className}
            onChangeText={setClassName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Subject"
            placeholderTextColor={COLORS.text.secondary}
            value={subject}
            onChangeText={setSubject}
          />

          <View style={styles.studentSection}>
            <Text style={styles.sectionTitle}>Add Students</Text>
            <View style={styles.addStudentContainer}>
              <TextInput
                style={[styles.input, styles.studentInput]}
                placeholder="Student Email"
                placeholderTextColor={COLORS.text.secondary}
                value={studentEmail}
                onChangeText={setStudentEmail}
              />
              <TouchableOpacity style={styles.addButton} onPress={addStudent}>
                <MaterialIcons name="add" size={24} color={COLORS.text.light} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.studentList}>
              {students.map((student) => (
                <View key={student.id} style={styles.studentItem}>
                  <Text style={styles.studentText}>{student.email}</Text>
                  <TouchableOpacity
                    onPress={() => removeStudent(student.id)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="remove-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreateClass}
            >
              <Text style={styles.createButtonText}>Create Class</Text>
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
    maxHeight: '80%',
    backgroundColor: COLORS.card.primary,
    borderRadius: 20,
    padding: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  studentSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  addStudentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  studentInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: SPACING.sm,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.sm,
  },
  studentList: {
    maxHeight: 200,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  studentText: {
    flex: 1,
    color: COLORS.text.primary,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: SPACING.sm,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.card.secondary,
    justifyContent: "center"
  },
  createButton: {
    backgroundColor: COLORS.primary,
    justifyContent: "center"
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    
  },
  createButtonText: {
    color: COLORS.text.light,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
}); 