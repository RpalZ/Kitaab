import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { TeacherTabs } from "../components/TeacherTabs";
import { COLORS } from "../styles/theme";
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual API calls in production
const mockClasses = [
  {
    id: 1,
    name: "Mathematics 101",
    students: 25,
    averageProgress: 75,
    nextClass: "2024-03-20",
    pendingAssignments: 3
  },
  {
    id: 2,
    name: "Physics Basic",
    students: 18,
    averageProgress: 82,
    nextClass: "2024-03-22",
    pendingAssignments: 1
  },
  {
    id: 3,
    name: "Chemistry Lab",
    students: 22,
    averageProgress: 68,
    nextClass: "2024-03-21",
    pendingAssignments: 2
  }
];

export default function TeacherClasses() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("classes");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Classes</Text>
          <TouchableOpacity style={styles.addButton}>
            <MaterialIcons name="add" size={24} color={COLORS.text.light} />
            <Text style={styles.addButtonText}>Create Class</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.classesContainer}>
          {mockClasses.map((classItem) => (
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
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {classItem.pendingAssignments} pending
                  </Text>
                </View>
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
                    style={[
                      styles.progressFill,
                      { width: `${classItem.averageProgress}%` }
                    ]} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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