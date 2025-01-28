import { FIREBASE_AUTH, db } from '@/FirebaseConfig';
import { useRouter } from "expo-router";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CreateClassModal } from "../components/CreateClassModal";
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherTabs } from "../components/TeacherTabs";
import { dashboardStyles as styles } from "../styles/components/dashboard.styles";

interface ClassData {
  id: string;
  name: string;
  subject: string;
  students: number;
  resources: number;
  teacherId: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalResources, setTotalResources] = useState<number>(0);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    setUserEmail(user.email);

    // Query classes for current teacher
    const classesQuery = query(
      collection(db, 'classes'),
      where('teacherId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(classesQuery, (snapshot) => {
      const classesData: ClassData[] = [];
      let students = 0;
      let resources = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as ClassData;
        classesData.push({ ...data, id: doc.id });
        students += data.students;
        resources += data.resources;
      });

      setClasses(classesData);
      setTotalStudents(students);
      setTotalResources(resources);
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
        resources: 0,
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
    <ProtectedRoute requiredRole="teacher">
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              Welcome, {userEmail ? userEmail.split('@')[0] : 'Teacher'}!
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{classes.length}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalStudents}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalResources}</Text>
              <Text style={styles.statLabel}>Resources</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Text style={styles.actionButtonText}>Create Class</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/teacher/forum")}
              >
                <Text style={styles.actionButtonText}>Teacher Forum</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Classes</Text>
            {classes.map((classItem) => (
              <TouchableOpacity 
                key={classItem.id} 
                style={styles.card}
                onPress={() => {
                  router.push({
                    pathname: "teacher/class/[id]",
                    params: { id: classItem.id }
                  });
                }}
              >
                <Text style={styles.className}>{classItem.name}</Text>
                <Text style={styles.classInfo}>
                  {classItem.students} students • {classItem.resources} resources
                </Text>
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
    </ProtectedRoute>
  );
}
