import { Request, Response } from "express";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.AWS_BUCKET_NAME;

if (!BUCKET) {
  console.error("AWS_BUCKET_NAME is not set");
}

const s3 = new S3Client({
  region: REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

// POST /api/uploads/presign
export const presignUpload = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false });

    const { fileName, contentType, type, category } = req.body || {};
    if (!fileName || !contentType || !type || !category) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    const validMap: Record<string, string[]> = {
      onboarding: ["id_card", "work_auth", "profile_photo"],
      visa: ["opt_receipt", "opt_ead", "i_983", "i_20"],
    };
    if (!validMap[category] || !validMap[category].includes(type)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid document type for category" });
    }

    const safeFileName = String(fileName).replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${user.id}/${category}/${Date.now()}_${safeFileName}`;

    if (!BUCKET) {
      return res
        .status(500)
        .json({ ok: false, message: "S3 bucket not configured" });
    }

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const expiresIn = 60 * 5; // 5 minutes
    const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn });

    const fileUrl = `s3://${BUCKET}/${key}`; // internal canonical key reference (not public URL)

    return res.json({
      ok: true,
      uploadUrl,
      fileUrl,
      key,
      expiresIn,
    });
  } catch (err) {
    console.error("presignUpload error", err);
    return res.status(500).json({ ok: false });
  }
};

// POST /api/uploads/presign-get
// Accepts { key } (prefer) or { fileUrl } (e.g. s3://bucket/key) and returns presigned GET url
export const presignGet = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false });

    const { key, fileUrl } = req.body || {};
    let objectKey = key;

    if (!objectKey && fileUrl) {
      // if client passed s3://bucket/key or https url, try to extract key
      const m =
        String(fileUrl).match(/s3:\/\/[^\/]+\/(.+)$/) ||
        String(fileUrl).match(/amazonaws\.com\/(.+)$/);
      objectKey = m ? m[1] : undefined;
    }

    if (!objectKey) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing key or fileUrl" });
    }

    if (!BUCKET) {
      return res
        .status(500)
        .json({ ok: false, message: "S3 bucket not configured" });
    }

    const getCmd = new GetObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
    });

    // short expiry for downloads
    const expiresIn = 60; // 1 minute
    const downloadUrl = await getSignedUrl(s3, getCmd, { expiresIn });

    return res.json({
      ok: true,
      downloadUrl,
      expiresIn,
    });
  } catch (err) {
    console.error("presignGet error", err);
    return res.status(500).json({ ok: false });
  }
};
