import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherTabs } from "../components/TeacherTabs";
import { dashboardStyles as styles } from "../styles/components/forum.styles";
import { db, storage } from "../../FirebaseConfig";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage} from "firebase/storage";
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

type Resource = { 
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
      throw new Error('Title is required');
    }
  
    try {
      let fileUrl = null;
      let fileData= null;
      
      const resource: Resource = {
        title: title.trim(),
        description: desc.trim(),
      };
      const docRef = await addDoc(collection(db, "posts"), {
        ...resource,
        createdAt: serverTimestamp(),
      });
      const postId = docRef.id;


      // Check if a file is selected
      if (selectedFile?.assets?.[0]) {
        const file = selectedFile.assets[0];
        
        // Validate file
        if (!file.uri) {
          throw new Error('Invalid file: missing URI');
        }
        
  
        // Generate a unique filename to prevent collisions
        const fileName = file.name || `unnamed_file_${Date.now()}`;
        const fileRef = ref(storage, `posts/${postId}/files/${fileName}`);
  
        try {
          const response = await fetch(file.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          const blob = await response.blob();
          
          const uploadTask = await uploadBytes(fileRef, blob);
          console.log('Upload successful:', uploadTask);
            
          const downloadUrl = await getDownloadURL(uploadTask.ref);
          console.log('Download URL:', downloadUrl);
  
          // Prepare file data
          fileData = {
            name: fileName,
            uri: fileUrl,
            type: file.mimeType || 'application/octet-stream',
          };

          await updateDoc(docRef, {
            file: fileData});
        } catch (error) {
          throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
  
      
  
      // Only update state if database operation succeeded
      setResources([...resources, { ...resource}]);
      setTitle("");
      setDesc("");
      setSelectedFile(null);
      setIsModalVisible(false);
  
      return docRef.id;
    } catch (error) {
      console.error("Error adding resource:", error);
      throw error; // Re-throw to let caller handle the error
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

  return (
    <ProtectedRoute requiredRole="teacher">
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          {resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceButton}
              onPress={() =>
                downloadFile(resource.file?.uri || "", resource.file?.name || "")
              }
            >
              <Text style={styles.titleTextStyle}>{resource.title}</Text>
              <Text style={styles.textStyle}>{resource.description}</Text>
              {resource.file && (
                <View style={styles.fileContainer}>
                  <Ionicons name="document-outline" size={20} color="#666" />
                  <Text style={styles.fileNameText}>{resource.file.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
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
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.label}>Title of Resource</Text>
              <TextInput
                value={title}
                onChangeText={(text) => setTitle(text)}
                style={styles.input}
              />

              <Text style={styles.label}>Description of Resource</Text>
              <TextInput
                value={desc}
                onChangeText={(text) => setDesc(text)}
                style={styles.input}
                multiline={true}
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={pickDocument}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                <Text style={styles.filePickerText}>
                  {selectedFile?.assets?.[0]?.name || "Choose a file"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => addResource(title, desc)}
              >
                <Text style={styles.saveButtonText}>Add Resource</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedFile(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </ProtectedRoute>
  );
}
