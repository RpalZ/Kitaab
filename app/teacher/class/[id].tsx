import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { COLORS } from "app/styles/theme";

// Sample data - in a real app, this would come from your backend
const sampleClassData = {
  1: {
    name: "Mathematics 101",
    students: [
      { id: 1, name: "John Doe", progress: 85, lastActive: "2024-03-15" },
      { id: 2, name: "Jane Smith", progress: 92, lastActive: "2024-03-14" },
      { id: 3, name: "Mike Johnson", progress: 78, lastActive: "2024-03-13" },
    ],
    resources: [
      { id: 1, name: "Algebra Basics.pdf", type: "PDF", uploadDate: "2024-03-10" },
      { id: 2, name: "Geometry Module", type: "Interactive", uploadDate: "2024-03-12" },
      { id: 3, name: "Practice Questions", type: "Quiz", uploadDate: "2024-03-14" },
    ]
  },
  2: {
    name: "Physics Basic",
    students: [
      { id: 1, name: "Alice Brown", progress: 88, lastActive: "2024-03-15" },
      { id: 2, name: "Bob Wilson", progress: 75, lastActive: "2024-03-14" },
    ],
    resources: [
      { id: 1, name: "Mechanics Introduction.pdf", type: "PDF", uploadDate: "2024-03-10" },
      { id: 2, name: "Forces Quiz", type: "Quiz", uploadDate: "2024-03-13" },
    ]
  },
  3: {
    name: "Chemistry Lab",
    students: [
      { id: 1, name: "Carol Davis", progress: 95, lastActive: "2024-03-15" },
      { id: 2, name: "David Miller", progress: 82, lastActive: "2024-03-14" },
    ],
    resources: [
      { id: 1, name: "Lab Safety Guide.pdf", type: "PDF", uploadDate: "2024-03-11" },
      { id: 2, name: "Periodic Table", type: "Interactive", uploadDate: "2024-03-13" },
    ]
  }
};

export default function ClassDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const classId = Array.isArray(id) ? id[0] : id;
  const classData = sampleClassData[Number(classId) as keyof typeof sampleClassData];

  if (!classData) {
    return (
      <View style={styles.container}>
        <Text>Class not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{classData.name}</Text>
      </View>

      <View style={styles.content}>
        {/* Students Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Students</Text>
          <ScrollView style={styles.studentList}>
            {classData.students.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={styles.studentCard}
                onPress={() => router.push(`/teacher/student/[id]`)}
              >
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentDetail}>Progress: {student.progress}%</Text>
                  <Text style={styles.studentDetail}>Last Active: {student.lastActive}</Text>
                </View>
                <View style={[styles.progressBar, { width: `${student.progress}%` }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => router.push(`/teacher/class/[id]/upload`)}
          >
            <Text style={styles.uploadButtonText}>Upload New Resource</Text>
          </TouchableOpacity>
          <FlatList
            data={classData.resources}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resourceCard}>
                <Text style={styles.resourceName}>{item.name}</Text>
                <View style={styles.resourceDetails}>
                  <Text style={styles.resourceType}>{item.type}</Text>
                  <Text style={styles.resourceDate}>Uploaded: {item.uploadDate}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text.primary,
  },
  studentList: {
    maxHeight: '50%',
  },
  studentCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  studentInfo: {
    zIndex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.text.primary,
  },
  studentDetail: {
    fontSize: 14,
    color: COLORS.text.secondary,
    opacity: 0.8,
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: `${COLORS.primary}20`,
    left: 0,
    top: 0,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  resourceCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: COLORS.text.primary,
  },
  resourceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceType: {
    fontSize: 14,
    color: COLORS.primary,
  },
  resourceDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    opacity: 0.8,
  },
});