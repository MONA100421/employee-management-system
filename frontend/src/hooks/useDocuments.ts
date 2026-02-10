import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import type { BaseDocument, DocumentCategory } from "../types/document";
import { uploadFilePresigned } from "../lib/upload";

export type UseDocumentsScope = DocumentCategory | "all";

let documentsCache: BaseDocument[] = [];

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
      if (documentsCache.length === 0) {
        const res = await api.get("/documents/me");
        documentsCache = res.data.documents;
      }
      setDocuments(applyScope(documentsCache));
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
    const res = await api.get("/documents/me");
    documentsCache = res.data.documents;
    setDocuments(applyScope(documentsCache));
    setLoading(false);
  };

  const uploadDocument = async (type: string, file: File) => {
    if (scope === "all") {
      throw new Error("Cannot upload document in 'all' scope");
    }

    setIsUploading(true);

    try {
      documentsCache = documentsCache.map((d) =>
        d.type === type
          ? {
              ...d,
              status: "pending",
              fileName: file.name,
              uploadedAt: new Date().toISOString().split("T")[0],
            }
          : d,
      );
      setDocuments(applyScope(documentsCache));

      const res = await uploadFilePresigned({
        file,
        type,
        category: scope,
      });

      await refresh();

      return res;
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
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
    documentsCache = documentsCache.map((d) =>
      d.id === id ? { ...d, status: decision, hrFeedback: feedback } : d,
    );
    setDocuments(applyScope(documentsCache));
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

export const resetDocumentsCache = () => {
  documentsCache = [];
};
