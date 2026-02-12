import { Request, Response } from "express";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../utils/s3";
import { randomUUID } from "crypto";
import Document from "../models/Document";
import mongoose from "mongoose";
import { checkS3ObjectExists } from "../utils/s3";

const BUCKET = process.env.AWS_BUCKET_NAME!;
const REGION = process.env.AWS_REGION;

if (!REGION) {
  throw new Error("AWS_REGION is not set");
}

const validMap: Record<string, string[]> = {
  onboarding: ["id_card", "work_auth", "profile_photo"],
  visa: ["opt_receipt", "opt_ead", "i_983", "i_20"],
};

/**
 * POST /api/uploads/presign
 * Generates a temporary URL for the frontend to upload a file directly to S3
 */
export const presignUpload = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const userId = user.userId;

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

    if (!validMap[category]?.includes(type)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid document type for category",
      });
    }

    // Check if an approved document already exists to prevent getting a URL
    const existing = await Document.findOne({ user: userId, type });
    if (existing && existing.status === "approved") {
      return res.status(400).json({
        ok: false,
        message:
          "Cannot overwrite an approved document. Please contact HR if a change is needed.",
      });
    }

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

    const safeFileName = String(fileName).replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${userId}/${category}/${randomUUID()}_${safeFileName}`;

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300,
    });
    const fileUrl = `s3://${BUCKET}/${key}`;

    return res.json({ ok: true, uploadUrl, fileUrl, key, expiresIn: 300 });
  } catch (err) {
    console.error("presignUpload error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to generate presigned upload URL" });
  }
};

/**
 * POST /api/uploads/complete
 * Syncs DB record after S3 upload. 
 * 'enforceVisaOrder' middleware handles sequence checks before reaching this point.
 */
export const uploadComplete = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const userId = user.userId;
    const { fileUrl, fileName, type, category } = req.body || {};

    if (!fileUrl || !fileName || !type || !category) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing required fields" });
    }

    if (!validMap[category]?.includes(type)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid document type for category" });
    }

    if (!fileUrl.startsWith(`s3://${BUCKET}/`)) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Security Error: Invalid fileUrl bucket source",
        });
    }

    const existing = await Document.findOne({ user: userId, type });
    if (existing && existing.status === "approved") {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Action forbidden: Approved documents are locked.",
        });
    }

    const key = fileUrl.replace(`s3://${BUCKET}/`, "");
    const exists = await checkS3ObjectExists(BUCKET, key);
    if (!exists) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "File not found in storage. Please re-upload.",
        });
    }

    const doc = await Document.findOneAndUpdate(
      { user: userId, type },
      {
        $set: {
          user: new mongoose.Types.ObjectId(userId),
          type,
          category,
          fileName,
          fileUrl,
          uploadedAt: new Date(),
          status: "pending",
          revoked: false,
          deletedAt: null,
          hrFeedback: "",
        },
        $push: {
          audit: {
            action: "uploaded",
            by: new mongoose.Types.ObjectId(userId),
            username: user.username,
            at: new Date(),
            feedback: "Document uploaded by employee",
          },
        },
      },
      { upsert: true, new: true },
    );

    return res.json({ ok: true, document: doc });
  } catch (err) {
    console.error("uploadComplete error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to sync document record" });
  }
};

/**
 * POST /api/uploads/presign-get
 */
export const presignGet = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fileUrl } = req.body;

    if (!user)
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    if (!fileUrl)
      return res.status(400).json({ ok: false, message: "Missing fileUrl" });

    const doc = await Document.findOne({ fileUrl });
    if (!doc)
      return res
        .status(404)
        .json({ ok: false, message: "Document record not found" });

    const isOwner = doc.user.toString() === user.userId;
    const isHR = user.role === "hr";

    if (!isOwner && !isHR) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    if (!BUCKET)
      return res
        .status(500)
        .json({ ok: false, message: "S3 bucket not configured" });

    let key: string;
    if (fileUrl.startsWith("s3://")) {
      key = fileUrl.replace(`s3://${BUCKET}/`, "");
    } else {
      const url = new URL(fileUrl);
      key = url.pathname.slice(1);
    }

    const getCommand = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const downloadUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600,
    });

    return res.json({ ok: true, downloadUrl });
  } catch (err) {
    console.error("presignGet error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to generate download URL" });
  }
};
