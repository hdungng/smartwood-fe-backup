import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Box, Button, Stack, TextField, Typography, Backdrop, CircularProgress } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import useConfig from 'api/config';
import { ConfigFormData } from 'types/config';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

// ==============================|| CONFIG CREATE PAGE ||============================== //
function ConfigCreatePage() {
  const navigate = useNavigate();
  const { create } = useConfig();

  // ==============================|| STATE ||============================== //
  const [formData, setFormData] = useState<ConfigFormData>({
    code: '',
    name: '',
    description: '',
    codeType: '',
    metaData: {
      screenNames: []
    },
    data: []
  });

  const [loading, setLoading] = useState(false);
  const [modeTransitionLoading, setModeTransitionLoading] = useState(false);

  // ==============================|| HANDLERS ||============================== //
  const handleInputChange = useCallback((field: keyof ConfigFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.code.trim()) {
        throw new Error('Mã cấu hình là bắt buộc');
      }
      if (!formData.name.trim()) {
        throw new Error('Tên cấu hình là bắt buộc');
      }
      if (!formData.codeType.trim()) {
        throw new Error('Loại mã là bắt buộc');
      }

      // Create config without detail items (following supplier-bank pattern)
      const configToCreate = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        codeType: formData.codeType,
        metaData: {
          screenNames: []
        },
        data: []
      };

      const newConfig = await create(configToCreate);

      // Show transition loading
      setModeTransitionLoading(true);

      openSnackbar({
        open: true,
        message: 'Tạo cấu hình thành công!',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);

      // Small delay for smooth transition, then navigate to edit mode
      setTimeout(() => {
        navigate(`/system/config/edit/${newConfig.id}`);
      }, 1000);
    } catch (error) {
      console.error('Create config error:', error);
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Tạo cấu hình thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setLoading(false);
    }
  }, [formData, create, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/system/config');
  }, [navigate]);

  // ==============================|| RENDER ||============================== //
  return (
    <MainCard title="Tạo cấu hình mới">
      <Box sx={{ p: 3, position: 'relative' }}>
        {/* Section 1: Thông tin cơ bản */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            📋 Thông tin cơ bản
          </Typography>

          <Box
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Mã cấu hình"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  required
                  variant="outlined"
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Tên cấu hình"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  variant="outlined"
                  disabled={loading}
                />
              </Stack>
              <TextField
                fullWidth
                label="Loại mã"
                value={formData.codeType}
                onChange={(e) => handleInputChange('codeType', e.target.value)}
                required
                variant="outlined"
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                variant="outlined"
                disabled={loading}
              />
            </Stack>
          </Box>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.primary' }}></Typography>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleCancel} disabled={loading} size="large" sx={{ minWidth: 120 }}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading} size="large" sx={{ minWidth: 120 }}>
              {loading ? 'Đang tạo...' : 'Tạo cấu hình'}
            </Button>
          </Stack>
        </Box>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
          open={loading || modeTransitionLoading}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={32} />
            <div style={{ color: '#333' }}>{modeTransitionLoading ? 'Đang chuyển sang chế độ chỉnh sửa...' : 'Đang tạo cấu hình...'}</div>
          </Stack>
        </Backdrop>
      </Box>
    </MainCard>
  );
}

export default ConfigCreatePage;
