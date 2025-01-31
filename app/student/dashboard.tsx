import { useRouter } from "expo-router";
import { useState , useEffect} from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ProtectedRoute } from '../components/ProtectedRoute';
import { StudentTabs } from "../components/StudentTabs";
import { dashboardStyles as styles } from "../styles/components/dashboard.styles";
import { FIREBASE_AUTH } from "@/FirebaseConfig";


export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;
    setUserEmail(user.email);
    setDisplayName(user.displayName || user.email?.split("@")[0] || "Student");
  }, []);
    
  return (
    <ProtectedRoute requiredRole="student">
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome, {displayName}!</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4</Text>
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
            {[
              "Mathematics 101",
              "Physics Basic",
              "Chemistry Lab",
              "English Literature",
            ].map((className, index) => (
              <TouchableOpacity key={index} style={styles.card}>
                <Text style={styles.className}>{className}</Text>
                <View style={styles.classDetails}>
                  <Text style={styles.classInfo}>2 new resources</Text>
                  <Text style={styles.classTeacher}>Mr. Smith</Text>
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
