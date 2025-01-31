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
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, updateDoc, onSnapshot, doc, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from "../styles/theme";
import { globalStyles } from 'app/styles/global';
import { Post, Comment, PostFile, Resource, TabType } from '../types/forum';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { PostDetailModal } from '../components/PostDetailModal';

export default function TeacherForum() {
  const [activeTab, setActiveTab] = useState<TabType>('resources');
  const [title, setTitle] = useState("title");
  const [desc, setDesc] = useState("description");
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerResult[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);
  const [isPostDetailModalVisible, setIsPostDetailModalVisible] = useState(false);

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
        createdAt: null
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

  // Fetch posts in real-time
  useEffect(() => {
    const q = query(collection(db, "teacher_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts: Post[] = [];
      snapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, []);

  // Fetch comments when a post is selected
  useEffect(() => {
    if (!selectedPost) return;

    const q = query(
      collection(db, "teacher_posts", selectedPost.id, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments: Comment[] = [];
      snapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(organizeComments(fetchedComments));
    });

    return () => unsubscribe();
  }, [selectedPost]);

  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const topLevel: Comment[] = [];

    // First pass: create map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into hierarchy
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies?.push(commentWithReplies);
        }
      } else {
        topLevel.push(commentWithReplies);
      }
    });

    return topLevel;
  };

  const handleCreatePost = async (
    title: string, 
    content: string, 
    selectedFiles: DocumentPicker.DocumentPickerResult[]
  ) => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) throw new Error('User not authenticated');

      const files = [];
      
      // Upload files if any
      for (const fileResult of selectedFiles) {
        if (!fileResult.assets?.[0]) continue;
        
        const asset = fileResult.assets[0];
        if (!asset.uri) {
          console.warn('Skipping file upload: missing URI');
          continue;
        }

        try {
          const fileName = asset.name || `file_${Date.now()}`;
          const fileRef = ref(storage, `teacher_posts/files/${fileName}`);
          
          const response = await fetch(asset.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          const blob = await response.blob();
          
          await uploadBytes(fileRef, blob);
          const downloadUrl = await getDownloadURL(fileRef);
          
          files.push({
            name: fileName,
            uri: downloadUrl,
            type: asset.mimeType || 'application/octet-stream',
          });
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          Alert.alert('Warning', `Failed to upload file: ${asset.name}`);
        }
      }

      const postData: Omit<Post, 'id'> = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous Teacher',
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
        files,
        commentCount: 0,
      };

      await addDoc(collection(db, "teacher_posts"), postData);
      setIsCreatePostModalVisible(false);
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (content: string, parentId: string | null = null) => {
    if (!selectedPost) return;
    
    setIsSubmitting(true);
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) throw new Error('User not authenticated');

      const commentData: Omit<Comment, 'id'> = {
        postId: selectedPost.id,
        parentId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous Teacher',
        content: content.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "teacher_posts", selectedPost.id, "comments"), commentData);
      
      // Update comment count
      const postRef = doc(db, "teacher_posts", selectedPost.id);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute requiredRole="teacher">
      <View style={styles.container}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
            onPress={() => setActiveTab('resources')}
          >
            <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>
              Resources
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Teacher Posts
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'resources' ? (
          // Resources Tab Content
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.primary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
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

            <ScrollView style={[styles.scrollContainer, globalStyles.scrollViewStyle]}>
              {filteredResources.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="document-outline" size={48} color={COLORS.text.secondary} />
                  <Text style={styles.emptyStateText}>
                    {searchQuery.length > 0 
                      ? "No resources found matching your search"
                      : "No resources available yet"}
                  </Text>
                </View>
              ) : (
                filteredResources.map((resource, index) => (
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
                        <Ionicons name="document-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.fileNameText}>{resource.file.name}</Text>
                      </View>
                    )}
                    <Text style={styles.dateText}>
                      {resource.createdAt?.toDate().toLocaleDateString() || ''}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
          </>
        ) : (
          // Posts Tab Content
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.primary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search posts..."
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

            <ScrollView style={[styles.scrollContainer, globalStyles.scrollViewStyle]}>
              {filteredPosts.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="chatbubbles-outline" size={48} color={COLORS.text.secondary} />
                  <Text style={styles.emptyStateText}>
                    {searchQuery.length > 0 
                      ? "No posts found matching your search"
                      : "No posts available yet"}
                  </Text>
                </View>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPress={() => {
                      setSelectedPost(post);
                      setIsPostDetailModalVisible(true);
                    }}
                  />
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsCreatePostModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
          </>
        )}

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
                style={[styles.input, isSubmitting && styles.disabledButton]}
                editable={!isSubmitting}
              />

              <Text style={styles.label}>Description of Resource</Text>
              <TextInput
                value={desc}
                onChangeText={(text) => setDesc(text)}
                style={[styles.input, styles.multilineInput, isSubmitting && styles.disabledButton]}
                multiline={true}
                numberOfLines={3}
                editable={!isSubmitting}
              />

              <TouchableOpacity
                style={[styles.filePickerButton, isSubmitting && styles.disabledButton]}
                onPress={pickDocument}
                disabled={isSubmitting}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                <Text style={styles.filePickerText}>
                  {selectedFile?.assets?.[0]?.name || "Choose a file"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.disabledButton]}
                onPress={() => addResource(title, desc)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.text.light} />
                ) : (
                  <Text style={styles.saveButtonText}>Add Resource</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedFile(null);
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Create Post Modal */}
        <CreatePostModal
          visible={isCreatePostModalVisible}
          onClose={() => setIsCreatePostModalVisible(false)}
          onSubmit={handleCreatePost}
          isSubmitting={isSubmitting}
        />

        {/* Post Detail Modal */}
        <PostDetailModal
          visible={isPostDetailModalVisible}
          onClose={() => {
            setIsPostDetailModalVisible(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          onAddComment={handleAddComment}
          isSubmitting={isSubmitting}
        />

        <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },
  
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.card.secondary,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },

  activeTabText: {
    color: COLORS.text.light,
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
