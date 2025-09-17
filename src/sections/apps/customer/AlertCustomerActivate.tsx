import { memo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'components/@extended/Avatar';
import { openSnackbar } from 'api/snackbar';
import store from 'redux/store';
import useCustomer from 'api/customer';

// assets
import { CheckCircleOutlined } from '@ant-design/icons';

// types
import { SnackbarProps } from 'types/snackbar';
import { TCustomer } from 'types/customer';

// ==============================|| INTERFACE ||============================== //
interface AlertCustomerActivateProps {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
  onActivateSuccess?: () => void;
}

// ==============================|| ALERT CUSTOMER ACTIVATE ||============================== //
function AlertCustomerActivate({ id, title, open, handleClose, onActivateSuccess }: AlertCustomerActivateProps) {
  const theme = useTheme();
  const { activate } = useCustomer();

  const handleActivate = async () => {
    try {
      await activate(id);
      handleClose();
      openSnackbar({
        open: true,
        message: `Khách hàng "${title}" đã được kích hoạt thành công!`,
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
      console.error('Error activating customer:', error);
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi kích hoạt khách hàng',
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
              Kích hoạt khách hàng
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Xác nhận hành động kích hoạt
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <DialogContentText component="div" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Bạn có chắc chắn muốn kích hoạt khách hàng{' '}
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
              Hành động này sẽ chuyển khách hàng sang trạng thái hoạt động và nó sẽ xuất hiện trong tab <strong>Đang hoạt động</strong>.
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

export default memo(AlertCustomerActivate);
