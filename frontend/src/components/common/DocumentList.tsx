import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  Badge as IdIcon,
  Work as WorkIcon,
  Photo as PhotoIcon,
  Description as DocIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import StatusChip from "./StatusChip";
import FileUpload from "./FileUpload";
import type { BaseDocument } from "../../types/document";
import type { JSX } from "@emotion/react/jsx-dev-runtime";

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
  return (
    <Grid container spacing={3}>
      {documents.map((doc) => {
        const isHighlighted = doc.id === highlightId;

        return (
          <Grid key={doc.id} size={{ xs: 12, md: 6 }}>
            <Card
              data-docid={doc.id}
              sx={{
                border: isHighlighted
                  ? "2px solid"
                  : doc.status === "rejected"
                    ? "1px solid"
                    : "1px solid transparent",
                borderColor: isHighlighted
                  ? "primary.main"
                  : doc.status === "rejected"
                    ? "error.main"
                    : "divider",
                bgcolor: isHighlighted
                  ? "rgba(25,118,210,0.08)"
                  : doc.status === "rejected"
                    ? "rgba(198,40,40,0.04)"
                    : "background.paper",
                transition: "all 0.3s ease",
              }}
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

                {/* File info */}
                {doc.fileName && (
                  <Typography variant="body2" color="text.secondary">
                    File: {doc.fileName}
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
                  <Tooltip title={doc.hrFeedback} arrow>
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

                {/* Upload */}
                {!readonly && onUpload && doc.status !== "pending" && (
                  <Box sx={{ mt: 2 }}>
                    <FileUpload
                      label="Upload document"
                      fileName={doc.fileName}
                      status={mapStatusToUploadStatus(doc.status)}
                      disabled={doc.status === "approved"}
                      onFileSelect={(file) => onUpload(doc.type, file)}
                    />
                  </Box>
                )}

                {/* HR actions (legacy) */}
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
        );
      })}
    </Grid>
  );
};

export default DocumentList;
