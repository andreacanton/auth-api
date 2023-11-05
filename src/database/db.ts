import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("database.db");
export const sqliteDb = drizzle(sqlite);
