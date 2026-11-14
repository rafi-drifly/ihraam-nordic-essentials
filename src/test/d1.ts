/**
 * A real SQLite database standing in for D1 in tests.
 *
 * Built on Node's own node:sqlite, with every migration in workers/api/migrations
 * applied, so the Worker's SQL runs against the same schema it meets in
 * production instead of a mock that accepts anything. Only the parts of the
 * D1 API the Worker uses: prepare/bind, run, first, all and batch.
 */
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
// Loaded at run time so Vite's resolver never tries to bundle node:sqlite.
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (path: string) => {
    exec(sql: string): void;
    prepare(sql: string): {
      run(...args: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
      get(...args: unknown[]): Record<string, unknown> | undefined;
      all(...args: unknown[]): Record<string, unknown>[];
    };
  };
};

const MIGRATIONS = resolve(__dirname, "../../workers/api/migrations");

// D1 binds booleans as integers and undefined as an error; node:sqlite wants
// plain values.
const toSql = (value: unknown) => (typeof value === "boolean" ? (value ? 1 : 0) : value);

export function testD1(): D1Database & { raw: InstanceType<typeof DatabaseSync> } {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
    db.exec(readFileSync(join(MIGRATIONS, file), "utf-8"));
  }

  const statement = (sql: string, args: unknown[] = []): D1PreparedStatement => ({
    bind: (...values: unknown[]) => statement(sql, values.map(toSql)),
    run: async () => {
      const info = db.prepare(sql).run(...args);
      return { results: [], success: true, meta: { changes: Number(info.changes) } };
    },
    first: async <T>() => (db.prepare(sql).get(...args) as T | undefined) ?? null,
    all: async <T>() => ({ results: db.prepare(sql).all(...args) as T[], success: true, meta: { changes: 0 } }),
  });

  return {
    raw: db,
    prepare: (sql: string) => statement(sql),
    batch: async (statements: D1PreparedStatement[]) => {
      db.exec("BEGIN");
      try {
        const results = [];
        for (const s of statements) results.push(await s.run());
        db.exec("COMMIT");
        return results;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
