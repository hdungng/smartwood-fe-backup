import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import useGoodSupplier from 'api/good-supplier';
import useGood from 'api/good';
import useSupplier from 'api/supplier';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { CreateGoodSupplier } from 'types/good-supplier';
import { Status, statusOptions, getStatusLabel, getStatusColor } from 'constants/status';

// validation
import { createGoodSupplierSchema } from 'validations/good-supplier.scheme';
import useCodeDetail from 'api/codeDetail';

// Constants with better type safety
const goodTypes = [
  { code: 'Level1', name: 'Loại 1' },
  { code: 'Level2', name: 'Loại 2' },
  { code: 'Level3', name: 'Loại 3' },
  { code: 'STANDARD', name: 'Standard' },
  { code: 'PREMIUM', name: 'Premium' },
  { code: 'DOMESTIC', name: 'Domestic' }
] as const;

type GoodType = (typeof goodTypes)[number]['code'];

interface GoodSupplierFormProps {
  mode?: 'create' | 'edit' | 'view';
}

// Enhanced form data interface extending the base interface
interface GoodSupplierFormData extends CreateGoodSupplier {
  // Add computed fields for better UX
  _goodName?: string;
  _supplierName?: string;
}

const formatDateForAPI = (displayDate: string | undefined): string | undefined => {
  if (!displayDate) return undefined;

  // yyyy-MM-dd → keep as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) return displayDate;

  // dd/MM/yyyy → convert to yyyy-MM-dd
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(displayDate)) {
    const [dd, mm, yyyy] = displayDate.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  // dd-MM-yyyy → convert to yyyy-MM-dd
  if (/^\d{2}-\d{2}-\d{4}$/.test(displayDate)) {
    const [dd, mm, yyyy] = displayDate.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }

  return undefined;
};

export default function GoodSupplierForm({ mode = 'create' }: GoodSupplierFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  console.log(mode);

  // API hooks with better separation of concerns
  const { getById, create, update } = useGoodSupplier();
  const { list: getGoods } = useGood();
  const { list: getSuppliers } = useSupplier();
  const { list: getQualityType } = useCodeDetail();

  // Derived state for better performance
  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldFetchGoodSupplier = (isEditing || isViewing) && !!id;
  const goodSupplierId = shouldFetchGoodSupplier ? Number(id) : 0;

  // Data fetching with proper loading states
  const { goodSupplier, goodSupplierLoading, goodSupplierError, refetch } = getById(goodSupplierId);
  const { goods, goodsLoading } = getGoods(); // Lấy tất cả goods để có thể tìm thấy item cũ
  const { suppliers, suppliersLoading } = getSuppliers(); // Lấy tất cả suppliers để có thể tìm thấy item cũ
  const { codeDetails } = getQualityType(11);

  console.log('this is codeDetail', codeDetails);

  // Memoized options for better performance - chỉ lọc khi hiển thị dropdown
  const goodOptions = useMemo(
    () =>
      (goods || [])
        .filter((good) => good.status === 1) // Chỉ lọc khi hiển thị dropdown
        .map((good) => ({ id: good.id, label: `${good.name}` })) || [],
    [goods]
  );

  const supplierOptions = useMemo(
    () =>
      (suppliers || [])
        .filter((supplier) => supplier.status === 1) // Chỉ lọc khi hiển thị dropdown
        .map((supplier) => ({ id: supplier.id, label: `${supplier.name}` })) || [],
    [suppliers]
  );

  // Enhanced formik configuration with better type safety
  const formik = useFormik<GoodSupplierFormData>({
    initialValues: {
      goodId: 0,
      supplierId: 0,
      unitPrice: undefined,
      goodType: undefined,
      startDate: undefined,
      endDate: undefined,
      // Extended fields for UX
      _goodName: '',
      _supplierName: ''
    },
    enableReinitialize: true,
    validationSchema: createGoodSupplierSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Clean data before submission (remove UX fields)
        const { _goodName, _supplierName, ...submitData } = values;

        // Convert dates to proper format if needed
        const formattedData: CreateGoodSupplier = {
          ...submitData,
          startDate: formatDateForAPI(submitData.startDate),
          endDate: formatDateForAPI(submitData.endDate)
        };

        if (isCreating) {
          await create(formattedData);
        } else if (isEditing && goodSupplier && id) {
          await update(Number(id), formattedData);
          // Force refetch after successful update
          await refetch();
        }

        const message = isCreating ? 'Good supplier relationship created successfully' : 'Good supplier relationship updated successfully';
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/good-supplier');
      } catch (error) {
        console.error('Error saving good supplier:', error);
        openSnackbar({
          open: true,
          message: 'Error saving good supplier data',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  // Effect for populating form with fetched data
  useEffect(() => {
    if (goodSupplier && shouldFetchGoodSupplier) {
      // Tìm từ tất cả goods/suppliers (không bị lọc) để có thể tìm thấy item cũ
      const selectedGood = goods?.find((g) => g.id === goodSupplier.goodId);
      const selectedSupplier = suppliers?.find((s) => s.id === goodSupplier.supplierId);

      formik.setValues({
        goodId: goodSupplier.goodId || 0,
        supplierId: goodSupplier.supplierId || 0,
        unitPrice: goodSupplier.unitPrice,
        goodType: goodSupplier.goodType,
        startDate: goodSupplier.startDate ? goodSupplier.startDate.split('T')[0] : undefined,
        endDate: goodSupplier.endDate ? goodSupplier.endDate.split('T')[0] : undefined,
        _goodName: selectedGood ? `${selectedGood.code} - ${selectedGood.name}` : '',
        _supplierName: selectedSupplier ? `${selectedSupplier.code} - ${selectedSupplier.name}` : ''
      });
    }
  }, [goodSupplier, goods, suppliers, shouldFetchGoodSupplier]);

  // Error handling effect
  useEffect(() => {
    if (goodSupplierError && shouldFetchGoodSupplier) {
      console.error('Error fetching good supplier data:', goodSupplierError);
      openSnackbar({
        open: true,
        message: 'Error loading good supplier data',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [goodSupplierError, shouldFetchGoodSupplier]);

  const getTitle = (): string => {
    switch (mode) {
      case 'view':
        return 'View Good Supplier Relationship';
      case 'edit':
        return 'Sửa thông tin chi phí hàng hóa';
      default:
        return 'Tạo thông tin chi phí hàng hóa mới';
    }
  };

  // Loading state with better UX
  if ((goodSupplierLoading && shouldFetchGoodSupplier) || goodsLoading || suppliersLoading) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading...</Typography>
        </Box>
      </MainCard>
    );
  }

  // Enhanced good selection handler with type safety
  const handleGoodChange = (_event: React.SyntheticEvent, value: { id: number; label: string } | null) => {
    const goodId = value?.id || 0;
    formik.setFieldValue('goodId', goodId);
    formik.setFieldValue('_goodName', value?.label || '');
  };

  const handleSupplierChange = (_event: React.SyntheticEvent, value: { id: number; label: string } | null) => {
    const supplierId = value?.id || 0;
    formik.setFieldValue('supplierId', supplierId);
    formik.setFieldValue('_supplierName', value?.label || '');
  };

  return (
    <MainCard title={getTitle()}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Basic Information Section */}
          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="goodId">
                Tên Hàng Hóa{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <Autocomplete
                id="goodId"
                options={goodOptions}
                value={goodOptions.find((option) => option.id === formik.values.goodId) || null}
                onChange={handleGoodChange}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a good"
                    error={formik.touched.goodId && Boolean(formik.errors.goodId)}
                    helperText={formik.touched.goodId && formik.errors.goodId}
                  />
                )}
                disabled={isViewing}
                loading={goodsLoading}
              />
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="supplierId">
                Nhà phân phối{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <Autocomplete
                id="supplierId"
                options={supplierOptions}
                value={supplierOptions.find((option) => option.id === formik.values.supplierId) || null}
                onChange={handleSupplierChange}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a supplier"
                    error={formik.touched.supplierId && Boolean(formik.errors.supplierId)}
                    helperText={formik.touched.supplierId && formik.errors.supplierId}
                  />
                )}
                disabled={isViewing}
                loading={suppliersLoading}
              />
            </Stack>
          </Grid>

          {/* Pricing & Type Section */}
          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="unitPrice">
                Giá tiền{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>

              <TextField
                fullWidth
                id="unitPrice"
                name="unitPrice"
                type="number"
                placeholder="Enter unit price"
                value={formik.values.unitPrice || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                helperText={formik.touched.unitPrice && formik.errors.unitPrice}
                disabled={isViewing}
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
              />
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="goodType">
                Loại hàng hóa{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.goodType && Boolean(formik.errors.goodType)}>
                <Select
                  id="goodType"
                  name="goodType"
                  value={formik.values.goodType || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                  disabled={isViewing}
                  displayEmpty
                >
                  {codeDetails.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                                            {type.name}                   {' '}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.goodType && formik.errors.goodType && <FormHelperText>{formik.errors.goodType}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>

          {/* Date Range Section */}
          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="startDate">
                Thời gian bắt đầu{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <DatePicker
                label="Start Date"
                value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                onChange={(value) => {
                  const v = value ? dayjs(value).format('YYYY-MM-DD') : undefined;
                  formik.setFieldValue('startDate', v);
                  formik.setFieldTouched('startDate', true); // Mark as touched
                  // Trigger validation after setting value
                  setTimeout(() => formik.validateField('startDate'), 0);
                }}
                onClose={() => {
                  formik.setFieldTouched('startDate', true); // Mark as touched when closed
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: { size: 'medium', fullWidth: true, placeholder: 'dd/MM/yyyy', id: 'startDate', name: 'startDate' }
                }}
                disabled={isViewing}
              />
              {formik.touched.startDate && formik.errors.startDate ? (
                <FormHelperText error>{formik.errors.startDate}</FormHelperText>
              ) : null}
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="endDate">
                Thời gian kết thúc{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <DatePicker
                label="End Date"
                value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                onChange={(value) => {
                  const v = value ? dayjs(value).format('YYYY-MM-DD') : undefined;
                  formik.setFieldValue('endDate', v);
                  formik.setFieldTouched('endDate', true); // Mark as touched
                  // Trigger validation after setting value
                  setTimeout(() => formik.validateField('endDate'), 0);
                }}
                onClose={() => {
                  formik.setFieldTouched('endDate', true); // Mark as touched when closed
                }}
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'medium', fullWidth: true, placeholder: 'dd/MM/yyyy', id: 'endDate', name: 'endDate' } }}
                disabled={isViewing}
              />
              {formik.touched.endDate && formik.errors.endDate ? <FormHelperText error>{formik.errors.endDate}</FormHelperText> : null}
            </Stack>
          </Grid>

          {/* Summary Section for View Mode */}
          {isViewing && (
            <>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Relationship Summary
                </Typography>
              </Grid>

              <Grid size={12}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="subtitle2">Status:</Typography>
                      <Chip variant="light" color="success" size="small" label="Active" />
                    </Stack>

                    {formik.values.unitPrice && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2">Unit Price:</Typography>
                        <Typography>${formik.values.unitPrice.toFixed(2)}</Typography>
                      </Stack>
                    )}

                    {formik.values.startDate && formik.values.endDate && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2">Valid Period:</Typography>
                        <Typography>
                          {dayjs(formik.values.startDate).format('DD/MM/YYYY')} - {dayjs(formik.values.endDate).format('DD/MM/YYYY')}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Grid>
            </>
          )}
        </Grid>

        {/* Action Buttons */}
        {!isViewing && (
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={() => navigate('/master/good-supplier')} color="secondary" disabled={loading}>
              Cancel
            </Button>
            <AnimateButton>
              <Button disableElevation disabled={loading || !formik.isValid} size="large" type="submit" variant="contained" color="primary">
                {loading ? 'Saving...' : isEditing ? 'Edit' : 'Create'}
              </Button>
            </AnimateButton>
          </Stack>
        )}
      </form>
    </MainCard>
  );
}
