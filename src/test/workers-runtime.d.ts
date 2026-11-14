/**
 * The few Workers runtime types the Worker sources use, so the app's
 * type-check can follow the tests into workers/. Wrangler builds the Workers
 * themselves and never reads this file.
 */
interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes: number; last_row_id?: number };
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  /** Runs the statements in one transaction: all of them, or none. */
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

interface KVNamespace {
  get<T>(key: string, type: "json"): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}
