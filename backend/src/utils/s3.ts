import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("CRITICAL: AWS credentials (ID or Key) are missing in .env");
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const checkS3ObjectExists = async (bucket: string, key: string) => {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    return false;
  }
};