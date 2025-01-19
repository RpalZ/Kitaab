import { View } from "react-native";

export default {};

declare module "expo-router" {
  type RouteNames = {
    "/teacher/login": undefined;
    "/teacher/dashboard": undefined;
    "/student/login": undefined;
    "/student/dashboard": undefined;
    "/teacher/forum": undefined;
  };

  export type TypedNavigator<T> = T;
} 