import { db, storage } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, increment, updateDoc, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { GestureResponderEvent, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

type AddResourceModalProps = {
  visible: boolean;
  onClose: () => void;
  classId: string;
  resourceToEdit?: ResourceData;
};

// ... previous imports and interfaces stay the same ...

export function AddResourceModal({ visible, onClose, classId, resourceToEdit }: AddResourceModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    blob?: Blob;
  } | null>(null);

  useEffect(() => {
    if (resourceToEdit) {
      setTitle(resourceToEdit.title);
      setContent(resourceToEdit.content || '');
      if (resourceToEdit.file) {
        setSelectedFile({
          uri: resourceToEdit.file.url,
          name: resourceToEdit.file.filename,
          type: resourceToEdit.file.type === 'PDF' ? 'application/pdf' : 'image/jpeg'
        });
      }
    } else {
      setTitle('');
      setContent('');
      setSelectedFile(null);
    }
  }, [resourceToEdit, visible]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf'
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      alert('Failed to pick document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images','livePhotos','videos'],
        quality: 1,
        allowsEditing: false,
        base64: true
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const base64Response = await fetch(`data:image/jpeg;base64,${result.assets[0].base64}`);
        const blob = await base64Response.blob();
        
        setSelectedFile({
          uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
          blob
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setUploading(true);
    try {
      let fileData: ResourceData['file'] | null = null;
      
      if (selectedFile) {
        // Only upload new file if it's different from the existing one
        if (!resourceToEdit?.file || selectedFile.uri !== resourceToEdit.file.url) {
          const blob = selectedFile.blob || await (await fetch(selectedFile.uri)).blob();
          const fileRef = ref(storage, `classes/${classId}/resources/${selectedFile.name}`);
          const uploadTask = await uploadBytes(fileRef, blob);
          const downloadUrl = await getDownloadURL(uploadTask.ref);
          
          fileData = {
            url: downloadUrl,
            filename: selectedFile.name,
            type: selectedFile.type.includes('pdf') ? 'PDF' : 'Image'
          };
        } else {
          fileData = resourceToEdit.file;
        }
      }

      const resourceData = {
        title: title.trim(),
        content: content.trim(),
        type: fileData?.type || 'Note',
        ...(fileData && { file: fileData }),
        uploadDate: new Date().toISOString()
      };

      // Start a batch write
      const batch = writeBatch(db);

      if (resourceToEdit) {
        // Update existing resource
        await updateDoc(doc(db, 'classes', classId, 'resources', resourceToEdit.id), resourceData);
      } else {
        // Add new resource and increment count
        await addDoc(collection(db, 'classes', classId, 'resources'), resourceData);
        await updateDoc(doc(db, 'classes', classId), {
        resources: increment(1)})
      }

      await batch.commit();

      setTitle('');
      setContent('');
      setSelectedFile(null);
      onClose();
    } catch (error: any) {
      console.error('Error details:', error);
      alert(`${resourceToEdit ? 'Update' : 'Upload'} failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {resourceToEdit ? 'Edit Resource' : 'Add Resource'}
            </Text>
            
            <TextInput
              style={[styles.input, styles.titleInput]}
              placeholder="Resource Title"
              placeholderTextColor={COLORS.text.secondary}
              value={title}
              onChangeText={setTitle}
              autoFocus={!resourceToEdit}
              returnKeyType="next"
              enablesReturnKeyAutomatically
            />

            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Content (optional)"
              placeholderTextColor={COLORS.text.secondary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.pickButton}
                onPress={pickDocument}
                disabled={uploading}
              >
                <MaterialIcons name="file-upload" size={24} color={COLORS.text.light} />
                <Text style={styles.buttonText}>Pick Document</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.pickButton}
                onPress={pickImage}
                disabled={uploading}
              >
                <MaterialIcons name="photo" size={24} color={COLORS.text.light} />
                <Text style={styles.buttonText}>Pick Image</Text>
              </TouchableOpacity>
            </View>

            {selectedFile && (
              <View style={styles.filePreview}>
                <Text style={styles.filePreviewText} numberOfLines={1}>
                  Selected: {selectedFile.name}
                </Text>
                <TouchableOpacity 
                  onPress={() => setSelectedFile(null)}
                  style={styles.removeFileButton}
                >
                  <MaterialIcons name="close" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}

            {uploading ? (
              <Text style={styles.uploadingText}>Uploading...</Text>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {resourceToEdit ? 'Update Resource' : 'Add Resource'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={uploading}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: COLORS.card.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  titleInput: {
    height: 48,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  pickButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '500',
  },
  uploadingText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: 8,
    marginBottom: 20,
  },
  filePreviewText: {
    flex: 1,
    color: COLORS.text.primary,
    marginRight: 8,
  },
  removeFileButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
});