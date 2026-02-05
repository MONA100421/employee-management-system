import { useEffect, useState } from "react";
import api from "../lib/api";
import type { OnboardingDocument } from "../pages/employee/types";

type Category = "onboarding" | "visa";

type BackendDocument = {
  id: string;
  type: string;
  category: Category;
  status: "not-started" | "pending" | "approved" | "rejected";
  fileName?: string;
  uploadedAt?: string;
  hrFeedback?: string;
};

export const useDocuments = (category: Category) => {
  const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/documents/me");

        const docs: OnboardingDocument[] = res.data.documents
          .filter((d: BackendDocument) => d.category === category)
          .map((d: BackendDocument) => ({
            id: d.type.replace("_", "-"),
            title: d.type,
            type: d.type,
            status: d.status,
            fileName: d.fileName,
            uploadedAt: d.uploadedAt,
            feedback: d.hrFeedback,
          }));

        setDocuments(docs);
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category]);

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

    try {
      const res = await api.post("/documents", {
        type,
        category,
        fileName: file.name,
      });

      const saved = res.data.document;

      setDocuments((prev) =>
        prev.map((d) =>
          d.type === type
            ? {
                ...d,
                status: saved.status,
                fileName: saved.fileName,
                uploadedAt: saved.uploadedAt,
                feedback: saved.hrFeedback,
              }
            : d,
        ),
      );
    } catch (err) {
      console.error("Upload failed", err);
      setDocuments((prev) =>
        prev.map((d) =>
          d.type === type
            ? { ...d, status: "rejected", feedback: "Upload failed" }
            : d,
        ),
      );
    }
  };

  return { documents, loading, uploadDocument };
};
