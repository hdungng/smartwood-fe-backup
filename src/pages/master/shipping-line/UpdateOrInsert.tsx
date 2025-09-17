import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

// project imports
import { openSnackbar } from 'api/snackbar';
import MainCard from 'components/MainCard';
import useShippingLine from 'api/shipping-line';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { ShippingLineFormData, ShippingLine } from 'types/shipping-line';

// validation
import { shippingLineSchema } from 'validations/shipping-line.scheme';
import { FormControl, FormHelperText, MenuItem, Select } from '@mui/material';

interface ShippingLineUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

export default function ShippingLineUpdateOrInsert({ mode = 'create' }: ShippingLineUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [createdShippingLine, setCreatedShippingLine] = useState<ShippingLine | null>(null);
  const [modeTransitionLoading, setModeTransitionLoading] = useState(false);

  const { getById, create, update } = useShippingLine();

  const isEditing = currentMode === 'edit' && (!!id || !!createdShippingLine);
  const isViewing = currentMode === 'view';
  const isCreating = currentMode === 'create';

  const shouldFetchShippingLine = (isEditing || isViewing) && !!id;
  const shippingLineId = shouldFetchShippingLine ? Number(id) : createdShippingLine ? createdShippingLine.id : 0;

  const { shippingLine, shippingLineLoading, shippingLineError, refetch: refetchShippingLine } = getById(shippingLineId);
  const statusOptions = [
    { value: 1, label: 'Hoạt động' },
    { value: 0, label: 'Không hoạt động' }
  ];
  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      description: '',
      status: 1
    } as ShippingLineFormData,
    validationSchema: shippingLineSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isCreating) {
          const newShippingLine = await create(values);

          // Show transition loading
          setModeTransitionLoading(true);

          // Show success message and switch to edit mode
          openSnackbar({
            open: true,
            message: 'Tạo shipping line thành công!',
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Small delay for smooth transition
          setTimeout(() => {
            setCreatedShippingLine(newShippingLine);
            setCurrentMode('edit');
            setModeTransitionLoading(false);
          }, 500);
          return;
        } else if (isEditing && (shippingLine || createdShippingLine) && (id || createdShippingLine)) {
          const updateId = id ? Number(id) : createdShippingLine?.id || 0;
          await update(updateId, values);

          openSnackbar({
            open: true,
            message: 'Cập nhật shipping line thành công!',
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Stay on the same page after updating
          return;
        }
      } catch (error) {
        console.error('Error saving shipping line:', error);
        openSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi lưu shipping line',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    const shippingLineData = shippingLine || createdShippingLine;
    if (shippingLineData && (shouldFetchShippingLine || createdShippingLine)) {
      formik.setValues({
        code: shippingLineData.code || '',
        name: shippingLineData.name || '',
        description: shippingLine?.description || '',
        status: shippingLine?.status || 0
      });
      formik.validateForm();
    }
  }, [shippingLine, createdShippingLine, shouldFetchShippingLine]);

  useEffect(() => {
    if (shippingLineError && shouldFetchShippingLine) {
      console.error('Error fetching shipping line data:', shippingLineError);
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi tải dữ liệu shipping line',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [shippingLineError, shouldFetchShippingLine]);

  const getTitle = () => {
    if (isViewing) return 'Xem thông tin shipping line';
    if (isEditing) return 'Chỉnh sửa shipping line';
    return 'Tạo shipping line mới';
  };

  if (shippingLineLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={24} />
            <div>Đang tải thông tin shipping line...</div>
          </Stack>
        </Box>
      </MainCard>
    );
  }

  if (modeTransitionLoading) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <Fade in={modeTransitionLoading}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={32} />
              <div>Đang chuẩn bị form chỉnh sửa...</div>
            </Stack>
          </Fade>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title={getTitle()}>
      <Box position="relative">
        <Fade in={true} timeout={300}>
          <Box>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid size={12}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  {isCreating && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      💡 <strong>Lưu ý:</strong> Vui lòng nhập đầy đủ thông tin shipping line.
                    </Typography>
                  )}
                  {isEditing && createdShippingLine && (
                    <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                      ✅ <strong>Shipping line đã được tạo thành công!</strong>
                    </Typography>
                  )}
                </Grid>

                <Grid size={6}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="code">
                      Mã{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="code"
                      name="code"
                      placeholder="Nhập mã shipping line"
                      value={formik.values.code}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.code && Boolean(formik.errors.code)}
                      helperText={formik.touched.code && formik.errors.code}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={6}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="name">
                      Tên Shipping Line{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      placeholder="Nhập tên shipping line"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>
                {/* Description */}
                <Grid size={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="delivery-term-description">Mô tả <Typography variant="caption" color="error">
                        *
                      </Typography></InputLabel>
                    <TextField
                      fullWidth
                      id="delivery-term-description"
                      name="description"
                      placeholder="Nhập mô tả shipping line"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      multiline
                      rows={3}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>
                {/* Status */}
                <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="delivery-term-status">Trạng thái <Typography variant="caption" color="error">
                        *
                      </Typography></InputLabel>
                    <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                      <Select
                        id="delivery-term-status"
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={isViewing}
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.status && formik.errors.status && <FormHelperText>{formik.errors.status}</FormHelperText>}
                    </FormControl>
                  </Stack>
                </Grid>
                {/* Action Buttons */}
                <Grid size={12}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={() => navigate('/master/shipping-line')} variant="outlined" color="secondary" disabled={loading}>
                      {isCreating ? 'Hủy' : 'Quay lại danh sách'}
                    </Button>
                    {!isViewing && (
                      <Button type="submit" variant="contained" disabled={loading} onClick={() => navigate('/master/shipping-line')}>
                        {isCreating ? 'Tạo mới' : 'Cập nhật'}
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Fade>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
          open={loading}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={32} />
            <div style={{ color: '#333' }}>{isCreating ? 'Đang tạo shipping line...' : 'Đang cập nhật shipping line...'}</div>
          </Stack>
        </Backdrop>
      </Box>
    </MainCard>
  );
}
