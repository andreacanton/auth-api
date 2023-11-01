import { LoginRequest, LoginResponse } from "./../dto/LoginUser";
import { describe, expect, it } from "bun:test";
import { app } from "../index";
import { RegisterUserRequest, RegisterUserResponse } from "../dto/RegisterUser";

describe("Authentication API e2e", () => {
  it("should salute", async () => {
    const expectedResponse = { message: "Authentication API" };

    const response = await app
      .handle(new Request("http://localhost:3000/"))
      .then(async (res) => await res.json());

    expect(response).toEqual(expectedResponse);
  });
  it("should register", async () => {
    const request: RegisterUserRequest = {
      email: "email@test.com",
      password: "Password!23",
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
      email: "email@test.com",
      password: "Password!23",
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
