import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { openSnackbar } from 'api/snackbar';
import useConfig from 'api/config';
import { Config, ConfigFormData, ConfigData, ConfigMetaData } from 'types/config';
import { SnackbarProps } from 'types/snackbar';

// ==============================|| CONFIG FORM COMPONENT ||============================== //
function ConfigForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // ==============================|| API HOOKS ||============================== //
  const { getById, create, update } = useConfig();
  const { config, configLoading } = getById(Number(id));

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ==============================|| EFFECTS ||============================== //
  useEffect(() => {
    if (isEditMode && config) {
      setFormData({
        code: config.code || '',
        name: config.name || '',
        description: config.description || '',
        codeType: config.codeType || '',
        metaData: {
          screenNames: config.metaData?.screenNames || []
        },
        data: config.data || []
      });
    }
  }, [isEditMode, config]);

  // ==============================|| VALIDATION ||============================== //
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Mã cấu hình là bắt buộc';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Tên cấu hình là bắt buộc';
    }

    if (!formData.codeType?.trim()) {
      newErrors.codeType = 'Loại mã là bắt buộc';
    }

    if (formData.metaData.screenNames.length === 0) {
      newErrors.screenNames = 'Ít nhất một tên màn hình là bắt buộc';
    }

    if (formData.data.length === 0) {
      newErrors.data = 'Ít nhất một dữ liệu là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==============================|| HANDLERS ||============================== //
  const handleInputChange = (field: keyof ConfigFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMetaDataChange = (field: keyof ConfigMetaData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metaData: {
        ...prev.metaData,
        [field]: value
      }
    }));

    if (errors[field as string]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleScreenNameAdd = () => {
    const newScreenName = prompt('Nhập tên màn hình:');
    if (newScreenName?.trim()) {
      handleMetaDataChange('screenNames', [...formData.metaData.screenNames, newScreenName.trim()]);
    }
  };

  const handleScreenNameRemove = (index: number) => {
    handleMetaDataChange(
      'screenNames',
      formData.metaData.screenNames.filter((_, i) => i !== index)
    );
  };

  const handleDataAdd = () => {
    const key = prompt('Nhập key:');
    const value = prompt('Nhập value:');

    if (key?.trim() && value?.trim()) {
      const newData: ConfigData = {
        key: key.trim(),
        value: value.trim()
      };

      setFormData((prev) => ({
        ...prev,
        data: [...prev.data, newData]
      }));
    }
  };

  const handleDataRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await update(Number(id), formData);
        openSnackbar({
          open: true,
          message: 'Cập nhật cấu hình thành công',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        } as SnackbarProps);
      } else {
        await create(formData);
        openSnackbar({
          open: true,
          message: 'Tạo cấu hình thành công',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        } as SnackbarProps);
      }

      navigate('/config/list');
    } catch (error) {
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        variant: 'alert',
        alert: {
          color: 'error'
        },
        close: true
      } as SnackbarProps);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/config/list');
  };

  // ==============================|| RENDER ||============================== //
  if (configLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MainCard title={isEditMode ? 'Sửa cấu hình' : 'Tạo cấu hình mới'}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                fullWidth
                label="Mã cấu hình"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                error={!!errors.code}
                helperText={errors.code}
                required
              />
            </Grid>

            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                fullWidth
                label="Tên cấu hình"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                fullWidth
                label="Loại mã"
                value={formData.codeType}
                onChange={(e) => handleInputChange('codeType', e.target.value)}
                error={!!errors.codeType}
                helperText={errors.codeType}
                required
              />
            </Grid>

            {/* Screen Names */}
            <Grid sx={{ width: '100%' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Tên màn hình
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" startIcon={<PlusOutlined />} onClick={handleScreenNameAdd}>
                  Thêm tên màn hình
                </Button>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.metaData.screenNames.map((screenName, index) => (
                  <Chip key={index} label={screenName} onDelete={() => handleScreenNameRemove(index)} color="primary" variant="outlined" />
                ))}
              </Stack>

              {errors.screenNames && <FormHelperText error>{errors.screenNames}</FormHelperText>}
            </Grid>

            {/* Data */}
            <Grid sx={{ width: '100%' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Dữ liệu
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" startIcon={<PlusOutlined />} onClick={handleDataAdd}>
                  Thêm dữ liệu
                </Button>
              </Box>

              <Stack spacing={2}>
                {formData.data.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <TextField label="Key" value={item.key} disabled sx={{ flex: 1 }} />
                    <TextField label="Value" value={item.value} disabled sx={{ flex: 1 }} />
                    <IconButton color="error" onClick={() => handleDataRemove(index)}>
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              {errors.data && <FormHelperText error>{errors.data}</FormHelperText>}
            </Grid>

            {/* Actions */}
            <Grid sx={{ width: '100%' }}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                  Hủy
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </MainCard>
  );
}

export default ConfigForm;
