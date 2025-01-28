import { FIREBASE_AUTH, db } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CreateClassModal } from "../components/CreateClassModal";
import { TeacherTabs } from "../components/TeacherTabs";
import { COLORS } from "../styles/theme";

interface ClassData {
  id: string;
  name: string;
  students: number;
  averageProgress: number;
  nextClass: string;
  pendingAssignments: number;
  teacherId: string;
  subject: string;
}

export default function TeacherClasses() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("classes");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    // Query classes for current teacher
    const classesQuery = query(
      collection(db, 'classes'),
      where('teacherId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(classesQuery, (snapshot) => {
      const classesData: ClassData[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        classesData.push({
          id: doc.id,
          name: data.name,
          students: data.students || 0,
          averageProgress: data.averageProgress || 0,
          nextClass: data.nextClass || 'Not scheduled',
          pendingAssignments: data.pendingAssignments || 0,
          teacherId: data.teacherId,
          subject: data.subject
        });
      });

      setClasses(classesData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateClass = async (classData: {

    name: string;
    subject: string;
    students: Array<{ id: string; name: string; email: string }>;
  }) => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    try {
      const classRef = collection(db, 'classes');
      const newClass = {
        name: `${classData.subject}: ${classData.name}`,
        subject: classData.subject,
        teacherId: user.uid,
        teacherEmail: user.email,
        students: classData.students.length,
        averageProgress: 0,
        nextClass: 'Not scheduled',
        pendingAssignments: 0,
        createdAt: serverTimestamp(),
        studentIds: classData.students.map(s => s.id)
      };

      await addDoc(classRef, newClass);
      setIsCreateModalVisible(false);
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    }

  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Classes</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color={COLORS.text.light} />
            <Text style={styles.addButtonText}>Create Class</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.classesContainer}>
          {classes.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={styles.classCard}
              onPress={() => {
                router.push({
                  pathname: "teacher/class/[id]",
                  params: { id: classItem.id }
                });
              }}
            >
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classItem.name}</Text>
                {classItem.pendingAssignments > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {classItem.pendingAssignments} pending
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialIcons name="people" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.statText}>{classItem.students} students</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons name="event" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.statText}>Next: {classItem.nextClass}</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>Average Progress</Text>
                  <Text style={styles.progressPercentage}>{classItem.averageProgress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${classItem.averageProgress}%` }]} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CreateClassModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreateClass={handleCreateClass}
      />

      <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  scrollContent: {
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.text.light,
    marginLeft: 8,
    fontWeight: '500',
  },
  classesContainer: {
    gap: 16,
  },
  classCard: {
    backgroundColor: COLORS.card.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 120,
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
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  progressBar: {
    height: 24,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
});