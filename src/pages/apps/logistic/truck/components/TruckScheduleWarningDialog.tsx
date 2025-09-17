import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography
} from '@mui/material';

interface TruckScheduleWarningDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const TruckScheduleWarningDialog: React.FC<TruckScheduleWarningDialogProps> = ({
  open,
  onCancel,
  onConfirm
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Cảnh báo</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có các thay đổi chưa được lưu. Bạn có chắc chắn muốn chuyển trang và mất các thay đổi này không?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} tabIndex={14}>Hủy</Button>
        <Button onClick={onConfirm} color="warning" variant="contained" tabIndex={15}>
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  );
};
