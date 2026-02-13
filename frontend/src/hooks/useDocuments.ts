import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import type { BaseDocument, DocumentCategory } from "../types/document";
import { uploadFilePresigned } from "../lib/upload";

export type UseDocumentsScope = DocumentCategory | "all";

export const useDocuments = (scope: UseDocumentsScope) => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const applyScope = useCallback(
    (docs: BaseDocument[]) =>
      scope === "all" ? docs : docs.filter((d) => d.category === scope),
    [scope],
  );

  const fetchVisaStatus = async () => {
    if (scope !== "visa") return;

    try {
      const res = await api.get("/documents/my-visa-status");
      if (res.data?.ok) {
        setDaysRemaining(res.data.daysRemaining ?? null);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        console.warn("Visa status endpoint not implemented.");
        setDaysRemaining(null);
      } else {
        console.error("Failed to fetch visa status:", err);
      }
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/documents/me");
      const docs = res.data.documents || [];
      setDocuments(applyScope(docs));
      await fetchVisaStatus();
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  }, [applyScope]);

  useEffect(() => {
    load();
  }, [load]);


  const refresh = async () => {
    await load();
  };

  const uploadDocument = async (type: string, file: File) => {
    if (scope === "all") {
      throw new Error("Cannot upload document in 'all' scope");
    }

    setIsUploading(true);
    try {
      await uploadFilePresigned({
        file,
        type,
        category: scope,
      });
      await refresh();
    } finally {
      setIsUploading(false);
    }
  };

  const reviewDocument = async (
    id: string,
    decision: "approved" | "rejected",
    feedback?: string,
  ) => {
    await api.post(`/documents/${id}/review`, { decision, feedback });
    await refresh();
  };

  return {
    documents,
    loading,
    isUploading,
    uploadDocument,
    reviewDocument,
    refresh,
    daysRemaining,
  };
};
