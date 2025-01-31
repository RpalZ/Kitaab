import { db, FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import {
  getAuth,
  signOut,
  updateProfile,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet, Linking } from "react-native";
import { SignOutModal } from "../components/profile/SignOutModal";
import { EditProfileModal } from "../components/profile/EditProfileModal";
import { TeacherTabs } from "../components/TeacherTabs";
import { profileStyles as styles } from "../styles/components/profile.styles";
import { secureStorage } from "../utils/secureStorage";
import { doc, setDoc } from "firebase/firestore";
import { ChangePasswordModal } from "../components/profile/ChangePasswordModal";

export default function TeacherProfile() {
  const user = FIREBASE_AUTH.currentUser;
  const userId = user?.uid; // Get the authenticated user's ID
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const handleSignOut = () => {
    signOut(FIREBASE_AUTH)
      .then(async () => {
        await secureStorage.removeItem("userToken");
        router.replace("/");
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to sign out");
        console.error(error);
      });
  };

  const handleSave = async (newName: string) => {
    try {
      if (!user) throw new Error("No user found");

      await updateProfile(user, { displayName: newName });
      console.log("Profile updated successfully!");
      setProfileVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        "Failed to update profile. Make sure your password is correct."
      );
    }
  };

  const handleContactUs = async () => {
    try {
      await Linking.openURL('https://linktr.ee/Kitaab_Hackathon');
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.[0].toUpperCase() || "No Username or Email"}
            </Text>
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setProfileVisible(true)}
          >
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setChangePasswordVisible(true)}
          >
            <Text style={styles.menuItemText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleContactUs}
          >
            <Text style={styles.menuItemText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => setSignOutVisible(true)}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <EditProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        onSave={(newName) => handleSave(newName)}
        initialEmail={email}
        initialName={name}
      />
      <SignOutModal
        visible={signOutVisible}
        onClose={() => setSignOutVisible(false)}
        onSignOut={() => {
          setSignOutVisible(false);
          handleSignOut();
        }}
      />

      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />

      <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}
