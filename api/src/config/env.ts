import { z } from "zod";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const envSchema = z.object({
  DRIZZLE_DIALECT: z.enum(["sqlite","postgresql"]),
  DATABASE_URL: z.string(),
  DATABASE_SSL: z.string().optional(), // Set to 'true' to enable SSL for PostgreSQL
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.string().default("development"),
  
  // Email configuration (optional - emails won't be sent if not configured)
  BREVO_API_KEY: z.string().optional(), // Brevo (formerly Sendinblue) API key
  RESEND_API_KEY: z.string().optional(), // Fallback to Resend if Brevo not set
  EMAIL_FROM: z.string().email().default("noreply@ejvapps.online"),
  EMAIL_FROM_NAME: z.string().default("Budget API"),
  APP_URL: z.string().url().default("http://localhost:5173"), // Frontend URL for email links
  REQUIRE_EMAIL_VERIFICATION: z.string().default("false"), // Set to "true" to require email verification
});

export const env = envSchema.parse(process.env);