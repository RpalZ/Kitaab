import { db, FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

interface RecentResource {
  id: string;
  title: string;
  description: string;
  url: string;
  className: string;
  addedAt: Date;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [recentResources, setRecentResources] = useState<RecentResource[]>([]);
  const [totalResources, setTotalResources] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);

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


      let totalResourceCount = 0;
      let totalAssignmentCount = 0;
      const classPromises = classIds.map(async (classId: string) => {
        const classDoc = await getDoc(doc(db, 'classes', classId));
        const classData = classDoc.data();

        // Get resource count for this class
        const resourcesSnap = await getDocs(collection(db, 'classes', classId, 'resources'));
        totalResourceCount += resourcesSnap.size;

        // Get assignment count for this class
        const assignmentsSnap = await getDocs(collection(db, 'classes', classId, 'assignments'));
        totalAssignmentCount += assignmentsSnap.size;

        return {
          id: classId,
          name: classData?.name || '',
          teacherName: classData?.teacherName || '',
          newResources: resourcesSnap.size,
          subject: classData?.subject || ''
        };
      });

      const classesData = await Promise.all(classPromises);
      setClasses(classesData);
      setTotalResources(totalResourceCount);
      setTotalAssignments(totalAssignmentCount);

      setLoading(false);

      const fetchRecentResources = async () => {
        try {
          let allResources: RecentResource[] = [];

          // Fetch resources from each class
          for (const classId of classIds) {
            // Get class name
            const classDoc = await getDoc(doc(db, 'classes', classId));
            const className = classDoc.data()?.name || 'Unknown Class';

            // Get recent resources from this class
            const resourcesQuery = query(
              collection(db, 'classes', classId, 'resources'),
              orderBy('addedAt', 'desc'),
              limit(3)
            );

            const resourcesSnap = await getDocs(resourcesQuery);
            const classResources = resourcesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              className,
              addedAt: doc.data().addedAt.toDate()
            })) as RecentResource[];

            allResources = [...allResources, ...classResources];
          }

          // Sort all resources by date and take the most recent 5
          allResources.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
          setRecentResources(allResources.slice(0, 5));
          setLoading(false);
        } catch (error) {
          console.error('Error fetching recent resources:', error);
          setLoading(false);
        }
      };

      fetchRecentResources();
    });

    return () => {
      unsubscribeUser();
    };
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
              <Text style={styles.statNumber}>{totalAssignments}</Text>
              <Text style={styles.statLabel}>Assignments</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalResources}</Text>
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
            {recentResources.length === 0 ? (
              <Text style={styles.noResources}>No resources available</Text>
            ) : (
              recentResources.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  style={styles.resourceCard}
                  onPress={() => Linking.openURL(resource.url)}
                >
                  <View style={styles.resourceHeader}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.className}>{resource.className}</Text>
                  </View>
                  {resource.description && (
                    <Text style={styles.resourceDescription} numberOfLines={2}>
                      {resource.description}
                    </Text>
                  )}
                  <Text style={styles.dateText}>
                    Added {resource.addedAt.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
        <StudentTabs activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </ProtectedRoute>
  );
}
