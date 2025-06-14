import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/2ndPage", "routes/2ndPage.tsx")
] satisfies RouteConfig;

