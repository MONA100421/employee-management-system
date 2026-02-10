import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import type { BaseDocument, DocumentCategory } from "../types/document";
import { uploadFilePresigned } from "../lib/upload";

export type UseDocumentsScope = DocumentCategory | "all";

/**
 * ⚠️ 注意：
 * 這個 cache 只存在於 module scope，
 * 用於「登入期間」避免重複 fetch
 */
let internalCache: BaseDocument[] | null = null;

export const resetDocumentsCache = () => {
  internalCache = null;
};

export const useDocuments = (scope: UseDocumentsScope) => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

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
    setLoading(true);
    try {
      const res = await api.get("/documents/me");
      internalCache = res.data.documents || [];
      setDocuments(applyScope(internalCache ?? []));
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
  };
};
