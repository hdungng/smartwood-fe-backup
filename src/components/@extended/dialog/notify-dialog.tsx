import { Button, Stack, Typography } from '@mui/material';
import CustomDialog from './custom-dialog';
import { NotifyDialogProps } from './types';
import { DialogRequest } from 'contexts/DialogContext';

type Props = DialogRequest & NotifyDialogProps;

const NotifyDialog = (props: Props) => {
  const {
    description,
    label: { accept = '', reject = 'Đóng' } = {},
    onAccept,
    onReject,
    slots,
    slotProps = {
      accept: { show: true },
      reject: { show: true }
    },
    ...otherProps
  } = props;

  return (
    <CustomDialog
      {...otherProps}
      slotProps={{
        root: {
          paper: { sx: { width: { xs: 'auto', sm: 480 } } }
        },
        close: {
          hiddenBtnClose: true
        },
        content: {
          sx: {
            py: 0
          }
        }
      }}
      action={
        <>
          {slots?.action || (
            <Stack direction="row" justifyContent="start" justifyItems="center" spacing={1.5}>
              {slotProps?.reject?.show && (
                <Button
                  {...slotProps?.reject}
                  onClick={() => {
                    onReject?.();
                    otherProps.onClose?.();
                  }}
                >
                  {reject}
                </Button>
              )}
              {slotProps?.accept?.show && (
                <Button
                  {...slotProps?.accept}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    onAccept?.();
                    otherProps.onClose?.({ success: true });
                  }}
                >
                  {accept}
                </Button>
              )}
            </Stack>
          )}
        </>
      }
    >
      <Typography fontWeight={500} fontSize={14} lineHeight="20px">
        {description}
      </Typography>
    </CustomDialog>
  );
};

export default NotifyDialog;
