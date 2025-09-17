import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import useDeliveryTerm from 'api/delivery-term';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { DeliveryTermFormData } from 'types/delivery-term';

// validation
import { deliveryTermValidationSchema } from 'validations/delivery-term.scheme';

const responsibilityOptions = [
  { value: 'SELLER', label: 'Người bán' },
  { value: 'BUYER', label: 'Người mua' }
];

const deliveryLocationOptions = [
  { value: 'PORT', label: 'Cảng' },
  { value: 'SELLER_LOCATION', label: 'Địa điểm người bán' },
  { value: 'BUYER_LOCATION', label: 'Địa điểm người mua' }
];

const incotermOptions = [
  { value: 'EXW', label: 'EXW - Ex Works' },
  { value: 'FCA', label: 'FCA - Free Carrier' },
  { value: 'CPT', label: 'CPT - Carriage Paid To' },
  { value: 'CIP', label: 'CIP - Carriage and Insurance Paid To' },
  { value: 'DAP', label: 'DAP - Delivered At Place' },
  { value: 'DPU', label: 'DPU - Delivered at Place Unloaded' },
  { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
  { value: 'FAS', label: 'FAS - Free Alongside Ship' },
  { value: 'FOB', label: 'FOB - Free On Board' },
  { value: 'CFR', label: 'CFR - Cost and Freight' },
  { value: 'CIF', label: 'CIF - Cost, Insurance and Freight' },
  { value: 'DDU', label: 'DDU - Delivered Duty Unpaid' },
  { value: 'DAT', label: 'DAT - Delivered at Terminal' }
];

const booleanOptions = [
  { value: 1, label: 'Yêu cầu' },
  { value: 0, label: 'Không yêu cầu' }
];

const statusOptions = [
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Không hoạt động' }
];

interface DeliveryTermUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

export default function DeliveryTermUpdateOrInsert({ mode = 'create' }: DeliveryTermUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { getById, create, update } = useDeliveryTerm();

  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldFetchDeliveryTerm = (isEditing || isViewing) && !!id;
  const deliveryTermId = shouldFetchDeliveryTerm ? Number(id) : 0;

  const { deliveryTerm, deliveryTermLoading, deliveryTermError } = getById(deliveryTermId);

  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      description: '',
      // deliveryDays: 1,
      // incoterm: '',
      // responsibility: 'SELLER',
      // insuranceRequired: 0,
      // packagingRequired: 1,
      // deliveryLocation: 'PORT',
      // specialInstructions: '',
      status: 1
    } as DeliveryTermFormData,
    validationSchema: deliveryTermValidationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isCreating) {
          await create(values);
        } else if (isEditing && deliveryTerm && id) {
          await update(Number(id), values);
        }

        const message = isCreating ? 'Phương thức vận chuyểnđã được tạo thành công!' : 'Phương thức vận chuyểnđã được cập nhật thành công!';
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/delivery-term');
      } catch (error) {
        console.error('Error saving delivery term:', error);
        openSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi lưu thông tin Phương thức vận chuyển',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (deliveryTerm && shouldFetchDeliveryTerm) {
      formik.setValues({
        code: deliveryTerm.code || '',
        name: deliveryTerm.name || '',
        description: deliveryTerm.description || '',
        // deliveryDays: deliveryTerm.deliveryDays || 1,
        // incoterm: deliveryTerm.incoterm || '',
        // responsibility: deliveryTerm.responsibility || 'SELLER',
        // insuranceRequired: deliveryTerm.insuranceRequired ?? 0,
        // packagingRequired: deliveryTerm.packagingRequired ?? 1,
        // deliveryLocation: deliveryTerm.deliveryLocation || 'PORT',
        // specialInstructions: deliveryTerm.specialInstructions || '',
        status: deliveryTerm.status ?? 1
      });
      formik.validateForm();
    }
  }, [deliveryTerm, shouldFetchDeliveryTerm]);

  useEffect(() => {
    if (deliveryTermError && shouldFetchDeliveryTerm) {
      console.error('Error fetching delivery term data:', deliveryTermError);
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi tải thông tin Phương thức vận chuyển',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [deliveryTermError, shouldFetchDeliveryTerm]);

  const getTitle = () => {
    if (isViewing) return 'Xem Phương thức vận chuyển';
    if (isEditing) return 'Chỉnh sửa Phương thức vận chuyển';
    return 'Tạo Phương thức vận chuyểnmới';
  };

  if (deliveryTermLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <div>Đang tải dữ liệu Phương thức vận chuyển...</div>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title={getTitle()}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <Typography variant="h5" gutterBottom>
              Thông tin cơ bản
            </Typography>
          </Grid>

          {/* Code */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-code">Mã Phương thức vận chuyển*</InputLabel>
              <TextField
                fullWidth
                id="delivery-term-code"
                name="code"
                placeholder="Nhập mã Phương thức vận chuyển"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Name */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-name">Tên Phương thức vận chuyển*</InputLabel>
              <TextField
                fullWidth
                id="delivery-term-name"
                name="name"
                placeholder="Nhập tên Phương thức vận chuyển"
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
              <InputLabel htmlFor="delivery-term-description">Mô tả *</InputLabel>
              <TextField
                fullWidth
                id="delivery-term-description"
                name="description"
                placeholder="Nhập mô tả Phương thức vận chuyển"
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

          {/* Delivery Days */}
         {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-days">Số ngày giao hàng *</InputLabel>
              <TextField
                fullWidth
                id="delivery-term-days"
                name="deliveryDays"
                type="number"
                placeholder="Nhập số ngày giao hàng"
                value={formik.values.deliveryDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.deliveryDays && Boolean(formik.errors.deliveryDays)}
                helperText={formik.touched.deliveryDays && formik.errors.deliveryDays}
                inputProps={{ min: 1, max: 365 }}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */} 

          {/* Incoterm */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-incoterm">Incoterm *</InputLabel>
              <FormControl fullWidth error={formik.touched.incoterm && Boolean(formik.errors.incoterm)}>
                <Select
                  id="delivery-term-incoterm"
                  name="incoterm"
                  value={formik.values.incoterm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Chọn incoterm
                  </MenuItem>
                  {incotermOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.incoterm && formik.errors.incoterm && <FormHelperText>{formik.errors.incoterm}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid> */} 

          {/* Responsibility */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-responsibility">Trách nhiệm *</InputLabel>
              <FormControl fullWidth error={formik.touched.responsibility && Boolean(formik.errors.responsibility)}>
                <Select
                  id="delivery-term-responsibility"
                  name="responsibility"
                  value={formik.values.responsibility}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {responsibilityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.responsibility && formik.errors.responsibility && (
                  <FormHelperText>{formik.errors.responsibility}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid> */} 

          {/* Delivery Location */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-location">Địa điểm giao hàng *</InputLabel>
              <FormControl fullWidth error={formik.touched.deliveryLocation && Boolean(formik.errors.deliveryLocation)}>
                <Select
                  id="delivery-term-location"
                  name="deliveryLocation"
                  value={formik.values.deliveryLocation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {deliveryLocationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.deliveryLocation && formik.errors.deliveryLocation && (
                  <FormHelperText>{formik.errors.deliveryLocation}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid> */} 

          {/* Insurance Required */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-insurance">Yêu cầu bảo hiểm *</InputLabel>
              <FormControl fullWidth error={formik.touched.insuranceRequired && Boolean(formik.errors.insuranceRequired)}>
                <Select
                  id="delivery-term-insurance"
                  name="insuranceRequired"
                  value={formik.values.insuranceRequired}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {booleanOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.insuranceRequired && formik.errors.insuranceRequired && (
                  <FormHelperText>{formik.errors.insuranceRequired}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid> */} 

          {/* Packaging Required */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-packaging">Yêu cầu đóng gói *</InputLabel>
              <FormControl fullWidth error={formik.touched.packagingRequired && Boolean(formik.errors.packagingRequired)}>
                <Select
                  id="delivery-term-packaging"
                  name="packagingRequired"
                  value={formik.values.packagingRequired}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {booleanOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.packagingRequired && formik.errors.packagingRequired && (
                  <FormHelperText>{formik.errors.packagingRequired}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid> */} 

          {/* Status */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-status">Trạng thái *</InputLabel>
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

          {/* Special Instructions */}
          {/*<Grid size={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="delivery-term-instructions">Hướng dẫn đặc biệt</InputLabel>
              <TextField
                fullWidth
                id="delivery-term-instructions"
                name="specialInstructions"
                placeholder="Nhập hướng dẫn đặc biệt (nếu có)"
                value={formik.values.specialInstructions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.specialInstructions && Boolean(formik.errors.specialInstructions)}
                helperText={formik.touched.specialInstructions && formik.errors.specialInstructions}
                multiline
                rows={3}
                disabled={isViewing}
              />
            </Stack>
          </Grid>  */}

          {/* Form Actions */}
          <Grid size={12}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={() => navigate('/master/delivery-term')} variant="outlined" color="secondary" disabled={loading}>
                      {isCreating ? 'Hủy' : 'Quay lại danh sách'}
                    </Button>
                    {!isViewing && (
                      <Button type="submit" variant="contained" disabled={loading}>
                        {isCreating ? 'Tạo mới' : 'Cập nhật'}
                      </Button>
                    )}
                  </Stack>
                </Grid>
        </Grid>
      </form>
    </MainCard>
  );
}
