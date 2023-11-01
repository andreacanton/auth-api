import { Elysia } from "elysia";

interface User {
  user_id?: number;
  email: string;
  password: string;
}

const app = new Elysia()
  .get("/", () => {
    return { message: "Authentication API" };
  })
  .post("/register", (req) => {
    const user = req.body as User;
    // save user
    const savedUser: User = {
      user_id: 1,
      email: "test@email.com",
      password: "[MASKED]",
    };
    return { message: "User Registered", user: savedUser };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
