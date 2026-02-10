import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

import type { BaseDocument } from "../../types/document";
import StatusChip from "./StatusChip";
import { deleteDocument } from "../../lib/documents";

type Props = {
  documents: BaseDocument[];
  readOnly?: boolean;

  /**
   * 上传回调（阶段 A：只上传 metadata）
   * 由父组件（useDocuments）提供
   */
  onUpload: (type: string, file: File) => Promise<void>;

  onDownload?: (doc: BaseDocument) => void;
  onRefresh?: () => Promise<void>;
};

export default function DocumentList({
  documents,
  readOnly = false,
  onUpload,
  onDownload,
  onRefresh,
}: Props) {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  /**
   * 上传文件（阶段 A：只通知父层）
   */
  const handleUpload = async (doc: BaseDocument, file: File) => {
    setLoadingMap((m) => ({ ...m, [doc.id]: true }));
    try {
      await onUpload(doc.type, file);
      await onRefresh?.();
    } catch (err) {
      console.error("upload failed", err);
      alert("Upload failed");
    } finally {
      setLoadingMap((m) => ({ ...m, [doc.id]: false }));
    }
  };

  /**
   * 删除 document（DB 层，阶段 A）
   */
  const handleDelete = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setLoadingMap((m) => ({ ...m, [docId]: true }));
    try {
      await deleteDocument(docId);
      await onRefresh?.();
    } catch (err) {
      console.error("delete failed", err);
      alert("Failed to delete document");
    } finally {
      setLoadingMap((m) => ({ ...m, [docId]: false }));
    }
  };

  return (
    <Grid container spacing={2}>
      {documents.map((doc) => {
        const loading = !!loadingMap[doc.id];

        return (
          <Grid size={{ xs: 12, md: 6 }} key={doc.id}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* 左侧：文档信息 */}
              <Box>
                <Typography fontWeight={600}>{doc.type}</Typography>

                <Typography variant="caption" color="text.secondary">
                  {doc.fileName
                    ? `Uploaded ${doc.uploadedAt}`
                    : "Not uploaded"}
                </Typography>

                {doc.status === "pending" && (
                  <Typography variant="caption" color="warning.main">
                    Pending HR review
                  </Typography>
                )}

                {doc.status === "rejected" && doc.hrFeedback && (
                  <Typography variant="caption" color="error">
                    Feedback: {doc.hrFeedback}
                  </Typography>
                )}
              </Box>

              {/* 右侧：操作区 */}
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <StatusChip status={doc.status} size="small" />

                {doc.fileName && (
                  <Tooltip title="Download">
                    <IconButton
                      size="small"
                      onClick={() => onDownload?.(doc)}
                      disabled={loading}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {doc.fileName && !readOnly && (
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(doc.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {!readOnly && (
                  <Tooltip title="Upload file">
                    <IconButton
                      component="label"
                      size="small"
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={18} />
                      ) : (
                        <UploadIcon />
                      )}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUpload(doc, file);
                            e.target.value = "";
                          }
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
