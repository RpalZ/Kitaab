import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
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

type Resource = {
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

  const addResource = (title: string, desc: string) => {
    const resource: Resource = {
      title,
      description: desc,
      file: selectedFile?.assets?.[0]
        ? {
            name: selectedFile.assets[0].name,
            uri: selectedFile.assets[0].uri,
            type: selectedFile.assets[0].mimeType || "*/*",
          }
        : undefined,
    };

    setResources([...resources, resource]);
    setTitle("");
    setDesc("");
    setSelectedFile(null);
    setIsModalVisible(false);
  };

  const downloadFile = async (fileUri: string, fileName: string) => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); 
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      alert("Download Complete");
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(`error: ${error}`);
    }
  };

  const deleteResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
  };

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
