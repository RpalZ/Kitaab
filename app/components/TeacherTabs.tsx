



import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { tabStyles as styles } from '../styles/components/tabs.styles';
import { TabProps } from '../types/navigation';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', route: '/teacher/dashboard' },
  { key: 'classes', label: 'Classes', route: '/teacher/classes' },
  { key: 'forum', label: 'Forum', route: '/teacher/forum' },
  { key: 'profile', label: 'Profile', route: '/teacher/profile' },
  { key: 'chat', label: 'Chat', route: '/teacher/chat' },
];

export  function TeacherTabs({ activeTab, onTabPress }: TabProps) {
  const router = useRouter();

  const handleTabPress = (tab: typeof tabs[0]) => {
    onTabPress(tab.key);
    router.replace(tab.route);
    // router.replace("/teacher/profile");
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
          onPress={() => handleTabPress(tab)}
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
