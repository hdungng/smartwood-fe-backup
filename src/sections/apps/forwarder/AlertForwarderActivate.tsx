import { useState } from 'react';

// material-ui
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography, Stack } from '@mui/material';

// project imports
import { openSnackbar } from 'api/snackbar';
import useForwarder from 'api/forwarder';

// assets
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// types
import { SnackbarProps } from 'types/snackbar';

interface AlertForwarderActivateProps {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
  onActivateSuccess?: () => void;
}

// ==============================|| FORWARDER - ACTIVATE ||============================== //

export default function AlertForwarderActivate({ id, title, open, handleClose, onActivateSuccess }: AlertForwarderActivateProps) {
  const [loading, setLoading] = useState(false);
  const { activate } = useForwarder();

  const handleActivate = async () => {
    try {
      setLoading(true);
      await activate(id);

      openSnackbar({
        open: true,
        message: 'Forwarder đã được chuyển sang trạng thái hoạt động',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);

      if (onActivateSuccess) {
        onActivateSuccess();
      }
      handleClose();
    } catch (error) {
      console.error('Error activating forwarder:', error);
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Không thể kích hoạt forwarder',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setLoading(false);
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
              Kích hoạt forwarder
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Xác nhận hành động kích hoạt
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        <DialogContentText sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Bạn có chắc chắn muốn kích hoạt forwarder
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
              Hành động này sẽ chuyển forwarder sang trạng thái hoạt động và nó sẽ xuất hiện trong tab <strong>Đang hoạt động</strong>.
            </Typography>
          </Box>
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="medium"
          disabled={loading}
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
          disabled={loading}
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
          {loading ? 'Đang xử lý...' : 'Kích hoạt'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
