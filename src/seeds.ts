import { db } from "./db";
import * as schema from "./schema";

await db.insert(schema.users).values([
  {
    email: "andreacanton@duck.com",
    passwordHash: Bun.password.hashSync("Password01!"),
  },
]);

console.log(`Seeding complete.`);
