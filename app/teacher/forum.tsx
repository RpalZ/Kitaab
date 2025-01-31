import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform
} from "react-native";
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherTabs } from "../components/TeacherTabs";
import { dashboardStyles } from "../styles/components/forum.styles";
import { db, storage } from "../../FirebaseConfig";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage} from "firebase/storage";
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from "../styles/theme";

type Resource = {
  createdAt: any; 
  id?:string;
  title: string;
  description: string;
  file?: {
    name: string;
    uri: string;
    type: string;
  };
};

export default function TeacherForum() {
  const [activeTab, setActiveTab] = useState("forum");
  const [title, setTitle] = useState("title");
  const [desc, setDesc] = useState("description");
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // all file types
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile(result);
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const addResource = async (title: string, desc: string) => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
  
    setIsSubmitting(true);
    try {
      let fileUrl = null;
      let fileData = null;
      
      const resource: Resource = {
        title: title.trim(),
        description: desc.trim(),
        createdAt: undefined
      };

      const docRef = await addDoc(collection(db, "posts"), {
        ...resource,
        createdAt: serverTimestamp(),
      });
      const postId = docRef.id;

      // Check if a file is selected
      if (selectedFile?.assets?.[0]) {
        const file = selectedFile.assets[0];
        
        if (!file.uri) {
          throw new Error('Invalid file: missing URI');
        }
        
        const fileName = file.name || `unnamed_file_${Date.now()}`;
        const fileRef = ref(storage, `posts/${postId}/files/${fileName}`);
  
        try {
          const response = await fetch(file.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          const blob = await response.blob();
          
          const uploadTask = await uploadBytes(fileRef, blob);
          const downloadUrl = await getDownloadURL(uploadTask.ref);
  
          fileData = {
            name: fileName,
            uri: downloadUrl,
            type: file.mimeType || 'application/octet-stream',
          };

          await updateDoc(docRef, {
            file: fileData
          });
        } catch (error) {
          throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
  
      setResources([...resources, { ...resource }]);
      setTitle("");
      setDesc("");
      setSelectedFile(null);
      setIsModalVisible(false);
      
      // Show success alert
      if (Platform.OS === 'web') {
        alert('Resource has been uploaded successfully!');
      } else {
        Alert.alert(
          'Success',
          'Resource has been uploaded successfully!',
          [{ text: 'OK' }]
        );
      }
  
      return docRef.id;
    } catch (error) {
      console.error("Error adding resource:", error);
      if (Platform.OS === 'web') {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        Alert.alert(
          'Error',
          `${error instanceof Error ? error.message : 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };


  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
  
      const posts = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        let fileData = data.file || null;
  
        // If there's a file, get its download URL
        if (fileData) {
          try {
            const storage = getStorage();
            const fileRef = ref(storage, `posts/${doc.id}/files/${fileData.name}`);
            const downloadUrl = await getDownloadURL(fileRef);
            
            // Update the file data with the fresh download URL
            fileData = {
              ...fileData,
              uri: downloadUrl
            };
          } catch (fileError) {
            console.error(`Error getting download URL for file in post ${doc.id}:`, fileError);
            // Keep the original file data if we fail to get the download URL
          }
        }
  
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          file: fileData,
          createdAt: data.createdAt,
        };
      }));
  
      return posts;
    } catch (error) {
      console.error("Error fetching posts: ", error);
      return [];
    }
  };  

  const downloadFile = async (fileUri: string, fileName: string) => {
      if (Platform.OS === 'web') {
        try {
          // Had to resort to opening windows due to CORS issue blocking downloads
          window.open(fileUri, '_blank');
        } catch (error) {
          console.error('Download failed:', error);
          throw error;
        }
        
        }
      else {
        try {
          await WebBrowser.openBrowserAsync(fileUri);
        } catch (error) {
          console.error('Error opening file:', error);
        }
      }
    
  };

  const deleteResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
  };

  useEffect(()=>{
    const getPosts = async () => {
      const posts = await fetchPosts();
      setResources(posts);  // Store fetched posts in the state
    };

    getPosts();
  }, []);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute requiredRole="teacher">
      <View style={localStyles.container}>
        <View style={localStyles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.primary} style={localStyles.searchIcon} />
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.text.secondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={localStyles.scrollContainer}>
          {filteredResources.length === 0 ? (
            <View style={localStyles.emptyStateContainer}>
              <Ionicons name="document-outline" size={48} color={COLORS.text.secondary} />
              <Text style={localStyles.emptyStateText}>
                {searchQuery.length > 0 
                  ? "No resources found matching your search"
                  : "No resources available yet"}
              </Text>
            </View>
          ) : (
            filteredResources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                style={localStyles.resourceButton}
                onPress={() =>
                  downloadFile(resource.file?.uri || "", resource.file?.name || "")
                }
              >
                <Text style={localStyles.titleTextStyle}>{resource.title}</Text>
                <Text style={localStyles.textStyle}>{resource.description}</Text>
                {resource.file && (
                  <View style={localStyles.fileContainer}>
                    <Ionicons name="document-outline" size={20} color={COLORS.primary} />
                    <Text style={localStyles.fileNameText}>{resource.file.name}</Text>
                  </View>
                )}
                <Text style={localStyles.dateText}>
                  {resource.createdAt?.toDate().toLocaleDateString() || ''}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          style={localStyles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={localStyles.modalContainer}>
            <View style={localStyles.modalContent}>
              <Text style={localStyles.label}>Title of Resource</Text>
              <TextInput
                value={title}
                onChangeText={(text) => setTitle(text)}
                style={[localStyles.input, isSubmitting && localStyles.disabledButton]}
                editable={!isSubmitting}
              />

              <Text style={localStyles.label}>Description of Resource</Text>
              <TextInput
                value={desc}
                onChangeText={(text) => setDesc(text)}
                style={[localStyles.input, localStyles.multilineInput, isSubmitting && localStyles.disabledButton]}
                multiline={true}
                numberOfLines={3}
                editable={!isSubmitting}
              />

              <TouchableOpacity
                style={[localStyles.filePickerButton, isSubmitting && localStyles.disabledButton]}
                onPress={pickDocument}
                disabled={isSubmitting}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                <Text style={localStyles.filePickerText}>
                  {selectedFile?.assets?.[0]?.name || "Choose a file"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[localStyles.saveButton, isSubmitting && localStyles.disabledButton]}
                onPress={() => addResource(title, desc)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.text.light} />
                ) : (
                  <Text style={localStyles.saveButtonText}>Add Resource</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[localStyles.cancelButton, isSubmitting && localStyles.disabledButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedFile(null);
                }}
                disabled={isSubmitting}
              >
                <Text style={localStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </ProtectedRoute>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.primary,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  searchIcon: {
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    padding: 0,
  },

  scrollContainer: {
    flex: 1,
    padding: 16,
  },

  resourceButton: {
    backgroundColor: COLORS.card.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  titleTextStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },

  textStyle: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 12,
    lineHeight: 22,
  },

  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  fileNameText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },

  dateText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'right',
  },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },

  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    backgroundColor: COLORS.card.primary,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: Platform.OS === 'web' ? 500 : '95%',
    margin: Platform.OS === 'web' ? 0 : 20,
  },

  label: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 8,
    fontWeight: '500',
  },

  input: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 16,
    color: COLORS.text.primary,
    fontSize: 16,
    width: '100%',
  },

  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },

  filePickerText: {
    marginLeft: 8,
    color: COLORS.text.secondary,
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },

  saveButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '500',
  },

  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },

  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  disabledButton: {
    opacity: 0.5,
  },
});
