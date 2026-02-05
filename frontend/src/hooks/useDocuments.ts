import { useEffect, useState } from "react";
import api from "../lib/api";
import type { BaseDocument, DocumentCategory } from "../types/document";

export type UseDocumentsScope = DocumentCategory | "all";

export const useDocuments = (scope: UseDocumentsScope) => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/documents/me");
        const allDocs: BaseDocument[] = res.data.documents;

        setDocuments(
          scope === "all"
            ? allDocs
            : allDocs.filter((d) => d.category === scope),
        );
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [scope]);

  const uploadDocument = async (type: string, file: File) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.type === type
          ? {
              ...d,
              status: "pending",
              fileName: file.name,
              uploadedAt: new Date().toISOString().split("T")[0],
            }
          : d,
      ),
    );

    const res = await api.post("/documents", {
      type,
      category: scope === "all" ? "onboarding" : scope,
      fileName: file.name,
    });

    const saved: BaseDocument = res.data.document;

    setDocuments((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
  };

  const reviewDocument = async (
    id: string,
    decision: "approved" | "rejected",
    feedback?: string,
  ) => {
    await api.post(`/documents/${id}/review`, {
      decision,
      feedback,
    });

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: decision,
              hrFeedback: decision === "rejected" ? feedback : undefined,
            }
          : d,
      ),
    );
  };

  return {
    documents,
    loading,
    uploadDocument,
    reviewDocument,
  };
};
