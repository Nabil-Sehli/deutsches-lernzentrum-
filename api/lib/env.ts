import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  s3Endpoint: process.env.S3_ENDPOINT ?? "",
  s3Region: required("S3_REGION"),
  s3Bucket: required("S3_BUCKET"),
  s3AccessKeyId: required("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: required("S3_SECRET_ACCESS_KEY"),
  s3PublicUrl: required("S3_PUBLIC_URL"),
  sendgridApiKey: required("SENDGRID_API_KEY"),
  sendgridFromEmail: required("SENDGRID_FROM_EMAIL"),
};
