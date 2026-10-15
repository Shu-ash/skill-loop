import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory, root directory, or backend directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  MONGO_URI: z
    .string()
    .min(1),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32),

  JWT_ACCESS_EXPIRES: z
    .string()
    .default("30d"),

  JWT_REFRESH_EXPIRES: z
    .string()
    .default("90d"),

  CLIENT_URL: z
    .string()
    .optional()
    .default("http://localhost:5173"),

  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  BREVO_API_KEY: z.string().optional()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;