import { Box, Typography, IconButton, Paper } from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Description as DocIcon,
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import type { OnboardingDocument } from "../../types/document";

type Props = {
  doc: OnboardingDocument;
  onUpload: (file: File) => void;
};

export default function DocumentCard({ doc, onUpload }: Props) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: doc.status === "rejected" ? "error.main" : "divider",
        bgcolor:
          doc.status === "rejected"
            ? "rgba(198,40,40,0.04)"
            : "background.paper",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <DocIcon fontSize="small" />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={600} noWrap>
          {doc.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {doc.type}
          {doc.uploadedAt && ` • Uploaded ${doc.uploadedAt}`}
        </Typography>

        {doc.status === "rejected" && doc.hrFeedback && (
          <Typography variant="caption" color="error" display="block">
            HR feedback: {doc.hrFeedback}
          </Typography>
        )}
      </Box>

      {/* Status */}
      <StatusChip status={doc.status} size="small" />

      {/* Actions */}
      {doc.fileName ? (
        <IconButton size="small">
          <DownloadIcon fontSize="small" />
        </IconButton>
      ) : (
        <IconButton size="small" component="label">
          <UploadIcon fontSize="small" />
          <input
            hidden
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </IconButton>
      )}
    </Paper>
  );
}
