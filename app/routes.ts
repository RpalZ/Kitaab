export default {};

declare module "expo-router" {
  type RouteNames = {
    "/teacher/login": undefined;
    "/teacher/dashboard": undefined;
    "/student/login": undefined;
    "/student/dashboard": undefined;
    "/teacher/class/[id]": undefined;
  };

  export type TypedNavigator<T> = T;
} 