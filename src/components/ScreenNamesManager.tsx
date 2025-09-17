import { useState, useCallback } from 'react';

// material-ui
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
  Autocomplete
} from '@mui/material';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

// project imports
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { SCREEN_NAMES } from 'constants/screen';

// ==============================|| SCREEN NAMES MANAGER ||============================== //
interface ScreenNamesManagerProps {
  screenNames: string[];
  onScreenNamesChange: (screenNames: string[]) => void;
  configId?: number;
  updateMetadata?: (configId: number, metadata: any) => Promise<any>;
  disabled?: boolean;
}

function ScreenNamesManager({ screenNames, onScreenNamesChange, configId, updateMetadata, disabled = false }: ScreenNamesManagerProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter out already selected screen names
  const availableScreenNames = SCREEN_NAMES.filter((name) => !screenNames.includes(name));

  // ==============================|| HANDLERS ||============================== //
  const handleAdd = useCallback(() => {
    setNewScreenName('');
    setOpenDialog(true);
  }, []);

  const handleDelete = useCallback(
    async (index: number) => {
      try {
        setLoading(true);
        const newScreenNames = screenNames.filter((_, i) => i !== index);

        // Update local state immediately for better UX
        onScreenNamesChange(newScreenNames);

        // Call API if available
        if (configId && updateMetadata) {
          await updateMetadata(configId, { screenNames: newScreenNames });
        }

        openSnackbar({
          open: true,
          message: 'Xóa screen name thành công',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      } catch (error) {
        console.error('Error deleting screen name:', error);
        // Revert local state on error
        onScreenNamesChange(screenNames);
        openSnackbar({
          open: true,
          message: 'Xóa screen name thất bại',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    },
    [screenNames, onScreenNamesChange, configId, updateMetadata]
  );

  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
    setNewScreenName('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!newScreenName.trim()) {
      openSnackbar({
        open: true,
        message: 'Screen name không được để trống',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }

    if (screenNames.includes(newScreenName.trim())) {
      openSnackbar({
        open: true,
        message: 'Screen name đã tồn tại',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }

    try {
      setLoading(true);
      const newScreenNames = [...screenNames, newScreenName.trim()];

      // Update local state immediately for better UX
      onScreenNamesChange(newScreenNames);
      handleDialogClose();

      // Call API if available
      if (configId && updateMetadata) {
        await updateMetadata(configId, { screenNames: newScreenNames });
      }

      openSnackbar({
        open: true,
        message: 'Thêm screen name thành công',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    } catch (error) {
      console.error('Error adding screen name:', error);
      // Revert local state on error
      onScreenNamesChange(screenNames);
      openSnackbar({
        open: true,
        message: 'Thêm screen name thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setLoading(false);
    }
  }, [newScreenName, screenNames, onScreenNamesChange, handleDialogClose, configId, updateMetadata]);

  // ==============================|| RENDER ||============================== //
  return (
    <Box>
      {screenNames.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">Chưa có screen name nào. Hãy thêm screen name đầu tiên.</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {screenNames.map((screenName, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  mx: 0.5,
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  bgcolor: 'white'
                }}
              >
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  {screenName}
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(index)}
                  disabled={disabled || loading}
                  size="small"
                  sx={{
                    p: 0.25,
                    '&:hover': {
                      bgcolor: 'error.light'
                    }
                  }}
                >
                  <DeleteOutlined style={{ fontSize: '12px' }} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Add Button */}
      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={disabled || loading}
          size="medium"
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              bgcolor: 'primary.50'
            }
          }}
        >
          Thêm Screen Name
        </Button>
      </Box>

      {/* Dialog for Add */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Screen Name mới</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableScreenNames}
            value={newScreenName}
            onChange={(_, value) => setNewScreenName(value || '')}
            onInputChange={(_, value) => setNewScreenName(value)}
            renderInput={(params) => <TextField {...params} fullWidth label="Screen Name" required sx={{ mt: 1 }} autoFocus />}
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Typography variant="body2">{option}</Typography>
              </Box>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ScreenNamesManager;
