import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography, Stack } from '@mui/material';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import useConfig from 'api/config';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
  onDeactivateSuccess?: () => void;
}

export default function AlertConfigDeactivate({ id, title, open, handleClose, onDeactivateSuccess }: Props) {
  const { deactivate } = useConfig();

  const handleDeactivate = async () => {
    try {
      await deactivate(id);

      openSnackbar({
        open: true,
        message: `Cấu hình "${title}" đã được ngừng hoạt động thành công!`,
        variant: 'alert',
        alert: {
          color: 'success',
          variant: 'filled'
        },
        close: true,
        actionButton: false
      } as SnackbarProps);

      if (onDeactivateSuccess) {
        onDeactivateSuccess();
      }
      handleClose();
    } catch (error) {
      console.error('Error deactivating config:', error);
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi ngừng hoạt động cấu hình',
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
              Ngừng hoạt động cấu hình
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Xác nhận hành động ngừng hoạt động
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Bạn có chắc chắn muốn ngừng hoạt động cấu hình{' '}
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
              Hành động này sẽ chuyển cấu hình sang trạng thái không hoạt động và nó sẽ xuất hiện trong tab{' '}
              <strong>Đã ngừng hoạt động</strong>.
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
          Ngừng hoạt động
        </Button>
      </DialogActions>
    </Dialog>
  );
}
