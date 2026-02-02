import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';


export type StatusType = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'in-progress' 
  | 'completed' 
  | 'not-started'
  | 'active'
  | 'inactive'
  | 'expired'
  | 'sent'
  | 'used';

interface StatusChipProps {
  status: StatusType;
  size?: ChipProps['size'];
}

const statusConfig: Record<StatusType, { label: string; color: ChipProps['color']; sx?: object }> = {
  pending: { 
    label: 'Pending', 
    color: 'warning',
    sx: { backgroundColor: '#FFF3E0', color: '#E65100' }
  },
  approved: { 
    label: 'Approved', 
    color: 'success',
    sx: { backgroundColor: '#E8F5E9', color: '#2E7D32' }
  },
  rejected: { 
    label: 'Rejected', 
    color: 'error',
    sx: { backgroundColor: '#FFEBEE', color: '#C62828' }
  },
  'in-progress': { 
    label: 'In Progress', 
    color: 'info',
    sx: { backgroundColor: '#E3F2FD', color: '#1565C0' }
  },
  completed: { 
    label: 'Completed', 
    color: 'success',
    sx: { backgroundColor: '#E8F5E9', color: '#2E7D32' }
  },
  'not-started': { 
    label: 'Not Started', 
    color: 'default',
    sx: { backgroundColor: '#F5F5F5', color: '#616161' }
  },
  active: { 
    label: 'Active', 
    color: 'success',
    sx: { backgroundColor: '#E8F5E9', color: '#2E7D32' }
  },
  inactive: { 
    label: 'Inactive', 
    color: 'default',
    sx: { backgroundColor: '#F5F5F5', color: '#616161' }
  },
  expired: { 
    label: 'Expired', 
    color: 'error',
    sx: { backgroundColor: '#FFEBEE', color: '#C62828' }
  },
  sent: { 
    label: 'Sent', 
    color: 'info',
    sx: { backgroundColor: '#E3F2FD', color: '#1565C0' }
  },
  used: { 
    label: 'Used', 
    color: 'success',
    sx: { backgroundColor: '#E8F5E9', color: '#2E7D32' }
  },
};

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const config = statusConfig[status];
  
  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        fontWeight: 600,
        ...config.sx,
      }}
    />
  );
};

export default StatusChip;
