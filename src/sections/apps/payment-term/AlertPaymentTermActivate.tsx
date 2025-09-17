import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography, Stack } from '@mui/material';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import usePaymentTerm from 'api/payment-term';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
  onActivateSuccess?: () => void;
}

export default function AlertPaymentTermActivate({ id, title, open, handleClose, onActivateSuccess }: Props) {
  const { activate } = usePaymentTerm();

  const handleActivate = async () => {
    try {
      await activate(id);
      handleClose();
      openSnackbar({
        open: true,
        message: `Điều kiện thanh toán "${title}" đã được kích hoạt thành công!`,
        variant: 'alert',
        alert: {
          color: 'success',
          variant: 'filled'
        },
        close: true,
        actionButton: false
      } as SnackbarProps);

      if (onActivateSuccess) {
        onActivateSuccess();
      }
    } catch (error) {
      console.error('Error activating payment term:', error);
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi kích hoạt điều kiện thanh toán',
        variant: 'alert',
        alert: {
          color: 'error',
          variant: 'filled'
        },
        close: true,
        actionButton: false
      } as SnackbarProps);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircleOutlined style={{ color: '#2e7d32' }} />
          </Box>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              Kích hoạt điều kiện thanh toán
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Xác nhận hành động kích hoạt
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Bạn có chắc chắn muốn kích hoạt điều kiện thanh toán{' '}
            <Typography component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
              "{title}"
            </Typography>{' '}
            không?
          </Typography>

          <Box
            sx={{
              bgcolor: 'success.lighter',
              p: 2.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'success.light'
            }}
          >
            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
              <strong>✅ Lưu ý quan trọng:</strong>
              <br />
              Hành động này sẽ chuyển điều kiện thanh toán sang trạng thái hoạt động và nó sẽ xuất hiện trong tab{' '}
              <strong>Đang hoạt động</strong>.
            </Typography>
          </Box>
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="medium"
          sx={{
            minWidth: 120,
            textTransform: 'none',
            fontWeight: 600,
            py: 1.2
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleActivate}
          size="medium"
          sx={{
            minWidth: 140,
            textTransform: 'none',
            fontWeight: 700,
            py: 1.2,
            boxShadow: '0 3px 10px rgba(46, 125, 50, 0.4)',
            '&:hover': {
              boxShadow: '0 5px 16px rgba(46, 125, 50, 0.5)'
            }
          }}
        >
          Kích hoạt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
