import { LoginRequest, LoginResponse } from "../auth/LoginUser";
import { beforeAll, describe, expect, it, test } from "bun:test";
import { faker } from "@faker-js/faker";

import {
  RegisterUserRequest,
  RegisterUserResponse,
} from "../auth/RegisterUser";
import { app } from "../index";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { memoryDb } from "../database/memoryDb";

describe("Authentication API e2e", () => {
  beforeAll(async () => {
    migrate(memoryDb, { migrationsFolder: "./drizzle" });
  });
  it("should salute", async () => {
    const expectedResponse = { message: "Authentication API" };

    const response = await app
      .handle(new Request("http://localhost:3000/"))
      .then(async (res) => await res.json());

    expect(response).toEqual(expectedResponse);
  });
  it("shoud register and login", async () => {
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const registerRequest: RegisterUserRequest =
      testUser as RegisterUserRequest;
    const registerResponse: RegisterUserResponse = await app
      .handle(
        new Request("http://localhost:3000/register", {
          method: "POST",
          body: JSON.stringify(registerRequest),
        })
      )
      .then(async (res) => await res.json());
    const loginRequest: LoginRequest = testUser as LoginRequest;
    const loginResponse: LoginResponse = await app
      .handle(
        new Request("http://localhost:3000/login", {
          method: "POST",
          body: JSON.stringify(loginRequest),
        })
      )
      .then(async (res) => await res.json());
    expect(registerResponse.email).toBe(registerRequest.email);
    expect(registerResponse.userId).toBeNumber();
    expect(loginResponse.access).toBeString();
    expect(loginResponse.refresh).toBeString();
  });
});
