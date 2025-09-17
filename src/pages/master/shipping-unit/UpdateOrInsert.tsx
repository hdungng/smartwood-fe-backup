import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Rating,
  FormControlLabel,
  Switch,
  Autocomplete
} from '@mui/material';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import useShippingUnit from 'api/shipping-unit';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { ShippingUnitFormData } from 'types/shipping-unit';

// validation
import { shippingUnitValidationSchema } from 'validations/shipping-unit.scheme';
import { getProvincesByRegion, Province, vietnamRegions } from 'data/vietnam-location';

const serviceTypeOptions = [
  { value: 'DOMESTIC', label: 'Trong nước' },
  { value: 'INTERNATIONAL', label: 'Quốc tế' },
  { value: 'BOTH', label: 'Tất cả' }
];

const statusOptions = [
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Không hoạt động' }
];

interface ShippingUnitUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

export default function ShippingUnitUpdateOrInsert({ mode = 'create' }: ShippingUnitUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { getById, create, update } = useShippingUnit();

  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldFetchShippingUnit = (isEditing || isViewing) && !!id;
  const shippingUnitId = shouldFetchShippingUnit ? Number(id) : 0;

  const { shippingUnit, shippingUnitLoading, shippingUnitError } = getById(shippingUnitId);

  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      fullName: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      website: '',
      serviceType: 'DOMESTIC' as 'DOMESTIC' | 'INTERNATIONAL' | 'BOTH',
      trackingUrl: '',
      region: '',
      pricePerKg: 0,
      pricePerKm: 0,
      basePrice: 0,
      deliveryTimeDomestic: 0,
      deliveryTimeInternational: 0,
      rating: 5,
      isPreferred: 0,
      status: 1,
      companyName: '',
      taxCode: '',
      bankAccount: '',
      bankName: ''
    } as ShippingUnitFormData,
    validationSchema: shippingUnitValidationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (isCreating) {
          await create(values);
        } else if (isEditing && id) {
          await update(Number(id), values);
        }

        const message = isCreating ? 'Đơn vị vận chuyển đã được tạo thành công!' : 'Đơn vị vận chuyển đã được cập nhật thành công!';

        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/shipping-unit');
      } catch (error) {
        console.error('Error saving shipping unit:', error);
        openSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi lưu thông tin đơn vị vận chuyển',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });
  const allowedServiceTypes = ['DOMESTIC', 'INTERNATIONAL', 'BOTH'] as const;
  type ServiceType = (typeof allowedServiceTypes)[number];

  const handleRegionChange = (event: any, newValue: string | null) => {
    formik.setFieldValue('region', newValue || '');
    formik.setFieldValue('province', '');
    formik.setFieldValue('district', '');

    if (newValue) {
      const provinces = getProvincesByRegion(newValue);
      setAvailableProvinces(provinces);
    } else {
      setAvailableProvinces([]);
    }
    setAvailableDistricts([]);
  };

  const validateServiceType = (val: string): ServiceType => {
    return allowedServiceTypes.includes(val as ServiceType) ? (val as ServiceType) : 'DOMESTIC';
  };
  useEffect(() => {
    if (shippingUnit && shouldFetchShippingUnit) {
      formik.setValues({
        code: shippingUnit.code || '',
        name: shippingUnit.name || '',
        fullName: shippingUnit.fullName || '',
        phone: shippingUnit.phone || '',
        email: shippingUnit.email || '',
        address: shippingUnit.address || '',
        contactPerson: shippingUnit.contactPerson || '',
        contactPhone: shippingUnit.contactPhone || '',
        contactEmail: shippingUnit.contactEmail || '',
        website: shippingUnit.website || '',
        serviceType: validateServiceType(shippingUnit.serviceType),
        trackingUrl: shippingUnit.trackingUrl || '',
        region: shippingUnit.region || '',
        pricePerKg: shippingUnit.pricePerKg || 0,
        pricePerKm: shippingUnit.pricePerKm || 0,
        basePrice: shippingUnit.basePrice || 0,
        deliveryTimeDomestic: shippingUnit.deliveryTimeDomestic || 0,
        deliveryTimeInternational: shippingUnit.deliveryTimeInternational || 0,
        rating: shippingUnit.rating || 5,
        isPreferred: shippingUnit.isPreferred || 0,
        status: shippingUnit.status || 1,
        companyName: shippingUnit.companyName || '',
        taxCode: shippingUnit.taxCode || '',
        bankAccount: shippingUnit.bankAccount || '',
        bankName: shippingUnit.bankName || ''

      });
      formik.validateForm();
    }
  }, [shippingUnit, shouldFetchShippingUnit]);

  useEffect(() => {
    if (shippingUnitError && shouldFetchShippingUnit) {
      console.error('Error fetching shipping unit data:', shippingUnitError);
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi tải thông tin đơn vị vận chuyển',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [shippingUnitError, shouldFetchShippingUnit]);

  const getTitle = () => {
    if (isViewing) return 'Xem đơn vị vận chuyển';
    if (isEditing) return 'Chỉnh sửa đơn vị vận chuyển';
    return 'Tạo đơn vị vận chuyển mới';
  };

  if (shippingUnitLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <div>Đang tải dữ liệu đơn vị vận chuyển...</div>
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

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="code">
                Mã đơn vị vận chuyển{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="code"
                name="code"
                placeholder="Nhập mã đơn vị vận chuyển"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="name">
                Tên vận tải{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                placeholder="Nhập tên vận tải"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={isViewing}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="region">Miền <Typography variant="caption" color="error">
                *
              </Typography></InputLabel>

              <Autocomplete
                id="region"
                options={vietnamRegions.map((region) => region.code)}
                getOptionLabel={(option) => vietnamRegions.find((r) => r.code === option)?.name || ''}
                value={formik.values.region || null}
                onChange={handleRegionChange}
                onBlur={formik.handleBlur}
                disabled={isViewing}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="region"
                    placeholder="Chọn vùng miền"
                    error={formik.touched.region && Boolean(formik.errors.region)}
                    helperText={formik.touched.region && formik.errors.region}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="companyName">Tên công ty <Typography variant="caption" color="error">
                *
              </Typography></InputLabel>
              <TextField
                fullWidth
                id="companyName"
                name="companyName"
                placeholder="Nhập tên công ty"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                helperText={formik.touched.companyName && formik.errors.companyName}
                disabled={isViewing}
              />
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="taxCode">Mã số thuế <Typography variant="caption" color="error">
                *
              </Typography></InputLabel>
              <TextField
                fullWidth
                id="taxCode"
                name="taxCode"
                placeholder="Nhập mã số thuế"
                value={formik.values.taxCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.taxCode && Boolean(formik.errors.taxCode)}
                helperText={formik.touched.taxCode && formik.errors.taxCode}
                disabled={isViewing}
              />
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="address">Địa chỉ <Typography variant="caption" color="error">
                *
              </Typography></InputLabel>
              <TextField
                fullWidth
                id="address"
                name="address"
                placeholder="Nhập địa chỉ"
                multiline
                rows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                disabled={isViewing}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="bankAccount">Số tài khoản <Typography variant="caption" color="error">
                *
              </Typography></InputLabel>
              <TextField
                fullWidth
                id="bankAccount"
                name="bankAccount"
                placeholder="Nhập tên đầy đủ của đơn vị vận chuyển"
                value={formik.values.bankAccount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bankAccount && Boolean(formik.errors.bankAccount)}
                helperText={formik.touched.bankAccount && formik.errors.bankAccount}
                disabled={isViewing}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="bankName">Ngân hàng <Typography variant="caption" color="error">
                *
              </Typography></InputLabel>
              <TextField
                fullWidth
                id="bankName"
                name="bankName"
                placeholder="Nhập tên đầy đủ của đơn vị vận chuyển"
                value={formik.values.bankName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bankName && Boolean(formik.errors.bankName)}
                helperText={formik.touched.bankName && formik.errors.bankName}
                disabled={isViewing}
              />
            </Stack>
          </Grid>
          {/*
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="fullName">Tên đầy đủ</InputLabel>
              <TextField
                fullWidth
                id="fullName"
                name="fullName"
                placeholder="Nhập tên đầy đủ của đơn vị vận chuyển"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                helperText={formik.touched.fullName && formik.errors.fullName}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="serviceType">
                Loại dịch vụ{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.serviceType && Boolean(formik.errors.serviceType)}>
                <Select
                  id="serviceType"
                  name="serviceType"
                  value={formik.values.serviceType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {serviceTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.serviceType && formik.errors.serviceType && <FormHelperText>{formik.errors.serviceType}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="status">Trạng thái</InputLabel>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <Select
                  id="status"
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
          */}
          {/* Contact Information */}
          {/*<Grid size={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Thông tin liên hệ
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="phone">Điện thoại</InputLabel>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="email">Email</InputLabel>
              <TextField
                fullWidth
                id="email"
                name="email"
                placeholder="Nhập địa chỉ email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={isViewing}
              />
            </Stack>
          </Grid>



          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="contactPerson">Người liên hệ</InputLabel>
              <TextField
                fullWidth
                id="contactPerson"
                name="contactPerson"
                placeholder="Nhập tên người liên hệ"
                value={formik.values.contactPerson}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                helperText={formik.touched.contactPerson && formik.errors.contactPerson}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="contactPhone">Điện thoại liên hệ</InputLabel>
              <TextField
                fullWidth
                id="contactPhone"
                name="contactPhone"
                placeholder="Nhập số điện thoại liên hệ"
                value={formik.values.contactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactPhone && Boolean(formik.errors.contactPhone)}
                helperText={formik.touched.contactPhone && formik.errors.contactPhone}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="contactEmail">Email liên hệ</InputLabel>
              <TextField
                fullWidth
                id="contactEmail"
                name="contactEmail"
                placeholder="Nhập email liên hệ"
                type="email"
                value={formik.values.contactEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                helperText={formik.touched.contactEmail && formik.errors.contactEmail}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="website">Website</InputLabel>
              <TextField
                fullWidth
                id="website"
                name="website"
                placeholder="Nhập địa chỉ website"
                type="url"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.website && Boolean(formik.errors.website)}
                helperText={formik.touched.website && formik.errors.website}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="trackingUrl">URL theo dõi</InputLabel>
              <TextField
                fullWidth
                id="trackingUrl"
                name="trackingUrl"
                placeholder="Nhập URL để theo dõi đơn hàng"
                type="url"
                value={formik.values.trackingUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.trackingUrl && Boolean(formik.errors.trackingUrl)}
                helperText={formik.touched.trackingUrl && formik.errors.trackingUrl}
                disabled={isViewing}
              />
            </Stack>
          </Grid>*/}

          {/* Pricing Information */}
          {/*<Grid size={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Thông tin giá cước
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="basePrice">Giá cơ bản (VNĐ)</InputLabel>
              <TextField
                fullWidth
                id="basePrice"
                name="basePrice"
                placeholder="Nhập giá cơ bản"
                type="number"
                inputProps={{ min: 0, step: 1000 }}
                value={formik.values.basePrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.basePrice && Boolean(formik.errors.basePrice)}
                helperText={formik.touched.basePrice && formik.errors.basePrice}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="pricePerKg">Giá/kg (VNĐ)</InputLabel>
              <TextField
                fullWidth
                id="pricePerKg"
                name="pricePerKg"
                placeholder="Nhập giá mỗi kg"
                type="number"
                inputProps={{ min: 0, step: 100 }}
                value={formik.values.pricePerKg}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pricePerKg && Boolean(formik.errors.pricePerKg)}
                helperText={formik.touched.pricePerKg && formik.errors.pricePerKg}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="pricePerKm">Giá/km (VNĐ)</InputLabel>
              <TextField
                fullWidth
                id="pricePerKm"
                name="pricePerKm"
                placeholder="Nhập giá mỗi km"
                type="number"
                inputProps={{ min: 0, step: 100 }}
                value={formik.values.pricePerKm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pricePerKm && Boolean(formik.errors.pricePerKm)}
                helperText={formik.touched.pricePerKm && formik.errors.pricePerKm}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Service Information */}
          {/*<Grid size={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Thông tin dịch vụ
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="deliveryTimeDomestic">Thời gian giao hàng trong nước (ngày)</InputLabel>
              <TextField
                fullWidth
                id="deliveryTimeDomestic"
                name="deliveryTimeDomestic"
                placeholder="Nhập số ngày giao hàng trong nước"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={formik.values.deliveryTimeDomestic}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.deliveryTimeDomestic && Boolean(formik.errors.deliveryTimeDomestic)}
                helperText={formik.touched.deliveryTimeDomestic && formik.errors.deliveryTimeDomestic}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="deliveryTimeInternational">Thời gian giao hàng quốc tế (ngày)</InputLabel>
              <TextField
                fullWidth
                id="deliveryTimeInternational"
                name="deliveryTimeInternational"
                placeholder="Nhập số ngày giao hàng quốc tế"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={formik.values.deliveryTimeInternational}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.deliveryTimeInternational && Boolean(formik.errors.deliveryTimeInternational)}
                helperText={formik.touched.deliveryTimeInternational && formik.errors.deliveryTimeInternational}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="rating">Đánh giá</InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  name="rating"
                  value={formik.values.rating}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('rating', newValue || 1);
                  }}
                  disabled={isViewing}
                  max={5}
                />
                <Typography variant="body2" color="text.secondary">
                  {formik.values.rating}/5
                </Typography>
              </Box>
              {formik.touched.rating && formik.errors.rating && <FormHelperText error>{formik.errors.rating}</FormHelperText>}
            </Stack>
          </Grid>

          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formik.values.isPreferred)}
                    onChange={(e) => formik.setFieldValue('isPreferred', e.target.checked ? 1 : 0)}
                    disabled={isViewing}
                  />
                }
                label="Đơn vị vận chuyển ưu tiên"
              />
              {formik.touched.isPreferred && formik.errors.isPreferred && (
                <FormHelperText error>{formik.errors.isPreferred}</FormHelperText>
              )}
            </Stack>
          </Grid>

          {/* Action Buttons */}
          <Grid size={12}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={() => navigate('/master/shipping-unit')} variant="outlined" color="secondary" disabled={loading}>
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
function setAvailableProvinces(provinces: Province[]) {
  throw new Error('Function not implemented.');
}

function setAvailableDistricts(arg0: never[]) {
  throw new Error('Function not implemented.');
}

