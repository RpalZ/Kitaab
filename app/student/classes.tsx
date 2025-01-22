import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StudentTabs } from "../components/StudentTabs";
import { COLORS } from "../styles/theme";

//placeholder stuff
const mockClasses = [
  {
    id: 1,
    name: "Mathematics 101",
    teacher: "Dr. Sarah Johnson",
    assignmentsDue: 3,
    nextDeadline: "2024-03-20",
    progress: 75
  },
  {
    id: 2,
    name: "Physics Basic",
    teacher: "Prof. Michael Chen",
    assignmentsDue: 1,
    nextDeadline: "2024-03-22",
    progress: 82
  },
  {
    id: 3,
    name: "Chemistry Lab",
    teacher: "Dr. Emily Brown",
    assignmentsDue: 2,
    nextDeadline: "2024-03-21",
    progress: 68
  }
];

export default function StudentClasses() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("classes");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Classes</Text>
        </View>

        <View style={styles.classesContainer}>
          {mockClasses.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={styles.classCard}
              onPress={() => router.push(`/student/class/${classItem.id}`)}
            >
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classItem.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {classItem.assignmentsDue} due
                  </Text>
                </View>
              </View>

              <View style={styles.teacherInfo}>
                <MaterialIcons name="person" size={16} color={COLORS.text.secondary} />
                <Text style={styles.teacherName}>{classItem.teacher}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>Course Progress</Text>
                  <Text style={styles.progressPercentage}>{classItem.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${classItem.progress}%` }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.deadlineInfo}>
                <MaterialIcons name="event" size={16} color={COLORS.text.secondary} />
                <Text style={styles.deadlineText}>
                  Next deadline: {classItem.nextDeadline}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <StudentTabs activeTab={activeTab} onTabPress={setActiveTab} />
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  classesContainer: {
    gap: 16,
  },
  classCard: {
    backgroundColor: COLORS.card.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 120,  // Match teacher's card height
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
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: 8,
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
    height: 24,  // Match teacher's progress bar height
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
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
}); 