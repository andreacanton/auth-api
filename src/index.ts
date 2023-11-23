import { Elysia } from "elysia";
import { authRoutes } from "./auth/routes";
export const app = new Elysia().use(authRoutes).listen(Bun.env.PORT ?? 3000);
export const baseUrl = new URL(
  `${Bun.env.PROTOCOL}://${app.server?.hostname}${
    app.server?.port ? ":" + app.server?.port : ""
  }`
);

console.log(`🦊 Elysia is running at ${baseUrl}`);
