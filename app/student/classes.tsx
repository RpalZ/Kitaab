import { db, FIREBASE_AUTH } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StudentTabs } from "../components/StudentTabs";
import { COLORS } from "../styles/theme";

interface ClassDetails {
  id: string;
  name: string;
  teacher: string;
  assignmentsDue: number;
  nextDeadline: string | null;
  progress: number;
  subject: string;
}

interface AssignmentData {
  id: string;
  dueDate: string;
  status: 'active' | 'archived';
}

export default function StudentClasses() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [activeTab, setActiveTab] = useState('classes');

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    // Fetch user's profile to get classIds
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, async (userDoc) => {
      const userData = userDoc.data();
      const classIds = userData?.classIds || [];

      // Fetch details for each class
      const classPromises = classIds.map(async (classId: string) => {
        const classDoc = await getDoc(doc(db, 'classes', classId));
        const classData = classDoc.data();
        
        // Get teacher's name
        const teacherDoc = await getDoc(doc(db, 'users', classData?.teacherId));
        const teacherData = teacherDoc.data();

        // Get assignments using getDocs instead of getDoc
        const assignmentsQuery = query(
          collection(db, 'classes', classId, 'assignments'),
          where('status', '==', 'active')
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);
        const assignments = assignmentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AssignmentData[];

        // Get student's progress
        const progressDoc = await getDoc(doc(db, 'classes', classId, 'students', user.uid));
        const progressData = progressDoc.data();

        return {
          id: classId,
          name: classData?.name || '',
          teacher: teacherData?.displayName || teacherData?.email?.split('@')[0] || 'Teacher',
          subject: classData?.subject || '',
          assignmentsDue: assignments.length,
          nextDeadline: assignments.length > 0 ? 
            assignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate : null,
          progress: progressData?.overallProgress || 0
        };
      });

      const classesData = await Promise.all(classPromises);
      setClasses(classesData);
      setLoading(false);
    });

    return () => unsubscribeUser();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <StudentTabs activeTab={activeTab} onTabPress={setActiveTab} />
      <View style={styles.content}>
        {activeTab === 'classes' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={styles.classCard}
                onPress={() => router.push(`/student/class/${classItem.id}`)}
              >
                <View style={styles.classHeader}>
                  <Text style={styles.className}>{classItem.name}</Text>
                  <Text style={styles.teacherName}>{classItem.teacher}</Text>
                </View>

                <View style={styles.classInfo}>
                  <View style={styles.infoItem}>
                    <MaterialIcons name="assignment" size={20} color={COLORS.text.secondary} />
                    <Text style={styles.infoText}>{classItem.assignmentsDue} assignments due</Text>
                  </View>
                  
                  {classItem.nextDeadline && (
                    <View style={styles.infoItem}>
                      <MaterialIcons name="event" size={20} color={COLORS.text.secondary} />
                      <Text style={styles.infoText}>
                        Next deadline: {new Date(classItem.nextDeadline).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${classItem.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{classItem.progress}% Complete</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : activeTab === 'assignments' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {classes.map((classItem) => (
              <View key={classItem.id} style={styles.assignmentsSection}>
                <Text style={styles.className}>{classItem.name}</Text>
                {classItem.assignmentsDue > 0 ? (
                  <View style={styles.assignmentCard}>
                    <View style={styles.assignmentHeader}>
                      <Text style={styles.assignmentCount}>
                        {classItem.assignmentsDue} {classItem.assignmentsDue === 1 ? 'Assignment' : 'Assignments'} Due
                      </Text>
                      {classItem.nextDeadline && (
                        <Text style={styles.nextDeadline}>
                          Next due: {new Date(classItem.nextDeadline).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => router.push(`/student/class/${classItem.id}`)}
                    >
                      <Text style={styles.viewButtonText}>View Assignments</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.noAssignments}>No assignments due</Text>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView>
            {/* Resources tab content */}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  classCard: {
    backgroundColor: COLORS.card.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  teacherName: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.card.secondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  assignmentsSection: {
    marginBottom: 20,
    backgroundColor: COLORS.card.primary,
    borderRadius: 10,
    padding: 15,
  },
  assignmentCard: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: 12,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assignmentCount: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  nextDeadline: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: COLORS.text.light,
    fontWeight: '500',
  },
  noAssignments: {
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  }
}); 