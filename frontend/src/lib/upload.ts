import api from "./api";

type PresignResponse = {
  ok: boolean;
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn?: number;
};

type UploadResult = {
  ok: true;
  document: {
    id: string;
    fileName: string;
    fileUrl?: string;
  };
};

export async function uploadFilePresigned({
  file,
  type,
  category,
}: {
  file: File;
  type: string;
  category: string;
}): Promise<UploadResult> {
  const presignRes = await api.post<PresignResponse>("/uploads/presign", {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    type,
    category,
  });

  if (!presignRes.data?.ok) {
    throw new Error("Failed to get presigned URL");
  }

  const { uploadUrl, fileUrl } = presignRes.data;

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error("S3 upload failed");
  }

  const registerRes = await api.post("/documents", {
    type,
    category,
    fileName: file.name,
    fileUrl,
  });

  if (!registerRes.data?.ok) {
    throw new Error("Failed to register uploaded document");
  }

  return {
    ok: true,
    document: registerRes.data.document,
  };
}


export async function getPresignedGet({
  key,
  fileUrl,
}: {
  key?: string;
  fileUrl?: string;
}): Promise<{ downloadUrl: string }> {
  const res = await api.post("/uploads/presign-get", { key, fileUrl });
  if (!res.data || !res.data.ok) {
    throw new Error("Failed to get download URL");
  }
  return { downloadUrl: res.data.downloadUrl };
}