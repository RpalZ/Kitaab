import { db } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function StudentDetail() {
  const { id: studentId, classId } = useLocalSearchParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<StudentClassProgress | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !classId) return;
    
    setLoading(true);
    
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
      setLoading(false);
    });

    return () => {
      unsubStudent();
      unsubProgress();
      unsubAssignments();
    };
  }, [studentId, classId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!student || !progress) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.title}>Student not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
        </TouchableOpacity>
        <Text style={styles.title}>{student.displayName}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{progress.overallProgress}%</Text>
            <Text style={styles.statLabel}>Overall Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {Object.values(progress.assignments).filter(a => a.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {Object.values(progress.assignments).filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignments</Text>
          {assignments.map(assignment => {
            const studentProgress = progress.assignments[assignment.id] || { 
              status: 'pending',
              grade: undefined,
              submittedAt: undefined,
              feedback: undefined
            };

            return (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: 
                      studentProgress.status === 'completed' ? COLORS.success :
                      studentProgress.status === 'late' ? COLORS.error :
                      COLORS.warning
                    }
                  ]}>
                    <Text style={styles.statusText}>
                      {studentProgress.status.charAt(0).toUpperCase() + studentProgress.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.assignmentType}>
                  {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                </Text>

                {studentProgress.grade !== undefined && (
                  <Text style={styles.grade}>
                    Grade: {studentProgress.grade}/{assignment.totalPoints}
                  </Text>
                )}

                {studentProgress.feedback && (
                  <Text style={styles.feedback}>
                    Feedback: {studentProgress.feedback}
                  </Text>
                )}

                <Text style={styles.dueDate}>
                  Due: {new Date(assignment.dueDate.toDate()).toLocaleDateString()}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.light,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.card.primary,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  assignmentCard: {
    backgroundColor: COLORS.card.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: COLORS.text.light,
    fontSize: 12,
    fontWeight: '500',
  },
  assignmentType: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  grade: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginTop: 8,
  },
  feedback: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
}); 