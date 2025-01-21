import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { StudentTabs } from "../components/StudentTabs";
import { COLORS } from "../styles/theme";
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data - replace with actual API calls in production
const mockResources = [
  {
    id: 1,
    name: "Algebra Basics.pdf",
    type: "PDF",
    uploadDate: "2024-03-10",
    class: "Mathematics 101",
    downloads: 24
  },
  {
    id: 2,
    name: "Geometry Module",
    type: "Interactive",
    uploadDate: "2024-03-12",
    class: "Mathematics 101",
    downloads: 18
  },
  {
    id: 3,
    name: "Practice Questions",
    type: "Quiz",
    uploadDate: "2024-03-14",
    class: "Mathematics 101",
    downloads: 32
  },
  {
    id: 4,
    name: "Lab Safety Guide.pdf",
    type: "PDF",
    uploadDate: "2024-03-11",
    class: "Chemistry Lab",
    downloads: 45
  },
  {
    id: 5,
    name: "Forces Quiz",
    type: "Quiz",
    uploadDate: "2024-03-13",
    class: "Physics Basic",
    downloads: 28
  }
];

export default function StudentResources() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("resources");

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'file-document-outline';
      case 'Interactive':
        return 'play-circle-outline';
      case 'Quiz':
        return 'clipboard-list-outline';
      default:
        return 'file-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
      </View>

      <FlatList
        data={mockResources}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resourceCard}>
            <View style={styles.resourceRow}>
              <MaterialCommunityIcons
                name={getResourceIcon(item.type)}
                size={24}
                color={COLORS.text.secondary}
                style={styles.resourceIcon}
              />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceName}>{item.name}</Text>
                <Text style={styles.className}>{item.class}</Text>
                <View style={styles.resourceDetails}>
                  <Text style={styles.resourceType}>{item.type}</Text>
                  <Text style={styles.resourceDate}>Added: {item.uploadDate}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <StudentTabs activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  resourceCard: {
    backgroundColor: COLORS.card.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 100,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  resourceContent: {
    flex: 1,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.text.primary,
  },
  className: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  resourceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resourceType: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  resourceDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
}); 