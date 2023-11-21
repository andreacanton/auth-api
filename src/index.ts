import { Elysia } from "elysia";
import { authRoutes } from "./auth/routes";

export const app = new Elysia().use(authRoutes).listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
