// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

import { openSnackbar } from 'api/snackbar';

// assets
import DeleteFilled from '@ant-design/icons/DeleteFilled';

// types
import { SnackbarProps } from 'types/snackbar';

interface Props {
  id: string;
  title: string;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| CONTRACT - DELETE ||============================== //

export default function AlertContractDelete({ id, title, open, handleClose }: Props) {
  const deletehandler = async () => {
    // Mock delete function - replace with actual API call
    try {
      openSnackbar({
        open: true,
        message: 'Hợp đồng đã được xóa thành công',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
      handleClose();
    } catch (error) {
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi xóa hợp đồng',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      maxWidth="xs"
      aria-labelledby="contract-delete-title"
      aria-describedby="contract-delete-description"
      slots={{ transition: PopupTransition }}
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack sx={{ gap: 3.5, alignItems: 'center' }}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="h4" align="center">
              Bạn có chắc chắn muốn xóa?
            </Typography>
            <Typography align="center">
              Bằng cách xóa hợp đồng
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{title}&quot;{' '}
              </Typography>
              tất cả thông tin liên quan đến hợp đồng này cũng sẽ bị xóa.
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ gap: 2, width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Hủy
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deletehandler} autoFocus>
              Xóa
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
