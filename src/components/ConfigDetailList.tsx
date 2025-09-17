import { useState, useCallback, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

// project imports
import { ConfigData } from 'types/config';
import useConfigDetail from 'api/configDetail';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

// ==============================|| CONFIG DETAIL LIST ||============================== //
interface ConfigDetailListProps {
  codeId: number;
}

function ConfigDetailList({ codeId }: ConfigDetailListProps) {
  const { list, create, update, remove } = useConfigDetail();
  const { configDetails, configDetailsLoading, configDetailsError, mutateConfigDetails } = list(codeId);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigData | null>(null);
  const [formData, setFormData] = useState<ConfigData>({ key: '', value: '' });
  const [submitting, setSubmitting] = useState(false);

  // ==============================|| EFFECTS ||============================== //
  useEffect(() => {
    if (configDetailsError) {
      openSnackbar({
        open: true,
        message: 'Không thể tải danh sách config detail',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [configDetailsError]);

  // ==============================|| HANDLERS ||============================== //
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormData({ key: '', value: '' });
    setOpenDialog(true);
  }, []);

  const handleEdit = useCallback((item: ConfigData) => {
    setEditingItem(item);
    setFormData({ key: item.key, value: item.value });
    setOpenDialog(true);
  }, []);

  const handleDelete = useCallback(
    async (item: ConfigData) => {
      if (!item.id) {
        openSnackbar({
          open: true,
          message: 'Không thể xóa item này',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
        return;
      }

      try {
        setSubmitting(true);
        await remove(codeId, item.id);

        openSnackbar({
          open: true,
          message: 'Xóa item thành công',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      } catch (error) {
        openSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Xóa item thất bại',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setSubmitting(false);
      }
    },
    [codeId, remove]
  );

  const handleRefresh = useCallback(() => {
    mutateConfigDetails();
  }, [mutateConfigDetails]);

  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({ key: '', value: '' });
  }, []);

  const handleFormChange = useCallback((field: keyof ConfigData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.key.trim() || !formData.value.trim()) {
      openSnackbar({
        open: true,
        message: 'Key và Value không được để trống',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }

    try {
      setSubmitting(true);

      if (editingItem?.id) {
        await update(codeId, editingItem.id, formData);
        openSnackbar({
          open: true,
          message: 'Cập nhật item thành công',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      } else {
        await create(codeId, formData);
        openSnackbar({
          open: true,
          message: 'Thêm item thành công',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      }

      handleDialogClose();
    } catch (error) {
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Thao tác thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingItem, codeId, create, update, handleDialogClose]);

  // ==============================|| RENDER ||============================== //
  return (
    <Box>
      <Box
        sx={{
          p: 2,
          bgcolor: 'secondary.light',
          color: 'secondary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Config Detail Items
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={configDetailsLoading}
            sx={{
              bgcolor: 'white',
              color: 'secondary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={configDetailsLoading}
            sx={{
              bgcolor: 'white',
              color: 'secondary.main'
            }}
          >
            Thêm Item
          </Button>
        </Stack>
      </Box>

      {configDetailsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : configDetails.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">Chưa có item nào. Hãy thêm item đầu tiên.</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configDetails.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Chip label={item.key} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="primary" onClick={() => handleEdit(item)} disabled={submitting} size="small">
                        <EditOutlined />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item)} disabled={submitting} size="small">
                        <DeleteOutlined />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Chỉnh sửa Item' : 'Thêm Item mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Key *" value={formData.key} onChange={(e) => handleFormChange('key', e.target.value)} required />
            <TextField
              fullWidth
              label="Value *"
              value={formData.value}
              onChange={(e) => handleFormChange('value', e.target.value)}
              multiline
              rows={3}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : editingItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConfigDetailList;
