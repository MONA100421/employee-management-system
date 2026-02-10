import { Request, Response } from "express";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../utils/s3";

const BUCKET = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION || "us-east-1";

// POST /api/uploads/presign
export const presignUpload = async (req: Request, res: Response) => {
  try {
    // Authentication check
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    // Configuration check
    if (!BUCKET) {
      console.error("AWS_BUCKET_NAME is not set in environment variables");
      return res.status(500).json({
        ok: false,
        message: "S3 bucket not configured on server",
      });
    }

    // Validation of input fields
    const { fileName, contentType, type, category } = req.body || {};
    if (!fileName || !contentType || !type || !category) {
      return res.status(400).json({
        ok: false,
        message:
          "Missing required fields: fileName, contentType, type, or category",
      });
    }

    // Validate category and document type
    const validMap: Record<string, string[]> = {
      onboarding: ["id_card", "work_auth", "profile_photo"],
      visa: ["opt_receipt", "opt_ead", "i_983", "i_20"],
    };

    if (!validMap[category]?.includes(type)) {
      return res.status(400).json({
        ok: false,
        message: `Invalid document type "${type}" for category "${category}"`,
      });
    }

    // Generate a unique and safe S3 Key
    const safeFileName = String(fileName).replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${user.id}/${category}/${Date.now()}_${safeFileName}`;

    // Create the PutObject command
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    // Generate Presigned URL (Expires in 5 minutes)
    const expiresIn = 300;
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn });

    // Generate the standard HTTPS URL for database storage and HR preview
    const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    // Return response to frontend
    return res.json({
      ok: true,
      uploadUrl,
      fileUrl,
      key,
      expiresIn,
    });
  } catch (err) {
    console.error("presignUpload error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to generate presigned upload URL",
    });
  }
};

export const presignGet = async (req: Request, res: Response) => {
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ ok: false, message: "Missing fileUrl" });
    }

    let key = "";
    if (fileUrl.startsWith("s3://")) {
      key = fileUrl.split("/").slice(3).join("/");
    } else {

      const urlParts = new URL(fileUrl);
      key = urlParts.pathname.substring(1); 
    }

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600,
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