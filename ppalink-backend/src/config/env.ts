import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  SMTP_HOST: z.string().default("smtp.example.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),

  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_S3_REGION: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  AWS_S3_ENDPOINT: z.string().url().optional(),

  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
});

const env = envSchema.parse(process.env);

export default env;
