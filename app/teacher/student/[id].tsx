import { db } from '@/FirebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function StudentDetail() {
  const { id: studentId, classId } = useLocalSearchParams();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<StudentClassProgress | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // Fetch student profile
    const studentRef = doc(db, 'users', studentId as string);
    const unsubStudent = onSnapshot(studentRef, (doc) => {
      setStudent(doc.data() as StudentProfile);
    });

    // Fetch student's progress in this class
    const progressRef = doc(db, 'classes', classId as string, 'students', studentId as string);
    const unsubProgress = onSnapshot(progressRef, (doc) => {
      setProgress(doc.data() as StudentClassProgress);
    });

    // Fetch assignments
    const assignmentsQuery = query(
      collection(db, 'classes', classId as string, 'assignments'),
      where('status', '==', 'active')
    );
    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const assignmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Assignment[];
      setAssignments(assignmentsData);
    });

    return () => {
      unsubStudent();
      unsubProgress();
      unsubAssignments();
    };
  }, [studentId, classId]);

  // Render student details, progress, and assignments...
} 