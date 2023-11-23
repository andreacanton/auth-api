import { baseUrl } from "./../index";
import { LoginRequest, LoginResponse } from "../auth/LoginUser";
import { afterEach, beforeAll, describe, expect, it, test } from "bun:test";
import { faker } from "@faker-js/faker";
import {
  RegisterUserRequest,
  RegisterUserResponse,
} from "../auth/RegisterUser";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { memoryDb } from "../database/memoryDb";
import { User, users } from "../schema";
import Elysia from "elysia";
import { authRoutes } from "../auth/routes";

const app = new Elysia().use(authRoutes).listen(Bun.env.PORT ?? 3000);
const registerUrl = new URL("/register", baseUrl);
const loginUrl = new URL("/login", baseUrl);
const profileUrl = new URL("/profile", baseUrl);

describe("Authentication API e2e", () => {
  beforeAll(async () => {
    migrate(memoryDb, { migrationsFolder: "./drizzle" });
  });
  afterEach(async () => {
    await memoryDb.delete(users);
  });
  it("should salute", async () => {
    const expectedResponse = { message: "Authentication API" };
    const response = await app
      .handle(new Request(baseUrl.href))
      .then(async (res) => await res.json());
    expect(response).toEqual(expectedResponse);
  });
  it("should register and login", async () => {
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const registerRequest: RegisterUserRequest =
      testUser as RegisterUserRequest;
    const registerResponse: RegisterUserResponse = await app
      .handle(
        new Request(registerUrl.href, {
          method: "POST",
          body: JSON.stringify(registerRequest),
        })
      )
      .then(async (res) => await res.json());
    const loginRequest: LoginRequest = testUser as LoginRequest;
    const loginResponse: LoginResponse = await app
      .handle(
        new Request(loginUrl.href, {
          method: "POST",
          body: JSON.stringify(loginRequest),
        })
      )
      .then(async (res) => await res.json());

    const profileResponse = await app.handle(
      new Request(profileUrl.href, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loginResponse.access}`,
        },
      })
    );
    const profile = (await profileResponse.json()) as Partial<User>;
    expect(registerResponse.email).toBe(registerRequest.email);
    expect(registerResponse.userId).toBeNumber();
    expect(loginResponse.access).toBeString();
    expect(loginResponse.refresh).toBeString();
    expect(profileResponse.status).toBe(200);
    expect(profile.passwordHash).toBeUndefined();
  });

  it("already registered email shouldn't have to register", async () => {
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const registerRequest: RegisterUserRequest =
      testUser as RegisterUserRequest;
    // first registration
    await app.handle(
      new Request(registerUrl.href, {
        method: "POST",
        body: JSON.stringify(registerRequest),
      })
    );
    const response: Response = await app.handle(
      new Request(registerUrl.href, {
        method: "POST",
        body: JSON.stringify(registerRequest),
      })
    );
    expect(response.status).toBe(400);
  });
  it("unregistered user shouldn't login", async () => {
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const loginRequest: LoginRequest = testUser as LoginRequest;
    const response: Response = await app.handle(
      new Request(loginUrl.href, {
        method: "POST",
        body: JSON.stringify(loginRequest),
      })
    );
    expect(response.status).toBe(401);
  });

  it("shouldn't login if password is wrong", async () => {
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const registerRequest: RegisterUserRequest =
      testUser as RegisterUserRequest;
    const registerResponse: RegisterUserResponse = await app
      .handle(
        new Request(registerUrl.href, {
          method: "POST",
          body: JSON.stringify(registerRequest),
        })
      )
      .then(async (res) => await res.json());
    const loginRequest: LoginRequest = testUser as LoginRequest;
    loginRequest.password = faker.internet.password();
    const loginResponse: Response = await app.handle(
      new Request(loginUrl.href, {
        method: "POST",
        body: JSON.stringify(loginRequest),
      })
    );
    expect(loginResponse.status).toBe(401);
  });
});
