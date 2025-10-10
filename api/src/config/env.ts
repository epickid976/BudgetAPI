import { z } from "zod";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const envSchema = z.object({
  DRIZZLE_DIALECT: z.enum(["sqlite","postgresql"]),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.string().default("development"),
  
  // Email configuration (optional - emails won't be sent if not configured)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("onboarding@resend.dev"),
  APP_URL: z.string().url().default("http://localhost:5173"), // Frontend URL for email links
});

export const env = envSchema.parse(process.env);