import { Button, TextField } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { PCShipSchedule } from 'types/contracts/logistic/ship';
import { PCTruckSchedule } from 'types/contracts/logistic/truck';
import { TRANSPORT_TYPE } from 'utils';

const DialogReject = (props: {
  rejectDialogOpen: boolean;
  detailData: PCShipSchedule | PCTruckSchedule | null;
  closeRejectDialog: () => void;
  confirmReject: (params: { note: string }) => void;
}) => {
  const { rejectDialogOpen, detailData, closeRejectDialog, confirmReject } = props;
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    setNote('');
  }, []);

  return (
    <>
      <Dialog open={rejectDialogOpen} onClose={() => closeRejectDialog()} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối yêu cầu vận chuyển</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn từ chối yêu cầu{' '}
            {detailData?.transportType === TRANSPORT_TYPE.TRUCK
              ? (detailData as PCTruckSchedule)?.code
              : (detailData as PCShipSchedule)?.code}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lý do từ chối *"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setNote('');
              closeRejectDialog();
            }}
          >
            Hủy
          </Button>
          <Button onClick={() => confirmReject({ note })} variant="contained" color="error">
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogReject;
