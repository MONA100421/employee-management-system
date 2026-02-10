import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import { uploadWithPresign } from "../lib/upload";

import type { BaseDocument, DocumentCategory } from "../types/document";

export type UseDocumentsScope = DocumentCategory | "all";

// Simple in-memory cache
let documentsCache: BaseDocument[] = [];

export const useDocuments = (scope: UseDocumentsScope) => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await api.get("/documents/me");
      documentsCache = res.data.documents;
      setDocuments(applyScope(documentsCache));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 阶段 B：使用 presigned URL 上传文件
   * （当前 presign 为 mock，AWS 就绪后无需改 UI）
   */
  const uploadDocument = async (type: string, file: File) => {
    if (scope === "all") {
      throw new Error("Cannot upload document in 'all' scope");
    }

    // ① 乐观更新：立刻显示 Pending
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

    // ② 阶段 B：presign → PUT（mock）→ POST /documents
    await uploadWithPresign({
      file,
      type,
      category: scope,
    });

    // ③ 从后端重新拉一次，保证最终一致
    await refresh();
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
