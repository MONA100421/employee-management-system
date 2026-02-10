import api, { API_BASE } from "./api";
import type { BaseDocument } from "../types/document";

/* ======================
   HR 相关
====================== */

export async function getDocumentsForHR(
  userId: string,
): Promise<BaseDocument[]> {
  const res = await api.get(`/documents/hr/${userId}`);
  return res.data.documents;
}

// HR 审核 document
export async function reviewDocument(
  documentId: string,
  decision: "approved" | "rejected",
  feedback?: string,
): Promise<{ ok: boolean; status?: string }> {
  const res = await api.post(`/documents/${documentId}/review`, {
    decision,
    feedback,
  });
  return res.data;
}

/* ======================
   删除 document（本地文件 + DB）
====================== */

export async function deleteDocument(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: "DELETE",
  });

  // 删除接口返回 204 No Content
  if (!res.ok) {
    throw new Error("Delete document failed");
  }

  return true;
}

/* ======================
   本地文件上传（multer）
====================== */

export async function uploadDocumentLocal(
  doc: { type: string; category: string },
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", doc.type);
  formData.append("category", doc.category);

  const res = await fetch(`${API_BASE}/documents/upload-local`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error("Upload local document failed");
  }

  return data;
}
