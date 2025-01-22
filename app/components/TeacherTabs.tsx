



import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { tabStyles as styles } from '../styles/components/tabs.styles';
import { TabProps } from '../types/navigation';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', route: '/teacher/dashboard' },
  { key: 'classes', label: 'Classes', route: '/teacher/classes' },
  { key: 'forum', label: 'Forum', route: '/teacher/forum' },
  { key: 'chat', label: 'Chat', route: '/teacher/chat' },
  { key: 'profile', label: 'Profile', route: '/teacher/profile' },
];

export  function TeacherTabs({ activeTab, onTabPress }: TabProps) {
  const router = useRouter();

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'profile') {
      router.push('/teacher/profile');
    } else if (tabKey === 'dashboard') {
      router.push('/teacher/dashboard');
    } else if (tabKey === 'classes') {
      router.push('/teacher/classes');
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
          onPress={() => router.push(tab.route)}
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
