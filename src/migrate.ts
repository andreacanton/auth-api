import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { sqliteDb } from "./db";
await migrate(sqliteDb, { migrationsFolder: "./drizzle" });
