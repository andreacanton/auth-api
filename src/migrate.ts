import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { sqliteDb } from "./database/db";
await migrate(sqliteDb, { migrationsFolder: "./drizzle" });
