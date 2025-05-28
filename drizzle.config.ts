import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "@/config/env";

export default defineConfig({
  out: "./drizzle",
  dialect: "mysql",
  schema: "./src/db/schema/schema.ts",
  dbCredentials: {
    url: DATABASE_URL!,
  },
});

