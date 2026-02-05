import { Box, Grid, Typography } from "@mui/material";
import FileUpload from "../../components/common/FileUpload";
import { useDocuments } from "../../hooks/useDocuments";
import type { OnboardingDocument } from "./types";

const VISA_TYPES = [
  "work_auth",
  "opt_ead",
  "opt_receipt",
  "i_983",
  "i_20",
] as const;

type VisaDocType = (typeof VISA_TYPES)[number];

const isVisaDoc = (type: string): type is VisaDocType =>
  VISA_TYPES.includes(type as VisaDocType);

const mapStatusToUploadStatus = (status: OnboardingDocument["status"]) => {
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

const VisaStatus = () => {
  const { documents, uploadDocument } = useDocuments("visa");

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Visa Documents
      </Typography>

      <Grid container spacing={3}>
        {documents
          .filter((doc) => isVisaDoc(doc.type))
          .map((doc) => (
            <Grid key={doc.type} size={{ xs: 12, md: 6 }}>
              <FileUpload
                label={doc.type}
                fileName={doc.fileName}
                status={mapStatusToUploadStatus(doc.status)}
                onFileSelect={(file) => uploadDocument(doc.type, file)}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default VisaStatus;
