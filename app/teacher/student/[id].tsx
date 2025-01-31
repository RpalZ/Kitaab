import { db } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssignmentDetailModal } from '../../components/AssignmentDetailModal';
import { AssignmentSubmissionModal } from '../../components/AssignmentSubmissionModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const calculateOverallProgress = (assignments: Assignment[], progress: StudentClassProgress) => {
  const totalAssignments = assignments.length;
  if (totalAssignments === 0) return 0;

  // Count all completed assignments (submitted), regardless of grade
  const completedAssignments = Object.values(progress.assignments).filter(
    a => a.status === 'completed'
  ).length;

  return Math.round((completedAssignments / totalAssignments) * 100);
};

export default function StudentDetail() {
  const { id: studentId, classId } = useLocalSearchParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<StudentClassProgress | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);

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

  const handleGrade = async (grade: number, feedback: string) => {
    if (!selectedAssignment || !studentId || !classId || !progress) return;

    try {
      const studentRef = doc(db, 'classes', classId as string, 'students', studentId as string);
      
      // Calculate new overall progress (though it won't change since we're only grading)
      const updatedProgress = {
        ...progress,
        assignments: {
          ...progress.assignments,
          [selectedAssignment.id]: {
            ...progress.assignments[selectedAssignment.id],
            grade,
            feedback,
            gradedAt: new Date(),
          }
        }
      };
      
      const newOverallProgress = calculateOverallProgress(assignments, updatedProgress);

      await updateDoc(studentRef, {
        [`assignments.${selectedAssignment.id}.grade`]: grade,
        [`assignments.${selectedAssignment.id}.feedback`]: feedback,
        [`assignments.${selectedAssignment.id}.gradedAt`]: new Date(),
        overallProgress: newOverallProgress,
      });

    } catch (error) {
      console.error('Error updating grade:', error);
      alert('Failed to update grade');
    }
  };

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
          {assignments.length === 0 ? (
            <Text style={styles.noAssignments}>No assignments yet</Text>
          ) : (
            assignments.map(assignment => {
              const studentProgress = progress.assignments[assignment.id] || { 
                status: 'pending',
                grade: undefined,
                submittedAt: undefined,
                feedback: undefined
              };

              return (
                <TouchableOpacity
                  key={assignment.id}
                  style={[
                    styles.assignmentCard,
                    studentProgress.status === 'completed' && styles.completedCard,
                    studentProgress.status === 'late' && styles.lateCard
                  ]}
                  onPress={() => {
                    if (studentProgress.status === 'completed') {
                      setSelectedAssignment(assignment);
                      setSelectedSubmission({
                        studentName: student.displayName || student.email,
                        submittedAt: new Date(studentProgress.submittedAt),
                        status: studentProgress.status,
                        comment: studentProgress.comment,
                        file: studentProgress.file,
                        grade: studentProgress.grade,
                        feedback: studentProgress.feedback,
                      });
                    } else {
                      setViewingAssignment(assignment);
                    }
                  }}
                >
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentTitle} numberOfLines={2}>
                      {assignment.title}
                    </Text>
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

                  {assignment.description && (
                    <Text style={styles.description} numberOfLines={2}>
                      {assignment.description}
                    </Text>
                  )}

                  <View style={styles.footer}>
                    <Text style={styles.dueDate}>
                      Due: {new Date(assignment.dueDate.toDate()).toLocaleDateString()}
                    </Text>
                    {studentProgress.grade !== undefined && (
                      <Text style={styles.grade}>
                        {studentProgress.grade}/{assignment.totalPoints}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {viewingAssignment && (
        <AssignmentDetailModal
          visible={!!viewingAssignment}
          onClose={() => setViewingAssignment(null)}
          assignment={viewingAssignment}
        />
      )}

      {selectedSubmission && selectedAssignment && (
        <AssignmentSubmissionModal
          visible={!!selectedSubmission}
          onClose={() => {
            setSelectedAssignment(null);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          totalPoints={selectedAssignment.totalPoints}
          onGrade={handleGrade}
        />
      )}
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
    // marginTop: 20,
    paddingTop: Platform.OS === 'ios' ?  50: 16,
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
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.card.primary,
    padding: 16,
    borderRadius: 12,
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.text.light,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  grade: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  lateCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  noAssignments: {
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
}); 