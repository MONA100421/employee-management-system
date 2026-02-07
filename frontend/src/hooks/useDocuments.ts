import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import type { BaseDocument, DocumentCategory } from "../types/document";

export type UseDocumentsScope = DocumentCategory | "all";

// Simple in-memory cache
let documentsCache: BaseDocument[] = [];

export const useDocuments = (scope: UseDocumentsScope) => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply scope filter
  const applyScope = useCallback(
    (docs: BaseDocument[]) => {
      if (scope === "all") return docs;
      return docs.filter((d) => d.category === scope);
    },
    [scope],
  );

  // Initial load (with cache)
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

  // Force refresh (ignore cache)
  const refresh = async () => {
    setLoading(true);
    const res = await api.get("/documents/me");
    documentsCache = res.data.documents;
    setDocuments(applyScope(documentsCache));
    setLoading(false);
  };

  // Upload document
  const uploadDocument = async (type: string, file: File) => {
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

    const res = await api.post("/documents", {
      type,
      category: scope === "all" ? "onboarding" : scope,
      fileName: file.name,
    });

    const saved: BaseDocument = res.data.document;

    documentsCache = documentsCache.map((d) => (d.id === saved.id ? saved : d));

    setDocuments(applyScope(documentsCache));
  };

  // HR review document
  const reviewDocument = async (
    id: string,
    decision: "approved" | "rejected",
    feedback?: string,
  ) => {
    await api.post(`/documents/${id}/review`, {
      decision,
      feedback,
    });

    documentsCache = documentsCache.map((d) =>
      d.id === id
        ? {
            ...d,
            status: decision,
            hrFeedback: decision === "rejected" ? feedback : undefined,
          }
        : d,
    );

    setDocuments(applyScope(documentsCache));
  };

  return {
    documents,
    loading,
    uploadDocument,
    reviewDocument,
    refresh,
  };
};

export const resetDocumentsCache = () => {
  documentsCache = [];
};