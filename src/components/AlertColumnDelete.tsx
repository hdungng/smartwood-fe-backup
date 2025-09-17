// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import { useIntl } from 'react-intl';
import { ReactNode } from 'react';

// types
interface Props {
  open: boolean;
  handleClose: (status: boolean) => void;
  handleDelete: () => void;
  title?: string;
  message?: ReactNode;
}

// ==============================|| KANBAN BOARD - COLUMN DELETE ||============================== //

export default function AlertColumnDelete({ title, message, open, handleClose, handleDelete }: Props) {
  const intl = useIntl();
  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      keepMounted
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
      slots={{ transition: PopupTransition }}
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack sx={{ gap: 3.5, alignItems: 'center' }}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>

          {message || (
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h4" align="center">
                {intl.formatMessage({ id: 'ask_for_delete_label' })}
              </Typography>
              <Typography align="center">
                {intl.formatMessage({ id: 'by_deleting_des_top' })}
                <Typography variant="subtitle1" component="span">
                  {' "'}
                  {title}
                  {'" '}
                </Typography>
                {intl.formatMessage({ id: 'by_deleting_des_bottom' })}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" sx={{ gap: 2, width: 1 }}>
            <Button fullWidth onClick={() => handleClose(false)} color="secondary" variant="outlined">
              {intl.formatMessage({ id: 'common_button_cancel' })}
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={() => handleDelete?.()} autoFocus>
              {intl.formatMessage({ id: 'common_button_delete' })}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
