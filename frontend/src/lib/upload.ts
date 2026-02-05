import api from "./api";

export async function uploadFileToServer(
  file: File,
): Promise<{ fileName: string; fileUrl?: string }> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!res.data || !res.data.ok) {
    throw new Error("Upload failed");
  }

  return {
    fileName: res.data.fileName,
    fileUrl: res.data.fileUrl,
  };
}
