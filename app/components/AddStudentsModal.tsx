import { db } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
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
    const email = studentEmail.trim();
    if (!email) {
      alert('Please enter a student email');
      return;
    }

    try {
      // Check if student exists in users collection
      const userQuery = query(
        collection(db, 'users'), 
        where('email', '==', email),
        where('role', '==', 'student')
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        alert('No student account found with this email. Students must create an account first.');
        return;
      }

      const studentDoc = userSnapshot.docs[0];
      const studentId = studentDoc.id;
      const studentData = studentDoc.data();

      if (!studentData) {
        alert('Invalid student data');
        return;
      }

      // Check if student is already in the class
      if (studentData.classIds?.includes(classId)) {
        alert('Student is already in this class');
        return;
      }

      // Use a batch write to ensure all operations succeed or fail together
      const batch = writeBatch(db);

      // Update class document to increment student count
      const classRef = doc(db, 'classes', classId);
      batch.update(classRef, {
        students: increment(1)
      });

      // Add class to student's profile
      const studentRef = doc(db, 'users', studentId);
      batch.update(studentRef, {
        classIds: arrayUnion(classId)
      });

      // Create student progress record
      const progressRef = doc(db, 'classes', classId, 'students', studentId);
      batch.set(progressRef, {
        studentId,
        classId,
        overallProgress: 0,
        lastAccessed: serverTimestamp(),
        assignments: {},
        name: studentData.displayName || email.split('@')[0], // Add name from user profile
        email: email
      });

      // Commit the batch
      await batch.commit();

      setStudentEmail('');
      alert('Student added successfully!');
      onClose(); // Close modal after successful addition
      
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please check permissions and try again.');
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