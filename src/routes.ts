import Elysia, { t } from "elysia";
import { RegisterUserRequest, RegisterUserResponse } from "./dto/RegisterUser";
import { LoginResponse } from "./dto/LoginUser";

export const router = new Elysia()
  .get("/", () => {
    return { message: "Authentication API" };
  })
  .post(
    "/register",
    ({ body }) => {
      const request = body as RegisterUserRequest;
      const savedUser: RegisterUserResponse = {
        userId: 1,
        email: request.email,
      };
      return savedUser;
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
    ({ body }) => {
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
