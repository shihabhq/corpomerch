import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * READ-ONLY consumer config.
 *
 * The admin app (../corpomerch-admin) owns the schema and every migration.
 * This file exists only so `prisma generate` has somewhere to read the
 * datasource from. There is no `migrations` block on purpose — running a
 * migration from here would fork the schema history.
 *
 * After any schema change in the admin app:
 *   npm run sync:schema && npx prisma generate
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
