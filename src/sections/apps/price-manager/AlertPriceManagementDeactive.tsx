import { WarningOutlined } from '@ant-design/icons';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from '@mui/material';
import useGoodSupplier from 'api/good-supplier';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
  onDeactivateSuccess?: () => void;
}

export default function AlertPriceManagementDeactivate({ id, title, open, handleClose, onDeactivateSuccess }: Props) {
  const { deleteGoodSupplier } = useGoodSupplier();

  const handleDeactivate = async () => {
    try {
      await deleteGoodSupplier(id);

      openSnackbar({
        open: true,
        message: 'Đơn vị vận chuyển đã được chuyển sang trạng thái không hoạt động',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);

      onDeactivateSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error deactivating shipping unit:', error);
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi ngừng hoạt động đơn vị vận chuyển',
        variant: 'alert',
        alert: { color: 'error' }
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
              bgcolor: 'error.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WarningOutlined style={{ color: '#d32f2f' }} />
          </Box>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              Xác nhận ngừng hiệu lực giá trị sản phẩm này
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Xác nhận hành động ngừng hiệu lực
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        <DialogContentText sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Bạn có chắc chắn muốn ngừng ngừng hiệu lực giá trị sản phẩm{' '}
            <Typography component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
              "{title}"
            </Typography>{' '}
            không?
          </Typography>

          <Box
            sx={{
              bgcolor: 'error.lighter',
              p: 2.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'error.light'
            }}
          >
            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
              <strong>⚠️ Lưu ý quan trọng:</strong>
              <br />
              Hành động này sẽ chuyển giá trị sản phẩm sang trạng thái không hoạt động và nó sẽ xuất hiện trong tab{' '}
              <strong>Đã ngừng hiệu lực</strong>.
            </Typography>
          </Box>
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
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
          color="error"
          onClick={handleDeactivate}
          size="medium"
          sx={{
            minWidth: 140,
            textTransform: 'none',
            fontWeight: 700,
            py: 1.2,
            boxShadow: '0 3px 10px rgba(211, 47, 47, 0.4)',
            '&:hover': {
              boxShadow: '0 5px 16px rgba(211, 47, 47, 0.5)'
            }
          }}
        >
          Ngừng hiệu lực
        </Button>
      </DialogActions>
    </Dialog>
  );
}
