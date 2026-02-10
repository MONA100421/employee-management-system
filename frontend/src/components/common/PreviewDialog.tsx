import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  onClose: () => void;
  fileUrl?: string | null;
  fileName?: string;
};

export default function PreviewDialog({
  open,
  onClose,
  fileUrl,
  fileName,
}: Props) {
  const theme = useTheme();

  if (!fileUrl) {
    return null;
  }

  // crude check by extension
  const lower = (fileName || fileUrl).toLowerCase();
  const isPdf = lower.endsWith(".pdf");
  const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(lower);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {fileName || "Preview"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 0, bgcolor: theme.palette.background.default }}
      >
        <Box
          sx={{
            width: "100%",
            height: { xs: "60vh", md: "80vh" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isPdf ? (
            <iframe
              title="pdf-preview"
              src={fileUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          ) : isImage ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <img
                src={fileUrl}
                alt={fileName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Preview not available for this file type.
              </Typography>
              <Typography variant="body2">
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  Open in new tab
                </a>
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
