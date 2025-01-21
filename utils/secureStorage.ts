import * as SecureStore from "expo-secure-store";
export const secureStorage = {
  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Error storing value:", error);
    }
  },
  async getItem(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("Error retrieving value:", error);
      return null;
    }
  },
  async removeItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Error removing value:", error);
    }
  },
};
