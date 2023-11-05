import Elysia, { t } from "elysia";
import { RegisterUserRequest, RegisterUserResponse } from "./auth/RegisterUser";
import { LoginResponse } from "./auth/LoginUser";
import * as schema from "./schema";
import { setup } from "./database/setup";

export const router = new Elysia()
  .use(setup)
  .get("/", () => {
    return { message: "Authentication API" };
  })
  .post(
    "/register",
    async ({ body, db }) => {
      const request = body as RegisterUserRequest;
      const passwordHash = await Bun.password.hash(request.password);
      const savedUsers = await db
        .insert(schema.users)
        .values({
          email: request.email,
          passwordHash,
        })
        .returning();
      const user = savedUsers[0];
      return {
        userId: user.userId,
        email: user.email,
      } as RegisterUserResponse;
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      type: "application/json",
    }
  )
  .post(
    "/login",
    ({ body, db }) => {
      return {
        access: "aspidjfbpaiskdhjbfasd",
        refresh: "asdfasdfasdfasdfa",
      } as LoginResponse;
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      type: "application/json",
      response: {
        200: t.Object({
          access: t.String(),
          refresh: t.String(),
        }),
        401: t.Any(),
      },
    }
  );
