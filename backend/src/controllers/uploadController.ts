import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.AWS_BUCKET_NAME;

if (!BUCKET) {
  throw new Error("AWS_BUCKET_NAME is not set");
}

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// POST /api/uploads/presign
export const presignUpload = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false });

    const { fileName, contentType, type, category } = req.body;
    if (!fileName || !contentType || !type || !category) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    const validMap: Record<string, string[]> = {
      onboarding: ["id_card", "work_auth", "profile_photo"],
      visa: ["opt_receipt", "opt_ead", "i_983", "i_20"],
    };

    if (!validMap[category]?.includes(type)) {
      return res.status(400).json({ ok: false, message: "Invalid type" });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${user.id}/${category}/${Date.now()}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    res.json({
      ok: true,
      uploadUrl,
      fileUrl,
      key,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
};
