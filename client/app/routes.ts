import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("welcome/welcome.tsx"), // Handles the '/' path
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("home", "routes/home.tsx"),
  route("2ndPage", "routes/2ndPage.tsx"),
  route("profile", "routes/profile.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("tos", "routes/tos.tsx"),
  route("legal-registration", "routes/legal-registration.tsx"),
  // Add other planned routes here if necessary
] satisfies RouteConfig;
