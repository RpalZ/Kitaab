import { db } from '@/FirebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from "app/styles/theme";
import { useLocalSearchParams2 } from "app/utils/uselocalSearchParams2";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, increment, onSnapshot, Timestamp, writeBatch } from 'firebase/firestore';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu } from 'react-native-paper';
import { AddAssignmentModal } from '../../components/AddAssignmentModal';
import { AddResourceModal } from '../../components/AddResourceModal';
import { AddStudentsModal } from '../../components/AddStudentsModal';
import { AlertDialog } from '../../components/AlertDialog';
import { AssignmentDetailModal } from '../../components/AssignmentDetailModal';
import { EditAssignmentModal } from '../../components/EditAssignmentModal';
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
  overallProgress: number;
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

interface Assignment {
  id: string;
  title: string;
  description: string;
  totalPoints: number;
  dueDate: Timestamp;
  status: string;
  createdAt: Timestamp;
  type: string;
  file?: {
    url: string;
    filename: string;
    type: 'PDF' | 'Image';
  };
}

export default function ClassDetail() {
  const [activeTab, setActiveTab] = useState<'students' | 'resources' | 'assignments'>('students');
  const params = useLocalSearchParams2<{id: string}>();
  const {id} = params;
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
  const [deleteAlert, setDeleteAlert] = useState({
    visible: false,
    resourceId: ''
  });
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
  const [showDeleteAssignmentAlert, setShowDeleteAssignmentAlert] = useState(false);
  const [showEditAssignment, setShowEditAssignment] = useState(false);

  const toggleMenu = (resourceId: string) => {
    setMenuVisibleMap(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
    }));
  };

  const handleDelete = async (resourceId: string) => {
    setDeleteAlert({
      visible: true,
      resourceId
    });
  };

  const confirmDelete = async () => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'classes', id, 'resources', deleteAlert.resourceId));
      batch.update(doc(db, 'classes', id), {
        resources: increment(-1)
      });
      await batch.commit();

      setMenuVisibleMap(prev => ({
        ...prev,
        [deleteAlert.resourceId]: false
      }));
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    } finally {
      setDeleteAlert({ visible: false, resourceId: '' });
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToEdit) return;

    try {
      const batch = writeBatch(db);
      
      // Delete the assignment document
      batch.delete(doc(db, 'classes', id, 'assignments', assignmentToEdit.id));

      // If there's a file, delete it from storage
      if (assignmentToEdit.file?.url) {
        const storage = getStorage();
        const fileRef = ref(storage, assignmentToEdit.file.url);
        await deleteObject(fileRef);
      }

      await batch.commit();
      setShowDeleteAssignmentAlert(false);
      setAssignmentToEdit(null);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    }
  };

  useEffect(() => {
    if (!id) return;

    const classRef = doc(db, 'classes', id);
    const studentsRef = collection(db, 'classes', id, 'students');
    const resourcesRef = collection(db, 'classes', id, 'resources');
    const assignmentsRef = collection(db, 'classes', id, 'assignments');

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

    // Subscribe to assignments collection
    const unsubscribeAssignments = onSnapshot(assignmentsRef, (snapshot) => {
      const assignmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Assignment[];
      setAssignments(assignmentsData);
    });

    fetchClassData();
    setLoading(false);

    return () => {
      unsubscribeStudents();
      unsubscribeResources();
      unsubscribeAssignments();
    };
  }, [id]);

  const renderStudentItem = ({ item: student }: { item: StudentData }) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => router.push(`/teacher/student/${student.id}?classId=${id}`)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentEmail}>{student.lastActive}</Text>
      </View>
      <View style={styles.studentProgress}>
        <Text style={styles.progressText}>
          {student.overallProgress}%
        </Text>
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={COLORS.text.secondary} 
        />
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
            leadingIcon={() => <MaterialIcons name="edit" size={24} color={COLORS.text.primary} />}
          />
          <Menu.Item 
            onPress={() => handleDelete(item.id)}
            title="Delete"
            leadingIcon={() => <MaterialIcons name="delete" size={24} color={COLORS.error} />}
            titleStyle={{ color: COLORS.error }}
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
        <TouchableOpacity
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
            Students
          </Text>
        </TouchableOpacity>
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
        ) : activeTab === 'assignments' ? (
          <>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddAssignment(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.text.light} />
              <Text style={styles.addButtonText}>Add Assignment</Text>
            </TouchableOpacity>
            <FlatList
              data={assignments}
              renderItem={({ item: assignment }) => (
                <TouchableOpacity
                  style={styles.assignmentCard}
                  onPress={() => !menuVisibleMap[assignment.id] && setSelectedAssignment(assignment)}
                >
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <Menu
                      visible={menuVisibleMap[assignment.id] || false}
                      onDismiss={() => toggleMenu(assignment.id)}
                      anchor={
                        <TouchableOpacity 
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleMenu(assignment.id);
                          }}
                          style={styles.menuButton}
                        >
                          <MaterialIcons name="more-vert" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                      }
                    >
                      <Menu.Item 
                        onPress={() => {
                          toggleMenu(assignment.id);
                          setAssignmentToEdit(assignment);
                          setShowEditAssignment(true);
                        }} 
                        title="Edit" 
                        leadingIcon={() => <MaterialIcons name="edit" size={24} color={COLORS.text.primary} />}
                      />
                      <Menu.Item 
                        onPress={() => {
                          toggleMenu(assignment.id);
                          setAssignmentToEdit(assignment);
                          setShowDeleteAssignmentAlert(true);
                        }} 
                        title="Delete" 
                        leadingIcon={() => <MaterialIcons name="delete" size={24} color={COLORS.error} />}
                        titleStyle={{ color: COLORS.error }}
                      />
                    </Menu>
                  </View>
                  {assignment.description && (
                    <Text 
                      style={styles.assignmentDescription}
                      numberOfLines={2}
                    >
                      {assignment.description}
                    </Text>
                  )}
                  <Text style={styles.assignmentDueDate}>
                    Due: {assignment.dueDate.toDate().toLocaleDateString()}
                  </Text>
                  {assignment.file && (
                    <View style={styles.fileIndicator}>
                      <MaterialIcons 
                        name={assignment.file.type === 'PDF' ? 'picture-as-pdf' : 'image'} 
                        size={16} 
                        color={COLORS.text.secondary} 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
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

      <AddAssignmentModal
        visible={showAddAssignment}
        onClose={() => {
          setShowAddAssignment(false);
          setAssignmentToEdit(null);
        }}
        classId={id}
        assignmentToEdit={assignmentToEdit}
      />

      <AlertDialog
        visible={deleteAlert.visible}
        title="Delete Resource"
        message="Are you sure you want to delete this resource?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteAlert({ visible: false, resourceId: '' })}
      />

      {selectedAssignment && (
        <AssignmentDetailModal
          visible={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          assignment={selectedAssignment}
          onEdit={() => {
            setAssignmentToEdit(selectedAssignment);
            setSelectedAssignment(null);
            setShowAddAssignment(true);
          }}
          onDelete={() => {
            setShowDeleteAssignmentAlert(true);
          }}
        />
      )}

      <AlertDialog
        visible={showDeleteAssignmentAlert}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={handleDeleteAssignment}
        onCancel={() => {
          setShowDeleteAssignmentAlert(false);
          setAssignmentToEdit(null);
        }}
      />

      {assignmentToEdit && (
        <EditAssignmentModal
          visible={showEditAssignment}
          onClose={() => {
            setShowEditAssignment(false);
            setAssignmentToEdit(null);
          }}
          classId={id}
          assignment={assignmentToEdit}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  studentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
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
  assignmentCard: {
    backgroundColor: COLORS.card.primary,
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  assignmentPoints: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  assignmentDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  assignmentDueDate: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  fileIndicator: {
    marginLeft: 'auto',
  },
});