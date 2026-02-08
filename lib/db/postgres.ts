import { Pool } from "pg";

let pool: Pool | null = null;

export function createPool(config: any) {
  pool = new Pool(config);
  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error("DB not connected");
  }
  return pool;
}
