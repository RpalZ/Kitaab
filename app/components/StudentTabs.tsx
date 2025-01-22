import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { tabStyles as styles } from "../styles/components/tabs.styles";
import { TabProps } from "../types/navigation";

const tabs = [
  { key: "dashboard", label: "Dashboard", routes: "/student/dashboard" },
  { key: "classes", label: "Classes", routes: "/student/dashboard" },
  { key: "forum", label: "forum", routes: "/student/forum" },
  { key: "profile", label: "Profile", routes: "/student/dashboard" },
];

export default function StudentTabs({ activeTab, onTabPress }: TabProps) {
  const router = useRouter();

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => {
            onTabPress(tab.key);
            router.push(tab.routes);
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
