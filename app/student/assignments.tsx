import { db, FIREBASE_AUTH } from '@/FirebaseConfig';
import { useRouter } from "expo-router";
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AssignmentViewModal } from '../components/AssignmentViewModal';
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StudentTabs } from "../components/StudentTabs";
import { COLORS } from "../styles/theme";

interface AssignmentWithClass {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: Date;
  className: string;
  status: 'pending' | 'completed' | 'late';
  totalPoints: number;
  grade?: number;
}

export default function StudentAssignments() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<AssignmentWithClass[]>([]);
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithClass | null>(null);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, async (userDoc) => {
      const userData = userDoc.data();
      const classIds = userData?.classIds || [];
      
      let allAssignments: AssignmentWithClass[] = [];

      // Create an array to store all unsubscribe functions
      const unsubscribes: (() => void)[] = [];

      // Fetch assignments from each class
      for (const classId of classIds) {
        try {
          // Get class name
          const classDocRef = doc(db, 'classes', classId);
          const classDoc = await getDoc(classDocRef);
          const className = classDoc.data()?.name || 'Unknown Class';

          // Get student's progress in this class
          const progressRef = doc(db, 'classes', classId, 'students', user.uid);
          const unsubProgress = onSnapshot(progressRef, (progressDoc) => {
            const progressData = progressDoc.data();
            const assignmentsProgress = progressData?.assignments || {};

            // Get assignments
            const assignmentsQuery = query(
              collection(db, 'classes', classId, 'assignments'),
              where('status', '==', 'active')
            );

            const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
              const assignmentsData = snapshot.docs.map(doc => {
                const assignmentData = doc.data();
                const progress = assignmentsProgress[doc.id] || {};
                
                return {
                  id: doc.id,
                  classId,
                  title: assignmentData.title,
                  description: assignmentData.description,
                  dueDate: assignmentData.dueDate.toDate(),
                  className,
                  totalPoints: assignmentData.totalPoints,
                  status: progress.status || 'pending',
                  grade: progress.grade,
                };
              });

              // Update assignments state
              setAssignments(prev => {
                const otherAssignments = prev.filter(a => a.classId !== classId);
                return [...otherAssignments, ...assignmentsData];
              });
            });

            unsubscribes.push(unsubAssignments);
          });

          unsubscribes.push(unsubProgress);
        } catch (error) {
          console.error('Error fetching class data:', error);
        }
      }

      setLoading(false);

      // Cleanup function
      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    });

    return () => unsubscribeUser();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <StudentTabs activeTab={activeTab} onTabPress={setActiveTab} />
      <ScrollView style={styles.content}>
        {assignments.map((assignment) => (
          <TouchableOpacity
            key={assignment.id}
            style={styles.assignmentCard}
            onPress={() => setSelectedAssignment(assignment)}
          >
            <View style={styles.assignmentHeader}>
              <Text style={styles.className}>{assignment.className}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: 
                  assignment.status === 'completed' ? COLORS.success :
                  assignment.status === 'late' ? COLORS.error :
                  COLORS.warning
                }
              ]}>
                <Text style={styles.statusText}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.title}>{assignment.title}</Text>
            
            {assignment.description && (
              <Text style={styles.description} numberOfLines={2}>
                {assignment.description}
              </Text>
            )}

            <View style={styles.footer}>
              <Text style={styles.dueDate}>
                Due: {assignment.dueDate.toLocaleDateString()}
              </Text>
              {assignment.grade !== undefined && (
                <Text style={styles.grade}>
                  Grade: {assignment.grade}/{assignment.totalPoints}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedAssignment && (
        <AssignmentViewModal
          visible={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          assignment={selectedAssignment}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 30 : 0,
    backgroundColor: COLORS.tertiary,
  },
  content: {
    flex: 1,
    padding: 16,
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
  className: {
    fontSize: 14,
    color: COLORS.text.secondary,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
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
}); 