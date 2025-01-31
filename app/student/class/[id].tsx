import { db } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssignmentViewModal } from '../../components/AssignmentViewModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface ClassData {
  id: string;
  name: string;
  subject: string;
  teacherName: string;
}

interface ResourceData {
  id: string;
  title: string;
  description: string;
  url: string;
  addedAt: Date;
}

interface AssignmentData {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  totalPoints: number;
  status: 'pending' | 'completed' | 'late';
  file?: {
    url: string;
    filename: string;
    type: string;
  };
  resources?: Array<{
    id: string;
    title: string;
    description?: string;
    url: string;
  }>;
}

export default function StudentClassDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentData | null>(null);
  const [activeTab, setActiveTab] = useState<'assignments' | 'resources'>('assignments');

  useEffect(() => {
    if (!id) return;

    setLoading(true); // Set loading at the start

    const classRef = doc(db, 'classes', id as string);
    const resourcesRef = collection(db, 'classes', id as string, 'resources');
    const assignmentsRef = collection(db, 'classes', id as string, 'assignments');

    let unsubscribeResources: () => void;
    let unsubscribeAssignments: () => void;

    // Get class details and set up listeners
    const initialize = async () => {
      try {
        // Get class details
        const docSnap = await getDoc(classRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const teacherDoc = await getDoc(doc(db, 'users', data.teacherId));
          const teacherData = teacherDoc.data();
          
          setClassData({
            id: docSnap.id,
            name: data.name,
            subject: data.subject,
            teacherName: teacherData?.displayName || teacherData?.email?.split('@')[0] || 'Teacher'
          });
        }

        // Subscribe to resources
        unsubscribeResources = onSnapshot(resourcesRef, (snapshot) => {
          const resourcesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || 'Untitled Resource',
              description: data.description || '',
              url: data.url || '',
              addedAt: data.addedAt?.toDate() || new Date()
            };
          });
          setResources(resourcesData);
        });

        // Subscribe to assignments
        unsubscribeAssignments = onSnapshot(assignmentsRef, async (snapshot) => {
          try {
            const assignmentsData = await Promise.all(snapshot.docs.map(async doc => {
              const data = doc.data();
              console.log('Assignment data:', JSON.stringify(data, null, 2));

              return {
                id: doc.id,
                title: data.title || 'Untitled Assignment',
                description: data.description || '',
                dueDate: data.dueDate?.toDate() || new Date(),
                totalPoints: data.totalPoints || 0,
                status: data.status || 'pending',
                file: data.file,
                // Get resources directly from the assignment document
                resources: data.resources?.map((resource: any) => ({
                  id: resource.id,
                  title: resource.title,
                  description: resource.description,
                  url: resource.url
                })) || []
              };
            }));
            
            console.log('Processed assignments:', JSON.stringify(assignmentsData, null, 2));
            setAssignments(assignmentsData);
          } catch (error) {
            console.error('Error processing assignments:', error);
          }
        });

      } catch (error) {
        console.error('Error initializing class data:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      if (unsubscribeResources) unsubscribeResources();
      if (unsubscribeAssignments) unsubscribeAssignments();
    };
  }, [id]);

  const renderResourceItem = ({ item }: { item: ResourceData }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => {
        if (!item.url) {
          alert('Resource URL not available');
          return;
        }
        Linking.openURL(item.url);
      }}
    >
      <Text style={styles.resourceTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <Text style={styles.dateText}>
        Added {item.addedAt.toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderAssignmentItem = ({ item }: { item: AssignmentData }) => (
    <TouchableOpacity
      style={[styles.assignmentCard]}
      onPress={() => {
        console.log('Selected assignment resources:', item.resources); // Debug log
        setSelectedAssignment(item);
      }}
    >
      <Text style={styles.assignmentTitle}>{item.title}</Text>
      <Text style={styles.assignmentDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.assignmentFooter}>
        <Text style={styles.dueDate}>
          Due: {item.dueDate.toLocaleDateString()}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'completed' ? COLORS.success : 
                           item.status === 'late' ? COLORS.error : 
                           COLORS.warning }
        ]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
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
          <Text style={styles.className}>Class not found</Text>
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
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={COLORS.text.primary} 
          />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.className}>{classData?.name}</Text>
          <Text style={styles.teacherName}>Teacher: {classData?.teacherName}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
            Assignments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>
            Resources
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'assignments' ? (
        <FlatList
          data={assignments}
          renderItem={renderAssignmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={resources}
          renderItem={renderResourceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedAssignment && (
        <AssignmentViewModal
          visible={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          assignment={{
            ...selectedAssignment,
            classId: id as string
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 45 : 0,
    padding: 16,
    backgroundColor: COLORS.card.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.card.primary,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text.light,
  },
  listContainer: {
    padding: 16,
  },
  resourceCard: {
    backgroundColor: COLORS.card.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  assignmentCard: {
    backgroundColor: COLORS.card.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.text.light,
    fontSize: 12,
    fontWeight: '500',
  },
}); 