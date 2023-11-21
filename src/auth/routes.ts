import Elysia, { t } from "elysia";
import { RegisterUserRequest, RegisterUserResponse } from "./RegisterUser";
import { LoginRequest, LoginResponse } from "./LoginUser";
import * as schema from "../schema";
import { setup } from "../database/setup";
import { eq } from "drizzle-orm";
import { addDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import jwt from "./jwt";

export const authRoutes = new Elysia()
  .use(setup)
  .use(jwt({ secret: Bun.env.JWT_SECRET! }))
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
    async ({ body: request, db, set, jwt, params }) => {
      const req = request as LoginRequest;
      const selectResults = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, req.email))
        .limit(1);
      const user = selectResults[0];
      const isValidPassword = await Bun.password.verify(
        req.password,
        user.passwordHash
      );
      if (!isValidPassword) {
        set.status = 401;
        return { message: "wrong credentials" };
      }
      const accessToken = await jwt.sign({
        sub: user.userId.toString(),
        email: user.email,
      });
      const now = new Date();
      const expire = addDays(now, 14);
      const refreshToken = uuidv4();

      await db.insert(schema.userSessions).values({
        sessionId: refreshToken,
        userId: user.userId,
        createdAt: now.toISOString(),
        expiresAt: expire.toISOString(),
      });

      return {
        access: accessToken,
        refresh: refreshToken,
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
