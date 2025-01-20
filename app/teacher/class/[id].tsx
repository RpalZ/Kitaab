import { COLORS } from "app/styles/theme";
import { useLocalSearchParams2 } from "app/utils/uselocalSearchParams2";
import { useRouter } from "expo-router";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';


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
  const [activeTab, setActiveTab] = useState<'students' | 'resources'>('students');
  const params = useLocalSearchParams2<{id: string}>();
  const {id} = params;
  console.log(params, "params");
  const router = useRouter();
  const classId = Array.isArray(id) ? id[0] : id;
  console.log(id, "id");
  console.log(classId, "classId");
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
          onPress={() => router.push('/teacher/dashboard')}
        >
          <Text style={styles.backButtonText}>← Back </Text>
        </TouchableOpacity>
        <Text style={styles.title}>{classData.name}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>Students</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>Resources</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'students' ? (
          <View style={styles.section}>
            <FlatList
              data={classData.students}
              renderItem={({ item: student }) => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.studentCard}
                  onPress={() => router.push(`/teacher/student/[id]`)}
                >
                  <View style={styles.studentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${student.progress}%` }]} />
                        <Text style={styles.progressText}>{student.progress}% Complete</Text>
                      </View>
                      <Text style={styles.studentDetail}>
                        Completed {Math.round(student.progress / 100 * 12)} of 12 modules
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(student) => student.id.toString()}
            />
          </View>
        ) : (
          <View style={styles.section}>
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
                  <View style={styles.resourceRow}>
                    <MaterialCommunityIcons
                      name={
                        item.type === 'PDF' ? 'file-document-outline' :
                        item.type === 'Interactive' ? 'play-circle-outline' :
                        'clipboard-list-outline' // for Quiz/Assignment types
                      }
                      size={24}
                      color={COLORS.text.secondary}
                      style={styles.resourceIcon}
                    />
                    <View style={styles.resourceContent}>
                      <Text style={styles.resourceName}>{item.name}</Text>
                      <View style={styles.resourceDetails}>
                        <Text style={styles.resourceType}>{item.type}</Text>
                        <Text style={styles.resourceDate}>Uploaded: {item.uploadDate}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.card.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text.primary,
  },
  studentCard: {
    backgroundColor: COLORS.card.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 120,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  progressContainer: {
    height: 24,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  progressText: {
    position: 'absolute',
    right: 10,
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 24,
  },
  studentDetail: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  resourceCard: {
    backgroundColor: COLORS.card.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 100,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  resourceContent: {
    flex: 1,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    color: COLORS.text.primary,
  },
  resourceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resourceType: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  resourceDate: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
});