import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from "app/styles/theme";
import { useLocalSearchParams2 } from "app/utils/uselocalSearchParams2";
import { useRouter } from "expo-router";
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AddStudentModal } from '../../components/AddStudentModal';
import { AddResourceModal } from '../../components/AddResourceModal';

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
      { id: 2, name: "Geometry Module", type: "PowerPoint", uploadDate: "2024-03-12" },
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
  const router = useRouter();
  const classId = Array.isArray(id) ? id[0] : id;
  const [classData, setClassData] = useState(sampleClassData[Number(classId) as keyof typeof sampleClassData]);
  const [isAddStudentModalVisible, setIsAddStudentModalVisible] = useState(false);
  const [isAddResourceModalVisible, setIsAddResourceModalVisible] = useState(false);

  const handleAddStudent = (email: string) => {
    const newStudent = {
      id: classData.students.length + 1,
      name: email.split('@')[0], // Placeholder name from email
      email,
      progress: 0,
      lastActive: "N/A",
    };
    setClassData({
      ...classData,
      students: [...classData.students, newStudent],
    });
  };

  const handleAddResource = (resource: any) => {
    const newResource = {
      id: classData.resources.length + 1,
      ...resource,
    };
    setClassData({
      ...classData,
      resources: [...classData.resources, newResource],
    });
  };

  if (!classData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.title}>Class not found</Text>
        </View>
      </View>
    );
  }

  const renderStudentItem = ({ item: student } : any) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => router.push(`/teacher/student/${student.id}`)}
    >
      <View style={styles.studentRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.name.split(' ').map((n: string[]) => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${student.progress}%` }]} />
            <Text style={styles.progressText}>{student.progress}%</Text>
          </View>
          <Text style={styles.lastActive}>Last active: {student.lastActive}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderResourceItem = ({ item } :any) => (
    <TouchableOpacity style={styles.resourceCard}>
      <View style={styles.resourceRow}>
        <MaterialCommunityIcons
          name={
            item.type === 'PDF' ? 'file-pdf-box' :
            item.type === 'Quiz' ? 'clipboard-text' :
            item.type === 'PowerPoint' ? 'microsoft-powerpoint' :
            'clipboard-text'
          }
          size={32}
          color={COLORS.primary}
        />
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceName}>{item.name}</Text>
          <Text style={styles.resourceMeta}>
            {item.type} • {item.uploadDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
        </TouchableOpacity>
        <Text style={styles.title}>{classData.name}</Text>
      </View>

      <View style={styles.tabContainer}>
        {['students', 'resources'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as 'students' | 'resources')}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'students' ? (
          <>
            <FlatList
              data={classData.students}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsAddStudentModalVisible(true)}
            >
              <Text style={styles.addButtonText}>Add Student</Text>
            </TouchableOpacity>
            <AddStudentModal
              visible={isAddStudentModalVisible}
              onClose={() => setIsAddStudentModalVisible(false)}
              onAddStudent={handleAddStudent}
            />
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsAddResourceModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.text.light} />
              <Text style={styles.addButtonText}>Add Resource</Text>
            </TouchableOpacity>
            <FlatList
              data={classData.resources}
              renderItem={renderResourceItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
            <AddResourceModal
              visible={isAddResourceModalVisible}
              onClose={() => setIsAddResourceModalVisible(false)}
              onAddResource={handleAddResource}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.light,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card.secondary,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text.light,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  listContainer: {
    gap: 10,
    paddingBottom: 20,
  },
  studentCard: {
    backgroundColor: COLORS.card.primary,
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: COLORS.text.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  progressContainer: {
    height: 6,
    backgroundColor: COLORS.card.secondary,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  lastActive: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  addButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resourceCard: {
    backgroundColor: COLORS.card.primary,
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  resourceMeta: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});