import { Text, TouchableOpacity, View } from 'react-native';
import { tabStyles as styles } from '../styles/components/tabs.styles';
import { TabProps } from '../types/navigation';

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'classes', label: 'Classes' },
  { key: 'resources', label: 'Resources' },
  { key: 'profile', label: 'Profile' },
];

export function StudentTabs({ activeTab, onTabPress }: TabProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab
          ]}
          onPress={() => onTabPress(tab.key)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
} 