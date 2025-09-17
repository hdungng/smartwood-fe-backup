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
import usePaymentTerm from 'api/payment-term';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { PaymentTermFormData } from 'types/payment-term';

// validation
import { paymentTermValidationSchema } from 'validations/payment-term.scheme';

const paymentMethodOptions = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'CREDIT', label: 'Tín dụng' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  { value: 'CHECK', label: 'Séc' }
];

const statusOptions = [
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Không hoạt động' }
];

interface PaymentTermUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

export default function PaymentTermUpdateOrInsert({ mode = 'create' }: PaymentTermUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { getById, create, update } = usePaymentTerm();

  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldFetchPaymentTerm = (isEditing || isViewing) && !!id;
  const paymentTermId = shouldFetchPaymentTerm ? Number(id) : 0;

  const { paymentTerm, paymentTermLoading, paymentTermError } = getById(paymentTermId);

  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      description: '',
      paymentDays: 0,
      discountPercentage: 0,
      discountDays: 0,
      lateFeePercentage: 0,
      lateFeeDays: 0,
      paymentMethod: 'CASH' as const,
      status: 1
    } as PaymentTermFormData,
    validationSchema: paymentTermValidationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isCreating) {
          await create(values);
        } else if (isEditing && paymentTerm && id) {
          await update(Number(id), values);
        }

        const message = isCreating ? 'Điều kiện thanh toán đã được tạo thành công!' : 'Điều kiện thanh toán đã được cập nhật thành công!';
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/payment-term');
      } catch (error) {
        console.error('Error saving payment term:', error);
        openSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi lưu thông tin điều kiện thanh toán',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (paymentTerm && shouldFetchPaymentTerm) {
      formik.setValues({
        code: paymentTerm.code || '',
        name: paymentTerm.name || '',
        description: paymentTerm.description || '',
        paymentDays: paymentTerm.paymentDays || 0,
        discountPercentage: paymentTerm.discountPercentage || 0,
        discountDays: paymentTerm.discountDays || 0,
        lateFeePercentage: paymentTerm.lateFeePercentage || 0,
        lateFeeDays: paymentTerm.lateFeeDays || 0,
        paymentMethod: paymentTerm.paymentMethod || 'CASH',
        status: paymentTerm.status ?? 1
      });
      formik.validateForm();
    }
  }, [paymentTerm, shouldFetchPaymentTerm]);

  useEffect(() => {
    if (paymentTermError && shouldFetchPaymentTerm) {
      console.error('Error fetching payment term data:', paymentTermError);
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi tải thông tin điều kiện thanh toán',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [paymentTermError, shouldFetchPaymentTerm]);

  const getTitle = () => {
    if (isViewing) return 'Xem điều kiện thanh toán';
    if (isEditing) return 'Chỉnh sửa điều kiện thanh toán';
    return 'Tạo điều kiện thanh toán mới';
  };

  if (paymentTermLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <div>Đang tải dữ liệu điều kiện thanh toán...</div>
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-code">Mã điều kiện thanh toán *</InputLabel>
              <TextField
                fullWidth
                id="payment-term-code"
                name="code"
                placeholder="Nhập mã điều kiện thanh toán"
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-name">Tên điều kiện thanh toán *</InputLabel>
              <TextField
                fullWidth
                id="payment-term-name"
                name="name"
                placeholder="Nhập tên điều kiện thanh toán"
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
              <InputLabel htmlFor="payment-term-description">Mô tả *</InputLabel>
              <TextField
                fullWidth
                id="payment-term-description"
                name="description"
                placeholder="Nhập mô tả điều kiện thanh toán"
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

          {/* Payment Information */}
          <Grid size={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Thông tin thanh toán
            </Typography>
          </Grid>

          {/* Payment Days */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-days">Số ngày thanh toán *</InputLabel>
              <TextField
                fullWidth
                id="payment-term-days"
                name="paymentDays"
                type="number"
                placeholder="Nhập số ngày thanh toán"
                value={formik.values.paymentDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.paymentDays && Boolean(formik.errors.paymentDays)}
                helperText={formik.touched.paymentDays && formik.errors.paymentDays}
                inputProps={{ min: 0, max: 365 }}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Payment Method */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-method">Phương thức thanh toán *</InputLabel>
              <FormControl fullWidth error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}>
                <Select
                  id="payment-term-method"
                  name="paymentMethod"
                  value={formik.values.paymentMethod}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {paymentMethodOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                  <FormHelperText>{formik.errors.paymentMethod}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid> */}

          {/* Status */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-status">Trạng thái *</InputLabel>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <Select
                  id="payment-term-status"
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
          </Grid> */}

          {/* Discount Information */}
          {/* <Grid size={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Thông tin chiết khấu
            </Typography>
          </Grid> */}

          {/* Discount Percentage */}
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-discount-percentage">Phần trăm chiết khấu (%)</InputLabel>
              <TextField
                fullWidth
                id="payment-term-discount-percentage"
                name="discountPercentage"
                type="number"
                placeholder="Nhập phần trăm chiết khấu"
                value={formik.values.discountPercentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.discountPercentage && Boolean(formik.errors.discountPercentage)}
                helperText={formik.touched.discountPercentage && formik.errors.discountPercentage}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* Discount Days */}
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-discount-days">Số ngày chiết khấu</InputLabel>
              <TextField
                fullWidth
                id="payment-term-discount-days"
                name="discountDays"
                type="number"
                placeholder="Nhập số ngày chiết khấu"
                value={formik.values.discountDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.discountDays && Boolean(formik.errors.discountDays)}
                helperText={formik.touched.discountDays && formik.errors.discountDays}
                inputProps={{ min: 0, max: 365 }}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* Late Fee Information */}
          {/* <Grid size={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Thông tin phí trễ hạn
            </Typography>
          </Grid> */}

          {/* Late Fee Percentage */}
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-late-fee-percentage">Phần trăm phí trễ hạn (%)</InputLabel>
              <TextField
                fullWidth
                id="payment-term-late-fee-percentage"
                name="lateFeePercentage"
                type="number"
                placeholder="Nhập phần trăm phí trễ hạn"
                value={formik.values.lateFeePercentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lateFeePercentage && Boolean(formik.errors.lateFeePercentage)}
                helperText={formik.touched.lateFeePercentage && formik.errors.lateFeePercentage}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* Late Fee Days */}
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <InputLabel htmlFor="payment-term-late-fee-days">Số ngày phí trễ hạn</InputLabel>
              <TextField
                fullWidth
                id="payment-term-late-fee-days"
                name="lateFeeDays"
                type="number"
                placeholder="Nhập số ngày phí trễ hạn"
                value={formik.values.lateFeeDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lateFeeDays && Boolean(formik.errors.lateFeeDays)}
                helperText={formik.touched.lateFeeDays && formik.errors.lateFeeDays}
                inputProps={{ min: 0, max: 365 }}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}
        </Grid>

        {!isViewing && (
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={() => navigate('/master/payment-term')} color="secondary">
              Hủy bỏ
            </Button>
            <AnimateButton>
              <Button disableElevation disabled={loading} size="large" type="submit" variant="contained" color="primary">
                {loading ? 'Đang xử lý...' : isCreating ? 'Tạo điều kiện thanh toán' : 'Cập nhật'}
              </Button>
            </AnimateButton>
          </Stack>
        )}
      </form>
    </MainCard>
  );
}
