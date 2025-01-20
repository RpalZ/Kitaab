import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SignOutModal } from "../components/SignOutModal";
import { TeacherTabs } from "../components/TeacherTabs";
import { profileStyles as styles } from "../styles/components/profile.styles";
import { secureStorage } from "../utils/secureStorage";

export default function TeacherProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [modalVisible, setModalVisible] = useState(false);
  const user = FIREBASE_AUTH.currentUser;

  const handleSignOut = () => {
    signOut(FIREBASE_AUTH)
      .then(async () => {
        await secureStorage.removeItem('userToken');
        router.replace('/');
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to sign out');
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.[0].toUpperCase() || 'T'}
            </Text>
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help Center</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <SignOutModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSignOut={() => {
          setModalVisible(false);
          handleSignOut();
        }}
      />
      
      <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
} 