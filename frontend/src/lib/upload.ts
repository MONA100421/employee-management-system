import api from "./api";

type PresignResponse = {
  ok: boolean;
  uploadUrl: string;
  fileUrl: string;
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
    contentType: file.type || "application/octet-stream",
    type,
    category,
  });

  if (!presignRes.data.ok) {
    throw new Error("Failed to presign");
  }

  const { uploadUrl, fileUrl } = presignRes.data;

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
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
    throw new Error("Failed to register document");
  }

  return {
    ok: true,
    document: registerRes.data.document,
  };
}
