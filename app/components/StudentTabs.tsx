import { Text, TouchableOpacity, View } from 'react-native';
import { tabStyles as styles } from '../styles/components/tabs.styles';
import { TabProps } from '../types/navigation';
import { useRouter } from "expo-router";

const tabs = [
  { key: "dashboard", label: "Dashboard", routes: "/teacher/dashboard" },
  { key: "classes", label: "Classes", routes: "/teacher/dashboard" },
  { key: "forum", label: "forum", routes: "/teacher/forum" },
  { key: "profile", label: "Profile", routes: "/teacher/dashboard" },
];

export function StudentTabs({ activeTab, onTabPress }: TabProps) {
  const router = useRouter();

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'profile') {
      router.push('/student/profile');
    } else if (tabKey === 'dashboard') {
      router.push('/student/dashboard');
    } else if (tabKey === 'classes') {
      router.push('/student/classes');
    } else if (tabKey === 'resources') {
      router.push('/student/resources');
    } else {
      onTabPress(tabKey);
    }
  };

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab
          ]}
          onPress={() => handleTabPress(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
