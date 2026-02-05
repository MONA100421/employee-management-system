import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import StatusChip from "./StatusChip";
import FileUpload from "./FileUpload";
import type { BaseDocument } from "../../types/document";

type Props = {
  documents: BaseDocument[];

  /** employee / onboarding */
  onUpload?: (type: string, file: File) => void;

  /** hr */
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;

  readonly?: boolean;
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
}: Props) => {
  return (
    <Grid container spacing={3}>
      {documents.map((doc) => (
        <Grid key={doc.id} size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography fontWeight={600}>{doc.type}</Typography>
                <StatusChip status={doc.status} size="small" />
              </Box>

              {doc.fileName && (
                <Typography variant="body2" color="text.secondary">
                  File: {doc.fileName}
                </Typography>
              )}

              {doc.hrFeedback && (
                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                  Feedback: {doc.hrFeedback}
                </Typography>
              )}

              {/* ===== Upload (Employee / Onboarding) ===== */}
              {!readonly && onUpload && (
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

              {/* ===== HR Actions ===== */}
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
  );
};

export default DocumentList;
