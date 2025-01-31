import { db, FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProtectedRoute } from '../components/ProtectedRoute';
import { StudentTabs } from "../components/StudentTabs";
import { dashboardStyles as styles } from "../styles/components/dashboard.styles";

interface ClassSummary {
  id: string;
  name: string;
  teacherName: string;
  newResources: number;
  subject: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [recentResources, setRecentResources] = useState<any[]>([]);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setUserEmail(user.email);
    setDisplayName(user.displayName || user.email?.split("@")[0] || "Student");

    // Fetch user's profile to get classIds
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, async (userDoc) => {
      if (!userDoc.exists()) {
        console.error("User document doesn't exist");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const classIds = userData?.classIds || [];

      // Fetch details for each class
      const classPromises = classIds.map(async (classId: string) => {
        try {
          const classDoc = await getDoc(doc(db, 'classes', classId));
          if (!classDoc.exists()) {
            console.warn(`Class ${classId} not found`);
            return null;
          }
          
          const classData = classDoc.data();
          if (!classData?.teacherId) {
            console.warn(`No teacher ID for class ${classId}`);
            return null;
          }

          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          const teacherData = teacherDoc.data();

          return {
            id: classId,
            name: classData?.name || 'Unnamed Class',
            teacherName: teacherData?.displayName || teacherData?.email?.split('@')[0] || 'Teacher',
            subject: classData?.subject || 'No Subject',
            newResources: 0,
          };
        } catch (error) {
          console.error(`Error fetching class ${classId}:`, error);
          return null;
        }
      });

      try {
        const classesData = (await Promise.all(classPromises)).filter((c): c is ClassSummary => c !== null);
        setClasses(classesData);
      } catch (error) {
        console.error("Error processing classes:", error);
        setClasses([]);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error in snapshot listener:", error);
      setLoading(false);
    });

    return () => unsubscribeUser();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ProtectedRoute requiredRole="student">
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome, {displayName}!</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{classes.length}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Assignments</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Resources</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Classes</Text>
            {classes.map((classItem) => (
              <TouchableOpacity 
                key={classItem.id} 
                style={styles.card}
                onPress={() => router.push(`/student/class/${classItem.id}`)}
              >
                <Text style={styles.className}>{classItem.name}</Text>
                <View style={styles.classDetails}>
                  <Text style={styles.classInfo}>
                    {classItem.newResources > 0 ? `${classItem.newResources} new resources` : 'No new resources'}
                  </Text>
                  <Text style={styles.classTeacher}>{classItem.teacherName}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Resources</Text>
            {[
              "Week 3 Math Notes",
              "Physics Lab Manual",
              "Chemistry Homework",
            ].map((resource, index) => (
              <TouchableOpacity key={index} style={styles.card}>
                <Text style={styles.className}>{resource}</Text>
                <Text style={styles.classInfo}>Added 2 days ago</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <StudentTabs activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </ProtectedRoute>
  );
}
