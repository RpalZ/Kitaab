import { db } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Student = {
  id: string;
  name: string;
  email: string;
};

type AddStudentsModalProps = {
  visible: boolean;
  onClose: () => void;
  classId: string;
};

export function AddStudentsModal({ visible, onClose, classId }: AddStudentsModalProps) {
  const [studentEmail, setStudentEmail] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  const addStudent = async () => {
    if (!studentEmail.trim()) return;

    try {
      const studentId = Date.now().toString();
      const newStudent = {
        id: studentId,
        name: studentEmail.split('@')[0],
        email: studentEmail.trim(),
        progress: 0,
        lastActive: new Date().toISOString()
      };

      // Add student to the class's students collection
      await addDoc(collection(db, 'classes', classId, 'students'), newStudent);

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
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Students</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Student Email"
              placeholderTextColor={COLORS.text.secondary}
              value={studentEmail}
              onChangeText={setStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  studentText: {
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 4,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
}); 