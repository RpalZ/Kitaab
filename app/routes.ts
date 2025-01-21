
export default {};

declare module "expo-router" {
  type RouteNames = {
    "/teacher/login": undefined;
    "/teacher/dashboard": undefined;
    "/teacher/profile": undefined;
    "/student/login": undefined;
    "/student/dashboard": undefined;
    "/teacher/forum": undefined;
    "/teacher/class/[id]": { id: string };
    "/teacher/chat": undefined;
  };

  export type TypedNavigator<T> = T;
} 