import api from "./api";

/**
 * 使用 S3 presigned URL 上传文件
 */
export async function uploadWithPresign(args: {
  file: File;
  type: string;
  category: string;
}) {
  const { file, type, category } = args;

  const presignRes = await api.post("/documents/uploads/presign", {
    fileName: file.name,
    contentType: file.type,
    type,
    category,
  });

  const { uploadUrl, fileUrl } = presignRes.data;
  console.log("【REAL uploadUrl】", uploadUrl);

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to S3");
  }

  return { fileUrl };
}
