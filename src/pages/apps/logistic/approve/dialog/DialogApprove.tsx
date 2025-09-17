import { Button, TextField } from '@mui/material';
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { PCShipSchedule } from 'types/contracts/logistic/ship';
import { PCTruckSchedule } from 'types/contracts/logistic/truck';
import { TRANSPORT_TYPE } from 'utils';
import { formatCurrency } from 'utils/helper';

const DialogApprove = (props: {
  approveDialogOpen: boolean;
  detailData: PCShipSchedule | PCTruckSchedule | null;
  closeApproveDialog: () => void;
  confirmApprove: (params: { note: string }) => void;
}) => {
  const { approveDialogOpen, detailData, closeApproveDialog, confirmApprove } = props;
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    setNote('');
  }, []);

  return (
    <>
      <Dialog open={approveDialogOpen} onClose={() => closeApproveDialog()} maxWidth="sm" fullWidth>
        <DialogTitle>Duyệt yêu cầu vận chuyển</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn duyệt yêu cầu{' '}
            <strong>
              {detailData?.transportType === TRANSPORT_TYPE.TRUCK
                ? (detailData as PCTruckSchedule)?.code
                : (detailData as PCShipSchedule)?.code}
            </strong>
            ?
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Lưu ý:</strong> Khi duyệt, hệ thống sẽ tự động tạo yêu cầu thanh toán với số tiền{' '}
              <strong>
                {formatCurrency(detailData?.transportType === TRANSPORT_TYPE.TRUCK ? (detailData as PCTruckSchedule)?.transportFee : 0)}
              </strong>
            </Typography>
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Ghi chú duyệt (tùy chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú về quyết định duyệt..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeApproveDialog()}>Hủy</Button>
          <Button
            onClick={() =>
              confirmApprove({
                note
              })
            }
            variant="contained"
            color="success"
          >
            Xác nhận duyệt
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogApprove;
