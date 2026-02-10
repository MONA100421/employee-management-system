import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Tooltip,
  Skeleton,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Badge as IdIcon,
  Work as WorkIcon,
  Photo as PhotoIcon,
  Description as DocIcon,
  ErrorOutline as ErrorIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import StatusChip from "./StatusChip";
import FileUpload from "./FileUpload";
import type { BaseDocument } from "../../types/document";
import type { JSX } from "@emotion/react/jsx-dev-runtime";
import { getPresignedGet } from "../../lib/upload";
import { useState } from "react";

type Props = {
  documents: BaseDocument[];
  onUpload?: (type: string, file: File) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  readonly?: boolean;
  highlightId?: string | null;
};

const typeIconMap: Record<string, JSX.Element> = {
  id_card: <IdIcon fontSize="small" />,
  work_auth: <WorkIcon fontSize="small" />,
  profile_photo: <PhotoIcon fontSize="small" />,
  opt_ead: <DocIcon fontSize="small" />,
  opt_receipt: <DocIcon fontSize="small" />,
  i_983: <DocIcon fontSize="small" />,
  i_20: <DocIcon fontSize="small" />,
};

const mapStatusToUploadStatus = (status: BaseDocument["status"]) => {
  switch (status) {
    case "pending":
      return "uploading";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "idle";
  }
};

const DocumentList = ({
  documents,
  onUpload,
  onApprove,
  onReject,
  readonly,
  highlightId,
}: Props) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async (doc: BaseDocument) => {
    if (!doc.fileUrl) {
      setErrorMsg("No downloadable link available for this document.");
      return;
    }

    setDownloadingId(doc.id);
    try {
      const { downloadUrl } = await getPresignedGet({ fileUrl: doc.fileUrl });

      const resp = await fetch(downloadUrl);
      if (!resp.ok) throw new Error(`Download failed (HTTP ${resp.status})`);

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName ?? "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      // error handling
      console.error("Download error", err);
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred during download. Please try again later.";
      setErrorMsg(message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid key={doc.id} size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                border:
                  doc.status === "rejected"
                    ? "1px solid"
                    : "1px solid transparent",
                borderColor:
                  doc.status === "rejected" ? "error.main" : "divider",
                bgcolor:
                  doc.status === "rejected"
                    ? "rgba(198,40,40,0.04)"
                    : "background.paper",
                ...(highlightId === doc.id
                  ? {
                      boxShadow: (theme) =>
                        `0 0 0 4px ${theme.palette.primary.light}`,
                    }
                  : {}),
              }}
              data-docid={doc.id}
            >
              <CardContent>
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {typeIconMap[doc.type] ?? <DocIcon fontSize="small" />}
                    <Typography fontWeight={600}>{doc.type}</Typography>
                  </Box>

                  <StatusChip status={doc.status} size="small" />
                </Box>

                {/* File info + Download */}
                {doc.fileName ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ flex: 1 }}
                    >
                      File: {doc.fileName}
                    </Typography>

                    <Tooltip title="Download file">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc)}
                          disabled={!doc.fileUrl || Boolean(downloadingId)}
                          aria-label="download"
                        >
                          {downloadingId === doc.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DownloadIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No file uploaded
                  </Typography>
                )}

                {/* Reviewed by */}
                {doc.reviewedBy && (
                  <Typography variant="caption" color="text.secondary">
                    Reviewed by {doc.reviewedBy.username}
                    {doc.reviewedAt
                      ? ` • ${new Date(doc.reviewedAt).toLocaleString()}`
                      : ""}
                  </Typography>
                )}

                {/* HR feedback */}
                {doc.hrFeedback && (
                  <Tooltip title={doc.hrFeedback} arrow placement="top">
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "error.main",
                        cursor: "help",
                      }}
                    >
                      <ErrorIcon fontSize="small" />
                      <Typography variant="caption">HR feedback</Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Pending skeleton */}
                {doc.status === "pending" && (
                  <Box sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" height={48} />
                  </Box>
                )}

                {/* Upload control (employee) */}
                {!readonly && onUpload && doc.status !== "pending" && (
                  <Box sx={{ mt: 2 }}>
                    <FileUpload
                      label="Upload document"
                      fileName={doc.fileName ?? undefined}
                      status={mapStatusToUploadStatus(doc.status)}
                      disabled={doc.status === "approved"}
                      onFileSelect={(file) => onUpload(doc.type, file)}
                    />
                  </Box>
                )}

                {/* HR actions */}
                {doc.status === "pending" && (onApprove || onReject) && (
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    {onApprove && (
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        onClick={() => onApprove(doc.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {onReject && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => onReject(doc.id)}
                      >
                        Reject
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg(null)}
      >
        <Alert
          onClose={() => setErrorMsg(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DocumentList;
