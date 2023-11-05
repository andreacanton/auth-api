import { LoginRequest, LoginResponse } from "../auth/LoginUser";
import { beforeAll, describe, expect, it } from "bun:test";
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
  it("should register", async () => {
    const request: RegisterUserRequest = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const response: RegisterUserResponse = await app
      .handle(
        new Request("http://localhost:3000/register", {
          method: "POST",
          body: JSON.stringify(request),
        })
      )
      .then(async (res) => await res.json());
    expect(response.email).toBe(request.email);
    expect(response.userId).toBeNumber();
  });
  it("should login", async () => {
    const request: LoginRequest = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const response: LoginResponse = await app
      .handle(
        new Request("http://localhost:3000/login", {
          method: "POST",
          body: JSON.stringify(request),
        })
      )
      .then(async (res) => await res.json());
    expect(response.access).toBeString();
    expect(response.refresh).toBeString();
  });
});
