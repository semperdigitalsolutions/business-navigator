import { type RouteConfig, index, route } from "@react-router/dev/routes";

import { layout } from "@react-router/dev/routes";

export default [
  layout("layouts/AppLayout.tsx", [
    index("routes/home.tsx"),
    route("/2ndPage", "routes/2ndPage.tsx"),
  ]),
] satisfies RouteConfig;

