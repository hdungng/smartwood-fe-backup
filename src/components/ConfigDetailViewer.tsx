import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, IconButton, Stack } from '@mui/material';
import { DeleteOutlined } from '@ant-design/icons';

// project imports
import { ConfigData } from 'types/config';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import useCodeDetail from 'api/codeDetail';

// ==============================|| CONFIG DETAIL VIEWER ||============================== //
interface ConfigDetailViewerProps {
  data: ConfigData[];
  onDataChange?: (data: ConfigData[]) => void;
  configId?: number;
}

function ConfigDetailViewer({ data, onDataChange, configId }: ConfigDetailViewerProps) {
  // API hooks
  const { delete: deleteCodeDetail } = useCodeDetail();

  // ==============================|| HANDLERS ||============================== //
  const handleDelete = async (index: number) => {
    try {
      const item = data[index];
      if (item.id) {
        // Call API to delete code detail using DELETE /api/codedetail/{id}
        await deleteCodeDetail(item.id);
      }

      // Update local state if callback provided
      if (onDataChange) {
        const newData = data.filter((_, i) => i !== index);
        onDataChange(newData);
      }

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
  };

  // ==============================|| RENDER ||============================== //
  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="textSecondary">Không có dữ liệu config detail items.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          bgcolor: 'info.main',
          color: 'white'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          ⚙️ Config Detail Items ({data.length} items)
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Giá trị</TableCell>
              {onDataChange && <TableCell align="center">Thao tác</TableCell>}
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
                {onDataChange && (
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleDelete(index)} size="small">
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ConfigDetailViewer;
