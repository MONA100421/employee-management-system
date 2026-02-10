import { Request, Response } from "express";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../utils/s3";
import { randomUUID } from "crypto";

const BUCKET = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

if (!REGION) {
  throw new Error("AWS_REGION is not set");
}

// POST /api/uploads/presign
export const presignUpload = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    if (!BUCKET) {
      return res.status(500).json({
        ok: false,
        message: "S3 bucket not configured on server",
      });
    }

    const { fileName, contentType, type, category } = req.body || {};
    if (!fileName || !contentType || !type || !category) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields",
      });
    }

    // Validate category → document type mapping
    const validMap: Record<string, string[]> = {
      onboarding: ["id_card", "work_auth", "profile_photo"],
      visa: ["opt_receipt", "opt_ead", "i_983", "i_20"],
    };

    if (!validMap[category]?.includes(type)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid document type for category",
      });
    }

    // Allowed MIME types must match frontend FileUpload accept list
    const allowedContentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedContentTypes.includes(contentType)) {
      return res.status(400).json({
        ok: false,
        message: "Unsupported file type",
      });
    }

    // Build a safe and unique S3 object key
    const safeFileName = String(fileName).replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${user.id}/${category}/${randomUUID()}_${safeFileName}`;

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    // Presigned PUT URL (5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300,
    });

    // Store a private S3 reference (NOT a public URL)
    const fileUrl = `s3://${BUCKET}/${key}`;

    return res.json({
      ok: true,
      uploadUrl,
      fileUrl,
      key,
      expiresIn: 300,
    });
  } catch (err) {
    console.error("presignUpload error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to generate presigned upload URL",
    });
  }
};

// POST /api/uploads/presign-get
export const presignGet = async (req: Request, res: Response) => {
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ ok: false, message: "Missing fileUrl" });
    }

    if (!BUCKET) {
      return res.status(500).json({
        ok: false,
        message: "S3 bucket not configured on server",
      });
    }

    // Extract S3 object key from stored fileUrl
    let key: string;

    if (fileUrl.startsWith("s3://")) {
      key = fileUrl.replace(`s3://${BUCKET}/`, "");
    } else {
      const url = new URL(fileUrl);
      key = url.pathname.slice(1);
    }

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600, // 1 hour
    });

    return res.json({
      ok: true,
      downloadUrl,
    });
  } catch (err) {
    console.error("presignGet error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to generate download URL",
    });
  }
};
