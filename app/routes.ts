export default {};

declare module "expo-router" {
  type RouteNames = {
    "/teacher/login": undefined;
    "/teacher/dashboard": undefined;
    "/student/login": undefined;
    "/student/dashboard": undefined;
  };

  export type TypedNavigator<T> = T;
} 