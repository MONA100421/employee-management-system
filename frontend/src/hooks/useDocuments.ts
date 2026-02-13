import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import type { BaseDocument, DocumentCategory } from "../types/document";
import { uploadFilePresigned } from "../lib/upload";

export type UseDocumentsScope = DocumentCategory | "all";

let internalCache: BaseDocument[] | null = null;

export const resetDocumentsCache = () => {
  internalCache = null;
};

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!internalCache) {
        const res = await api.get("/documents/me");
        internalCache = res.data.documents || [];
      }
      setDocuments(applyScope(internalCache ?? []));
      if (scope === "visa") {
        const res = await api.get("/documents/my-visa-status");
        if (res.data.ok) {
          setDaysRemaining(res.data.daysRemaining);
        }
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  }, [applyScope, scope]);

  useEffect(() => {
    internalCache = null;
    load();
  }, [scope]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get("/documents/me");
      internalCache = res.data.documents || [];
      setDocuments(applyScope(internalCache ?? []));
      if (scope === "visa") {
        const visaRes = await api.get("/documents/my-visa-status");
        setDaysRemaining(visaRes.data.daysRemaining);
      }
    } catch (err) {
      console.error("Failed to refresh documents", err);
    } finally {
      setLoading(false);
    }
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
