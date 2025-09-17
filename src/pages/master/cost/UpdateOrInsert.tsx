import { useEffect, useState } from 'react';
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
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import useCost from 'api/cost';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { CreateCostData, TCost } from 'types/cost';
import { Status, statusOptions, getStatusColor } from 'constants/status';

// validation
import { costSchema } from 'validations/cost.scheme';
import { CURRENCY_OPTIONS } from 'sections/apps/cost/MetaData';
import InputDatePicker from 'components/@extended/input/input-date-picker';

// Import danh sách mã hạng mục chi phí
import { costItemOptions, costGroupOptions, categoryOptions } from './cost';

interface Props {
  mode?: 'create' | 'edit' | 'view';
}

export default function CostUpdateOrInsert({ mode = 'create' }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { getById, create, update } = useCost();

  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldFetch = (isEditing || isViewing) && !!id;
  const costId = shouldFetch ? Number(id) : 0;

  const { cost: costData, costLoading: fetchLoading, costError: fetchError } = getById(costId);

  const formik = useFormik({
    initialValues: {
      costGroup: 'purchaseOrder',
      codeType: '',
      itemCode: '',
      amount: 0,
      currency: 'VND',
      effectiveFrom: '',
      effectiveTo: '',
      status: Status.ACTIVE
    } as {
      costGroup: string;
      codeType: string;
      itemCode: string;
      amount: number;
      currency: string;
      effectiveFrom: string;
      effectiveTo: string;
      status: number;
    },
    validationSchema: costSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const { status, ...submitData } = values;

        let completeData: CreateCostData;

        if (submitData.costGroup === 'purchaseOrder') {
          const selectedCostItem = costItemOptions.find((item) => item.value === submitData.itemCode);
          completeData = {
            itemCode: submitData.itemCode,
            costType: submitData.codeType || 'logistics',
            name: (selectedCostItem?.label as string) || '',
            amount: submitData.amount,
            currency: submitData.currency,
            effectiveFrom: submitData.effectiveFrom,
            effectiveTo: submitData.effectiveTo
          };
        } else {
          completeData = {
            itemCode: '',
            costType: 'other',
            name: '',
            amount: submitData.amount,
            currency: submitData.currency,
            effectiveFrom: submitData.effectiveFrom,
            effectiveTo: submitData.effectiveTo
          };
        }

        if (isCreating) {
          await create(completeData);
        } else if (isEditing && costData && id) {
          await update(Number(id), { id: Number(id), ...completeData });
        }

        openSnackbar({
          open: true,
          message: isCreating ? 'Chi phí đã được tạo thành công' : 'Chi phí đã được cập nhật thành công',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/logistics-cost');
      } catch (error) {
        openSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi lưu dữ liệu chi phí',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (costData && shouldFetch) {
      const inferredGroup = costData.costType === 'other' ? 'other' : 'purchaseOrder';
      const inferredCodeType = costData.costType === 'other' ? 'other' : costData.costType;
      formik.setValues({
        costGroup: inferredGroup,
        codeType: inferredCodeType,
        itemCode: costData.itemCode || '',
        amount: costData.currency === '%' ? Number(costData.amount) : Number(costData.amount),
        currency: costData.currency || 'VND',
        effectiveFrom: costData.effectiveFrom || '',
        effectiveTo: costData.effectiveTo || '',
        status: costData.status ?? Status.ACTIVE
      });
      formik.validateForm();
    }
  }, [costData, shouldFetch]);

  useEffect(() => {
    if (fetchError && shouldFetch) {
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi tải dữ liệu chi phí',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [fetchError, shouldFetch]);

  const getTitle = () => {
    if (isViewing) return 'Xem chi phí';
    if (isEditing) return 'Chỉnh sửa chi phí';
    return 'Tạo chi phí mới';
  };

  if (fetchLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <div>Đang tải dữ liệu chi phí...</div>
        </Box>
      </MainCard>
    );
  }

  const filteredItemOptions = formik.values.codeType
    ? costItemOptions.filter((o) => o.category === formik.values.codeType)
    : costItemOptions;

  return (
    <MainCard title={getTitle()}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Thông tin chi phí
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Chọn nhóm chi phí, sau đó chọn loại danh mục và mã hạng mục nếu là chi phí hợp đồng mua.
            </Typography>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="costGroup">
                Nhóm chi phí{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <Autocomplete
                disablePortal
                options={costGroupOptions}
                value={costGroupOptions.find((t) => t.value === formik.values.costGroup) || null}
                onChange={(_, option) => {
                  formik.setFieldValue('costGroup', option?.value || '');
                  // Reset các trường phụ thuộc
                  formik.setFieldValue('codeType', '');
                  formik.setFieldValue('itemCode', '');
                }}
                getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    onBlur={formik.handleBlur}
                    error={formik.touched.costGroup && Boolean((formik.errors as any).costGroup)}
                    helperText={formik.touched.costGroup && (formik.errors as any).costGroup}
                  />
                )}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {formik.values.costGroup === 'purchaseOrder' && (
            <>
              <Grid size={6}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="codeType">
                    Loại danh mục{' '}
                    <Typography variant="caption" color="error">
                      *
                    </Typography>
                  </InputLabel>
                  <Autocomplete
                    disablePortal
                    options={categoryOptions}
                    value={categoryOptions.find((t) => t.value === formik.values.codeType) || null}
                    onChange={(_, option) => {
                      formik.setFieldValue('codeType', option?.value || '');
                      formik.setFieldValue('itemCode', '');
                    }}
                    getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        onBlur={formik.handleBlur}
                        error={formik.touched.codeType && Boolean((formik.errors as any).codeType)}
                        helperText={formik.touched.codeType && (formik.errors as any).codeType}
                      />
                    )}
                    disabled={isViewing}
                  />
                </Stack>
              </Grid>

              <Grid size={6}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="itemCode">
                    Mã hạng mục{' '}
                    <Typography variant="caption" color="error">
                      *
                    </Typography>
                  </InputLabel>
                  <Autocomplete
                    disablePortal
                    options={filteredItemOptions}
                    value={filteredItemOptions.find((t) => t.value === formik.values.itemCode) || null}
                    onChange={(_, option) => {
                      if (option) {
                        formik.setFieldValue('itemCode', option.value);
                      } else {
                        formik.setFieldValue('itemCode', '');
                      }
                    }}
                    getOptionLabel={(o) => (typeof o === 'string' ? o : (o.label as string))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        onBlur={formik.handleBlur}
                        error={formik.touched.itemCode && Boolean(formik.errors.itemCode)}
                        helperText={formik.touched.itemCode && (formik.errors.itemCode as any)}
                        placeholder="Chọn mã hạng mục chi phí"
                      />
                    )}
                    disabled={isViewing || !formik.values.codeType}
                  />
                </Stack>
              </Grid>
            </>
          )}

          <Grid size={3}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="currency">
                Tiền tệ{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <Autocomplete
                disablePortal
                options={CURRENCY_OPTIONS}
                value={CURRENCY_OPTIONS.find((c) => c.value === formik.values.currency) || null}
                onChange={(_, option) => formik.setFieldValue('currency', option?.value || '')}
                getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    onBlur={formik.handleBlur}
                    error={formik.touched.currency && Boolean(formik.errors.currency)}
                    helperText={formik.touched.currency && (formik.errors.currency as any)}
                  />
                )}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={3}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="amount">
                Số tiền/Tỷ lệ{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="amount"
                name="amount"
                type="number"
                placeholder="0"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                disabled={isViewing}
                inputProps={{ step: '0.0001' }}
              />
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="effectiveFrom">
                Ngày hiệu lực{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <InputDatePicker
                label=""
                value={formik.values.effectiveFrom}
                onChange={(d: any) => formik.setFieldValue('effectiveFrom', d)}
                required
                error={formik.touched.effectiveFrom && Boolean(formik.errors.effectiveFrom)}
                helperText={formik.touched.effectiveFrom && (formik.errors.effectiveFrom as any)}
                fullWidth
                slotProps={{
                  textField: { 
                    size: 'medium'
                  },
                  slotProps: {}
                }}
              />
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="effectiveTo">
                Ngày hết hạn{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <InputDatePicker
                label=""
                value={formik.values.effectiveTo}
                onChange={(d: any) => formik.setFieldValue('effectiveTo', d)}
                required
                error={formik.touched.effectiveTo && Boolean(formik.errors.effectiveTo)}
                helperText={formik.touched.effectiveTo && (formik.errors.effectiveTo as any)}
                fullWidth
                slotProps={{
                  textField: { 
                    size: 'medium'
                  },
                  slotProps: {}
                }}
              />
            </Stack>
          </Grid>

          {(isEditing || isViewing) && (
            <>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Trạng thái
                </Typography>
              </Grid>
              <Grid size={6}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="status">Trạng thái</InputLabel>
                  <FormControl fullWidth>
                    <Select id="status" name="status" value={formik.values.status} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={isViewing}>
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={option.label} color={getStatusColor(option.value)} variant="filled" />
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            </>
          )}

          {!isViewing && (
            <Grid size={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/master/logistics-cost')} disabled={loading}>
                  Hủy bỏ
                </Button>
                <AnimateButton>
                  <Button type="submit" variant="contained" disabled={loading || !formik.isValid}>
                    {loading ? 'Đang lưu...' : isCreating ? 'Tạo chi phí' : 'Cập nhật chi phí'}
                  </Button>
                </AnimateButton>
              </Stack>
            </Grid>
          )}

          {isViewing && (
            <Grid size={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/master/logistics-cost')}>
                  Quay lại
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </form>
    </MainCard>
  );
}


