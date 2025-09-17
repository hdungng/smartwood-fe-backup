import { useState, useCallback } from 'react';

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
  Grid
} from '@mui/material';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

// project imports
import { ConfigData, CodeDetailData } from 'types/config';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import useCodeDetail from 'api/codeDetail';

// ==============================|| CONFIG DETAIL MANAGER ||============================== //
interface ConfigDetailManagerProps {
  data: ConfigData[];
  onDataChange: (data: ConfigData[]) => void;
  configId?: number;
  disabled?: boolean;
}

function ConfigDetailManager({ data, onDataChange, configId, disabled = false }: ConfigDetailManagerProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CodeDetailData>({
    codeId: 0,
    name: '',
    description: '',
    value: ''
  });

  // API hooks
  const { create, update, delete: deleteCodeDetail } = useCodeDetail();

  // ==============================|| HANDLERS ||============================== //
  const handleAdd = useCallback(() => {
    if (!configId) {
      openSnackbar({
        open: true,
        message: 'Config ID is required to add items',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }

    setEditingIndex(null);
    setFormData({
      codeId: configId,
      name: '',
      description: '',
      value: ''
    });
    setOpenDialog(true);
  }, [configId]);

  const handleEdit = useCallback(
    (index: number) => {
      if (!configId) {
        openSnackbar({
          open: true,
          message: 'Config ID is required to edit items',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
        return;
      }

      setEditingIndex(index);
      // Convert ConfigData to CodeDetailData for editing
      const item = data[index];
      setFormData({
        codeId: configId,
        name: item.key || '',
        description: item.description || '',
        value: item.value || ''
      });
      setOpenDialog(true);
    },
    [data, configId]
  );

  const handleDelete = useCallback(
    async (index: number) => {
      try {
        const item = data[index];
        if (item.id) {
          // Call API to delete code detail using DELETE /api/codedetail/{id}
          await deleteCodeDetail(item.id);
        }

        // Update local state
        const newData = data.filter((_, i) => i !== index);
        onDataChange(newData);

        openSnackbar({
          open: true,
          message: 'Xóa item thành công',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      } catch (error) {
        console.error('Error deleting item:', error);
        openSnackbar({
          open: true,
          message: 'Xóa item thất bại',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      }
    },
    [data, onDataChange, deleteCodeDetail]
  );

  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
    setEditingIndex(null);
    setFormData({ codeId: 0, name: '', description: '', value: '' });
  }, []);

  const handleFormChange = useCallback((field: keyof CodeDetailData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      openSnackbar({
        open: true,
        message: 'Tên và Giá trị không được để trống',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }

    try {
      let result: CodeDetailData;

      if (editingIndex !== null && data[editingIndex].id) {
        // Update existing item
        result = await update(data[editingIndex].id!, formData);
      } else {
        // Add new item
        result = await create(formData);
      }

      // Convert back to ConfigData format for local state
      const newConfigData: ConfigData = {
        id: result.id,
        key: result.name,
        value: result.value,
        description: result.description
      };

      const newData = [...data];

      if (editingIndex !== null) {
        // Update existing item
        newData[editingIndex] = newConfigData;
      } else {
        // Add new item
        newData.push(newConfigData);
      }

      onDataChange(newData);
      handleDialogClose();

      openSnackbar({
        open: true,
        message: editingIndex !== null ? 'Cập nhật item thành công' : 'Thêm item thành công',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    } catch (error) {
      console.error('Error saving code detail:', error);
      openSnackbar({
        open: true,
        message: 'Lưu item thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [formData, data, editingIndex, onDataChange, handleDialogClose, create, update]);

  // Show message if no configId
  if (!configId) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="textSecondary">Cần tạo Config trước khi có thể thêm Config Detail Items.</Typography>
      </Box>
    );
  }

  // ==============================|| RENDER ||============================== //
  return (
    <Box>
      <Box
        sx={{
          p: 2,
          bgcolor: 'info.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          ⚙️ Config Detail Items
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={handleAdd}
          size="medium"
          disabled={disabled}
          sx={{
            color: 'white',
            bgcolor: 'info.main',
            '&:hover': {
              bgcolor: 'info.dark'
            }
          }}
        >
          Thêm Item
        </Button>
      </Box>

      {data.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">Chưa có item nào. Hãy thêm item đầu tiên.</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Giá trị</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Chip label={item.key} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="primary" onClick={() => handleEdit(index)} size="small" disabled={disabled}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(index)} size="small" disabled={disabled}>
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
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingIndex !== null ? 'Chỉnh sửa Item' : 'Thêm Item mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField fullWidth label="Tên" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} required />
            <TextField
              fullWidth
              label="Giá trị"
              value={formData.value}
              onChange={(e) => handleFormChange('value', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingIndex !== null ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConfigDetailManager;
