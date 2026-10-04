// Applies prisma/migrations/*/migration.sql to the Turso database named by
// TURSO_DATABASE_URL, tracking applied migrations in _turso_migrations.
// `prisma migrate deploy` can't talk to libSQL URLs, hence this script.
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync, existsSync } from "fs";
import path from "path";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.log("TURSO_DATABASE_URL not set, skipping Turso migrations.");
  process.exit(0);
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const migrationsDir = path.resolve("prisma/migrations");

await db.execute(
  "CREATE TABLE IF NOT EXISTS _turso_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)"
);
const applied = new Set(
  (await db.execute("SELECT name FROM _turso_migrations")).rows.map((r) => r.name)
);

const names = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(migrationsDir, d.name, "migration.sql")))
  .map((d) => d.name)
  .sort();

for (const name of names) {
  if (applied.has(name)) continue;
  console.log(`Applying migration ${name}`);
  const sql = readFileSync(path.join(migrationsDir, name, "migration.sql"), "utf8");
  await db.executeMultiple(sql);
  await db.execute({
    sql: "INSERT INTO _turso_migrations (name, applied_at) VALUES (?, ?)",
    args: [name, new Date().toISOString()],
  });
}

console.log("Turso migrations up to date.");
db.close();
