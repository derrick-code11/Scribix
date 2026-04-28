import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  publicAppUrl: process.env.PUBLIC_APP_URL || "http://localhost:5173",

  databaseUrl: required("DATABASE_URL"),

  supabaseUrl: required("SUPABASE_URL"),
  supabaseJwtSecret: required("SUPABASE_JWT_SECRET"),

  awsRegion: required("AWS_REGION"),
  awsAccessKeyId: required("AWS_ACCESS_KEY_ID"),
  awsSecretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
  s3Bucket: required("S3_BUCKET"),
  cloudfrontBaseUrl: required("CLOUDFRONT_BASE_URL"),
} as const;
