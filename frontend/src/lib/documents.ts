import api from "./api";
import type { BaseDocument } from "../types/document";

export async function getDocumentsForHR(
  userId: string,
): Promise<BaseDocument[]> {
  const res = await api.get(`/documents/hr/${userId}`);
  return res.data.documents;
}

// POST /api/documents/:id/review
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
