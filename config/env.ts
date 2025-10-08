import { z } from "zod";

const envSchema = z.object({
  DRIZZLE_DIALECT: z.enum(["sqlite","postgresql"]),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.string().default("development"),
});

export const env = envSchema.parse(process.env);