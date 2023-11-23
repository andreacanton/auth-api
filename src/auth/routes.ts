import Elysia, { t } from "elysia";
import { RegisterUserRequest, RegisterUserResponse } from "./RegisterUser";
import { LoginRequest, LoginResponse } from "./LoginUser";
import * as schema from "../schema";
import { setupDb } from "../database/setup";
import { eq } from "drizzle-orm";
import { addDays, addMinutes, getTime, getUnixTime } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import jwt from "./jwt";
import bearer from "@elysiajs/bearer";

interface JWTClaims {
  email: string;
  sub: string;
}

export const authRoutes = new Elysia()
  .use(setupDb)
  .use(jwt({ secret: Bun.env.JWT_SECRET!, exp: "15m" }))
  .use(bearer())
  .get("/", () => {
    return { message: "Authentication API" };
  })
  .post(
    "/register",
    async ({ body, set, db }) => {
      const request = body as RegisterUserRequest;
      const userExists = await db
        .select({
          email: schema.users.email,
        })
        .from(schema.users)
        .where(eq(schema.users.email, request.email))
        .limit(1);
      if (userExists.length > 0) {
        set.status = 400;
        return { message: `user with ${userExists[0].email} already exists` };
      }
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
      const usersFound = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, req.email))
        .limit(1);
      if (usersFound.length === 0) {
        set.status = 401;
        return { message: "user not found" };
      }
      const user = usersFound[0];
      const isValidPassword = await Bun.password.verify(
        req.password,
        user.passwordHash
      );
      if (!isValidPassword) {
        set.status = 401;
        return { message: "wrong credentials" };
      }
      const now = new Date();

      const accessToken = await jwt.sign({
        email: user.email,
        iss: "auth.api.com",
        sub: user.userId.toString(),
      });
      const expireRefresh = addDays(now, 14);
      const refreshToken = uuidv4();

      await db.insert(schema.userSessions).values({
        sessionId: refreshToken,
        userId: user.userId,
        createdAt: now.toISOString(),
        expiresAt: expireRefresh.toISOString(),
      });
      await db
        .update(schema.users)
        .set({
          lastAccess: now.toISOString(),
        })
        .where(eq(schema.users.userId, user.userId));

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
  )
  .post("/refresh-token", async ({ set, bearer, jwt, db }) => {})
  .get(
    "/profile",
    async ({ set, bearer, jwt, db }) => {
      const claims = await jwt.verify(bearer);
      if (!claims) {
        set.status = 401;
        return { message: "authorization required" };
      }
      const userId = claims.sub ?? "";
      const usersFound = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.userId, parseInt(userId.toString())))
        .limit(1);
      let user = usersFound[0] as Partial<schema.User>;
      delete user.passwordHash;
      return user;
    },
    {
      type: "application/json",
      response: {
        200: t.Any(),
        401: t.Any(),
      },
    }
  );
