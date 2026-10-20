import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Resolve D1 lazily so the same store module works in both environments:
 * Next's local Node preview falls back to the file store, while the hosted
 * Cloudflare worker gets its real DB binding from `cloudflare:workers`.
 */
export async function getDb() {
  const { env } = await import(/* webpackIgnore: true */ "cloudflare:workers");
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  return drizzle(env.DB, { schema });
}
