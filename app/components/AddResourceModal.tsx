import { db, FIREBASE_AUTH, storage } from '@/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { collection, doc, increment, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


interface ResourceData {
  id: string;
  title: string;
  content?: string;
  type: 'PDF' | 'Image' | 'Video' | 'Note';
  file?: {
    url: string;
    filename: string;
    type: 'PDF' | 'Image' | 'Video';
  };
  uploadDate: string;
}

type AddResourceModalProps = {
  visible: boolean;
  onClose: () => void;
  classId: string;
  resourceToEdit?: ResourceData;
};

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
          type: resourceToEdit.file.type === 'PDF' ? 'application/pdf' :
                resourceToEdit.file.type === 'Image' ? 'image/jpeg' : 'video/mp4'
        });
      }
    }
  }, [resourceToEdit]);

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

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setSelectedFile({
          uri,
          name: `video_${Date.now()}.mp4`,
          type: 'video/mp4'
        });
      }
    } catch (error) {
      console.error('Error picking video:', error);
      alert('Failed to pick video');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!FIREBASE_AUTH.currentUser) {
      alert('You must be logged in to upload resources');
      return;
    }

    setUploading(true);
    try {
      let fileData: ResourceData['file'] | null = null;
      
      if (selectedFile) {
        if (!resourceToEdit?.file || selectedFile.uri !== resourceToEdit.file.url) {
          const blob = selectedFile.blob || await (await fetch(selectedFile.uri)).blob();
          const fileRef = ref(storage, `classes/${classId}/resources/${selectedFile.name}`);
          
          try {
            const uploadTask = await uploadBytes(fileRef, blob);
            console.log('Upload successful:', uploadTask);
            
            const downloadUrl = await getDownloadURL(uploadTask.ref);
            console.log('Download URL:', downloadUrl);
            
            fileData = {
              url: downloadUrl,
              filename: selectedFile.name,
              type: selectedFile.type.includes('video') ? 'Video' :
                    selectedFile.type.includes('pdf') ? 'PDF' : 'Image'
            };
          } catch (uploadError: any) {
            console.error('Upload error details:', {
              code: uploadError.code,
              message: uploadError.message,
              serverResponse: uploadError.serverResponse
            });
            throw uploadError;
          }
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
        batch.update(doc(db, 'classes', classId, 'resources', resourceToEdit.id), resourceData);
      } else {
        const resourceRef = doc(collection(db, 'classes', classId, 'resources'));
        batch.set(resourceRef, resourceData);
        batch.update(doc(db, 'classes', classId), {
          resources: increment(1)
        });
      }

      await batch.commit();

      setTitle('');
      setContent('');
      setSelectedFile(null);
      onClose();
    } catch (error: any) {
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        serverResponse: error.serverResponse,
        stack: error.stack
      });
      alert(`${resourceToEdit ? 'Update' : 'Upload'} failed: ${error.message} | ${error.code}`);
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
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Resource</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Resource Title"
            placeholderTextColor={COLORS.text.secondary}
            value={title}
            onChangeText={setTitle}
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
              <Text style={styles.buttonText}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pickButton}
              onPress={pickImage}
              disabled={uploading}
            >
              <MaterialIcons name="photo" size={24} color={COLORS.text.light} />
              <Text style={styles.buttonText}>Image</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pickButton}
              onPress={pickVideo}
              disabled={uploading}
            >
              <MaterialIcons name="videocam" size={24} color={COLORS.text.light} />
              <Text style={styles.buttonText}>Video</Text>
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
              <Text style={styles.submitButtonText}>Add Resource</Text>
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

        {/* Add a touchable backdrop to dismiss keyboard and modal */}
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
     
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  pickButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    color: COLORS.text.light,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,  // This will make the backdrop fill the entire screen
    zIndex: -1,  // This ensures the backdrop stays behind the modal content
  },
});
; 

