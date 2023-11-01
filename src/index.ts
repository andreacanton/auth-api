import { Elysia } from "elysia";
import { router } from "./routes";

export const app = new Elysia().use(router).listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
