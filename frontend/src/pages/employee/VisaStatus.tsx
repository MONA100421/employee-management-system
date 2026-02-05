import { Box, Typography } from "@mui/material";
import { useDocuments } from "../../hooks/useDocuments";
import DocumentList from "../../components/common/DocumentList";

const VisaStatus = () => {
  const { documents, uploadDocument } = useDocuments("visa");

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Visa Documents
      </Typography>

      <DocumentList documents={documents} onUpload={uploadDocument} />

    </Box>
  );
};

export default VisaStatus;
