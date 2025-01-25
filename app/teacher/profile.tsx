import { db,FIREBASE_AUTH } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SignOutModal } from "../components/profile/SignOutModal";
import { EditProfileModal } from "../components/profile/EditProfileModal";
import { TeacherTabs } from "../components/TeacherTabs";
import { profileStyles as styles } from "../styles/components/profile.styles";
import { secureStorage } from "../utils/secureStorage";
import { doc, setDoc } from 'firebase/firestore';

export default function TeacherProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const user = FIREBASE_AUTH.currentUser;
  const userId = user?.uid; // Get the authenticated user's ID

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

  const handleSave = async (newName: string, newEmail: string) => {
          setName(newName);
          setEmail(newEmail);
          if (!userId) {
            console.error('User ID is missing');
            return;
          }   
      
          try {
            const userRef = doc(db, 'users', userId); // Reference to the user's document
            await setDoc(userRef, { name, email }, { merge: true }); // Updates doc or creates a new one if it doesnt exist
            console.log('Profile updated successfully!');
            setProfileVisible(false) // Close the modal after saving
          } catch (error) {
            console.error('Error updating profile:', error);
          }
        }; 


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.[0].toUpperCase() || 'No Username or Email'}
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
          onPress={() => setSignOutVisible(true)}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <EditProfileModal
          visible={profileVisible}
          onClose={() => setProfileVisible(false)}
          onSave={() => {handleSave}}
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
      
      <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
} 