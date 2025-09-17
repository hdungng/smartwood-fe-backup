import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import { Box, Button, Stack, TextField, Divider, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import ConfigDetailManager from 'components/ConfigDetailManager';
import ScreenNamesManager from 'components/ScreenNamesManager';
import useConfig from 'api/config';
import { ConfigFormData } from 'types/config';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

// ==============================|| CONFIG EDIT PAGE ||============================== //
function ConfigEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getById, update, updateMetadata } = useConfig();
  const { config, configLoading, configError } = getById(Number(id || 0));

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
  const [initialLoading, setInitialLoading] = useState(true);

  // ==============================|| EFFECTS ||============================== //
  useEffect(() => {
    if (config && !configLoading) {
      setFormData({
        code: config.code,
        name: config.name,
        description: config.description,
        codeType: config.codeType,
        metaData: config.metaData,
        data: config.data
      });
      setInitialLoading(false);
    }
  }, [config, configLoading]);

  useEffect(() => {
    if (configError) {
      console.error('Fetch config error:', configError);
      openSnackbar({
        open: true,
        message: 'Không thể tải thông tin cấu hình',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      navigate('/system/config');
    }
  }, [configError, navigate]);

  // ==============================|| HANDLERS ||============================== //
  const handleInputChange = useCallback((field: keyof ConfigFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleDataChange = useCallback((newData: any[]) => {
    setFormData((prev) => ({
      ...prev,
      data: newData
    }));
  }, []);

  const handleScreenNamesChange = useCallback((newScreenNames: string[]) => {
    setFormData((prev) => ({
      ...prev,
      metaData: {
        ...prev.metaData,
        screenNames: newScreenNames
      }
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);

      if (!id) {
        throw new Error('Config ID is required');
      }

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

      await update(Number(id), formData);

      openSnackbar({
        open: true,
        message: 'Cập nhật cấu hình thành công',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);

      navigate('/system/config');
    } catch (error) {
      console.error('Update config error:', error);
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Cập nhật cấu hình thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setLoading(false);
    }
  }, [formData, id, update, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/system/config');
  }, [navigate]);

  // ==============================|| TEST API CALL ||============================== //
  const testApiCall = useCallback(async () => {
    try {
      console.log('Testing API call...');
      const result = await updateMetadata(17, {
        screenNames: ['c']
      });
      console.log('API call successful:', result);

      openSnackbar({
        open: true,
        message: 'API call thành công',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    } catch (error) {
      console.error('API call failed:', error);
      openSnackbar({
        open: true,
        message: 'API call thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [updateMetadata]);

  // ==============================|| RENDER ||============================== //
  if (initialLoading) {
    return (
      <MainCard title="Chỉnh sửa cấu hình">
        <Box sx={{ p: 2, textAlign: 'center' }}>Đang tải...</Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Chỉnh sửa cấu hình">
      <Box sx={{ p: 3 }}>
        {/* Section 1: Thông tin cơ bản */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            📋 Thông tin cơ bản
          </Typography>

          <Box
            sx={{
              p: 3,
              bgcolor: 'primary.50',
              borderRadius: 2
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
                />
                <TextField
                  fullWidth
                  label="Tên cấu hình"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  variant="outlined"
                />
              </Stack>
              <TextField
                fullWidth
                label="Loại mã"
                value={formData.codeType}
                onChange={(e) => handleInputChange('codeType', e.target.value)}
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>
        {/* Section 4: Actions */}
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
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </Stack>
        </Box>
        {/* Section 2: Screen Names */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            🖥️ Screen Names
          </Typography>

          <Box
            sx={{
              bgcolor: 'primary.50',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <ScreenNamesManager
              screenNames={formData.metaData.screenNames}
              onScreenNamesChange={handleScreenNamesChange}
              configId={Number(id)}
              updateMetadata={updateMetadata}
              disabled={loading}
            />
          </Box>
        </Box>

        {/* Section 3: Config Detail Items */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              bgcolor: 'info.50',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <ConfigDetailManager data={formData.data} onDataChange={handleDataChange} configId={Number(id)} disabled={loading} />
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}

export default ConfigEditPage;
