#!/usr/bin/env node
// Apply every supabase/migrations/*.sql file in order, tracking which have
// been applied via a _migrations table. Idempotent — running twice does
// nothing the second time.
//
// Usage:
//   node --env-file=.env.local scripts/db-apply.mjs
//
// Requires DATABASE_URL (Supabase Dashboard -> Project Settings ->
// Database -> Connection string -> URI). The session-pooler URI works
// fine for migrations.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

const url = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
if (!url) {
  console.error(
    "[db-apply] Missing DATABASE_URL.\n" +
      "Set it in .env.local (or pass via env). Copy from Supabase Dashboard ->\n" +
      "Project Settings -> Database -> Connection string -> URI.",
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
} catch (err) {
  console.error("[db-apply] Could not connect:", err.message);
  process.exit(1);
}

try {
  await client.query(`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const applied = new Set(
    (await client.query(`select name from public._migrations`)).rows.map(
      (r) => r.name,
    ),
  );

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[db-apply] skip ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`[db-apply] apply ${file} (${sql.length} bytes)…`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(`insert into public._migrations(name) values($1)`, [file]);
      await client.query("commit");
      count += 1;
      console.log(`[db-apply] ok ${file}`);
    } catch (err) {
      await client.query("rollback");
      console.error(`[db-apply] failed ${file}:`, err.message);
      console.error(err);
      process.exit(1);
    }
  }

  console.log(
    count === 0
      ? "[db-apply] nothing to do — schema up to date."
      : `[db-apply] done — applied ${count} migration(s).`,
  );
} finally {
  await client.end();
}
