import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CreateClassModal } from "../components/CreateClassModal";
import { TeacherTabs } from "../components/TeacherTabs";
import { dashboardStyles as styles } from "../styles/components/dashboard.styles";

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [classes, setClasses] = useState([
    { id: "1", name: "Mathematics 101", students: 15, resources: 4 },
    { id: "2", name: "Physics Basic", students: 15, resources: 4 },
    { id: "3", name: "Chemistry Lab", students: 15, resources: 4 },
  ]);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const handleCreateClass = (classData: {
    name: string;
    subject: string;
    students: Array<{ id: string; name: string; email: string }>;
  }) => {
    const newClass = {
      id: (classes.length + 1).toString(),
      name: `${classData.subject}: ${classData.name}`,
      students: classData.students.length,
      resources: 0,
    };
    setClasses([...classes, newClass]);
  };

  return (
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
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
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
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Add Resource</Text>
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
  );
}
