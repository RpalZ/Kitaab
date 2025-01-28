import { db } from '@/FirebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from "app/styles/theme";
import { useLocalSearchParams2 } from "app/utils/uselocalSearchParams2";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, increment, onSnapshot, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu } from 'react-native-paper';
import { AddResourceModal } from '../../components/AddResourceModal';
import { AddStudentsModal } from '../../components/AddStudentsModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface ClassData {
  id: string;
  name: string;
  students: StudentData[];
  resources: ResourceData[];
  teacherId: string;
}

interface StudentData {
  id: string;
  name: string;
  progress: number;
  lastActive: string;
}

interface ResourceData {
  id: string;
  title: string;
  content?: string;
  type: 'PDF' | 'Image' | 'Note';
  file?: {
    url: string;
    filename: string;
    type: 'PDF' | 'Image';
  };
  uploadDate: string;
}

export default function ClassDetail() {
  const [activeTab, setActiveTab] = useState<'students' | 'resources'>('students');
  const params = useLocalSearchParams2<{id: string}>();
  const {id} = params;
  const [isAddStudentModalVisible, setIsAddStudentModalVisible] = useState(false);
  const [isAddResourceModalVisible, setIsAddResourceModalVisible] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showEditResource, setShowEditResource] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceData | undefined>(undefined);
  const [menuVisibleMap, setMenuVisibleMap] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (resourceId: string) => {
    setMenuVisibleMap(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
    }));
  };



  const handleDelete = async (resourceId: string) => {
    Alert.alert(
      "Delete Resource",
      "Are you sure you want to delete this resource?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              // Start a batch write
              const batch = writeBatch(db);

              // Delete the resource
              batch.delete(doc(db, 'classes', id, 'resources', resourceId));

              // Decrement the resources count
              batch.update(doc(db, 'classes', id), {
                resources: increment(-1)
              });

              await batch.commit();

              setMenuVisibleMap(prev => ({
                ...prev,
                [resourceId]: false
              }));
            } catch (error) {
              console.error('Error deleting resource:', error);
              Alert.alert('Error', 'Failed to delete resource');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (!id) return;

    const classRef = doc(db, 'classes', id);
    const studentsRef = collection(db, 'classes', id, 'students');
    const resourcesRef = collection(db, 'classes', id, 'resources');

    // Get class details
    const fetchClassData = async () => {
      try {
        const docSnap = await getDoc(classRef);
        if (docSnap.exists()) {
          setClassData({ id: docSnap.id, ...docSnap.data() } as ClassData);
        }
      } catch (error) {
        console.error('Error fetching class:', error);
      }
    };

    // Subscribe to students collection
    const unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
      const studentsData: StudentData[] = [];
      snapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() } as StudentData);
      });
      setStudents(studentsData);
    });

    // Subscribe to resources collection
    const unsubscribeResources = onSnapshot(resourcesRef, (snapshot) => {
      const resourcesData: ResourceData[] = [];
      snapshot.forEach((doc) => {
        resourcesData.push({ id: doc.id, ...doc.data() } as ResourceData);
      });
      setResources(resourcesData);
    });

    fetchClassData();
    setLoading(false);

    return () => {
      unsubscribeStudents();
      unsubscribeResources();
    };
  }, [id]);

  const renderStudentItem = ({ item: student }: { item: StudentData }) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => router.push(`/teacher/student/${student.id}`)}
    >
      <View style={styles.studentRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.name.split(' ').map((n) => n[0]).join('')}
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

  const renderResourceItem = ({ item }: { item: ResourceData }) => (
    <TouchableOpacity 
      style={styles.resourceItem}
      onPress={() => {
        if (item.file?.url) {
          Linking.openURL(item.file.url);
        }
      }}
    >
      <View style={styles.resourceHeader}>
        <MaterialIcons 
          name={
            item.type === 'PDF' ? 'picture-as-pdf' :
            item.type === 'Image' ? 'image' :
            'description'
          } 
          size={24} 
          color={COLORS.text.primary} 
        />
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Menu
          visible={menuVisibleMap[item.id] || false}
          onDismiss={() => toggleMenu(item.id)}
          anchor={
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => toggleMenu(item.id)}
            >
              <MaterialIcons name="more-vert" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          }
        >
          <Menu.Item 
            onPress={() => {
              toggleMenu(item.id);
              setShowEditResource(true);
              setResourceToEdit(item);
            }} 
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item 
            onPress={() => handleDelete(item.id)}
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
      </View>

      {item.content && (
        <Text style={styles.resourceContent} numberOfLines={3}>
          {item.content}
        </Text>
      )}

      <View style={styles.resourceFooter}>
        <Text style={styles.resourceDate}>
          {new Date(item.uploadDate).toLocaleDateString()}
        </Text>
        {item.file && (
          <Text style={styles.resourceFilename}>
            {item.file.filename}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

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
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddStudents(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.text.light} />
              <Text style={styles.addButtonText}>Add Students</Text>
            </TouchableOpacity>
            <FlatList
              data={students}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddResource(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.text.light} />
              <Text style={styles.addButtonText}>Add Resource</Text>
            </TouchableOpacity>
            <FlatList
              data={resources}
              renderItem={renderResourceItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resourceList}
            />
          
          </>
        )}
      </View>

      <AddStudentsModal
        visible={showAddStudents}
        onClose={() => setShowAddStudents(false)}
        classId={id as string}
      />

      <AddResourceModal
        visible={showAddResource || showEditResource}
        onClose={() => {
          setShowAddResource(false);
          setShowEditResource(false);
          setResourceToEdit(undefined);
        }}
        classId={id as string}
        resourceToEdit={resourceToEdit}
      />
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: COLORS.text.light,
    marginLeft: 8,
    fontWeight: '500',
  },
  resourceList: {
    padding: 16,
  },
  resourceItem: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  resourceContent: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginBottom: 12,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceDate: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  resourceFilename: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  menuButton: {
    padding: 8,
    marginLeft: 'auto',
  },
});