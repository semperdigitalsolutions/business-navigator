import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"), // Updated to use the new landing page
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("home", "routes/home.tsx"),
  route("onboarding", "routes/onboarding.tsx"), // Add the new onboarding route
  route("module/:moduleId", "routes/module.tsx"), // Dynamic route for module details
  route("pricing", "routes/pricing.tsx"),
  route("2ndPage", "routes/2ndPage.tsx"),
  route("profile", "routes/profile.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("tos", "routes/tos.tsx"),
  route("legal-registration", "routes/legal-registration.tsx"),
  // Add other planned routes here if necessary
] satisfies RouteConfig;
