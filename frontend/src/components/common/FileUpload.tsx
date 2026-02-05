import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Paper,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  label?: string;
  helperText?: string;
  status?: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  fileName?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10,
  onFileSelect,
  label = 'Upload File',
  helperText,
  status = 'idle',
  progress = 0,
  fileName,
  disabled = false,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    
    setError(null);
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckIcon sx={{ color: theme.palette.success.main }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <FileIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      
      {fileName ? (
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: theme.palette.background.default,
          }}
        >
          {getStatusIcon()}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fileName}
            </Typography>
            {status === 'uploading' && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, borderRadius: 1 }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => handleFileChange(null)}
            disabled={disabled || status === 'uploading'}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Paper>
      ) : (
        <Paper
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
            backgroundColor: dragOver ? 'rgba(21, 101, 192, 0.04)' : theme.palette.background.default,
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: disabled ? theme.palette.divider : theme.palette.primary.main,
              backgroundColor: disabled ? theme.palette.background.default : 'rgba(21, 101, 192, 0.04)',
            },
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            hidden
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={disabled}
          />
          <UploadIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Drag and drop or click to upload
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {helperText || `Accepted formats: ${accept}. Max size: ${maxSize}MB`}
          </Typography>
        </Paper>
      )}
      
      {error && (
        <Typography variant="caption" sx={{ color: theme.palette.error.main, mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
