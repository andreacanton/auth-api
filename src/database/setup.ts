import Elysia from "elysia";
import { sqliteDb } from "./db";
import { memoryDb } from "./memoryDb";

let database = sqliteDb;
if (process.env.NODE_ENV === "test") {
  database = memoryDb;
}

export const setupDb = new Elysia().decorate("db", database);
