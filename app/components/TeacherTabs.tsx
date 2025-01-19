import { Text, TouchableOpacity, View } from "react-native";
import { tabStyles as styles } from "../styles/components/tabs.styles";
import { useRouter } from "expo-router";
import { TabProps } from "../types/navigation";

const tabs = [
  { key: "dashboard", label: "Dashboard", route: "app/teacher/dashboard.tsx" },
  { key: "classes", label: "Classes", route: "app/teacher/dashboard.tsx" },
  { key: "forum", label: "Forum", route: "app/teacher/forum.tsx" },
  { key: "profile", label: "Profile", route: "app/teacher/dashboard.tsx" },
];

export default function TeacherTabs({ activeTab, onTabPress }: TabProps) {
  const router = useRouter();

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => {
            onTabPress(tab.key);            
          }}
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
