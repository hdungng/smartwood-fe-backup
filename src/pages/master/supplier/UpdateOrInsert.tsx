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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import useSupplier from 'api/supplier';
import useBank from 'api/bank';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { SupplierFormData } from 'types/supplier';
import { BankFormData } from 'types/bank';

// validation
import { supplierScheme } from 'validations/supplier.scheme';
import { bankSchema } from 'validations/bank.scheme';
import * as yup from 'yup';
import { Typography } from '@mui/material';

// icons
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import StarFilled from '@ant-design/icons/StarFilled';
import StarOutlined from '@ant-design/icons/StarOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';

// constants
import { vietnameseBanks, supplierTypes, messages, currencyOptions } from 'constants/banks';
import {
  vietnamRegions,
  vietnamProvinces,
  vietnamDistricts,
  getProvincesByRegion,
  getDistrictsByProvince,
  getRegionByCode,
  getProvinceByCode,
  getDistrictByCode
} from 'data/vietnam-location';

interface SupplierUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

interface BankDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bankData: BankFormData) => Promise<void>;
  editingBank?: any;
  supplierId?: number;
  existingBanks?: any[];
}

// A simple domain validation
const validateDomain = (value: string | undefined) => {
  if (!value) return true; // Let .required() handle empty values
  const parts = value.split('@');
  if (parts.length !== 2) {
    return true; // Let .email() handle basic format
  }
  const domain = parts[1];
  // Domain must exist, have at least one dot, and the TLD must be at least 2 characters long.
  // This prevents things like `test@localhost` or `test@domain.c`
  if (!domain || !domain.includes('.') || (domain.split('.').pop()?.length ?? 0) < 2) {
    return false;
  }
  return true;
};

// Extend the existing schema with a more robust email validation
const extendedSupplierScheme = supplierScheme.shape({
  address: yup.string().optional(),
  taxCode: yup.string().optional(),
  website: yup.string().optional(),
  contactPhone: yup.string().optional(),
  rating: yup.number().optional(),
  email: yup.string().email('Định dạng email không hợp lệ').optional(),
  contactEmail: yup.string().email('Định dạng email không hợp lệ').optional(),
  supplierType: yup.string().optional(),
});

const BankDialog = ({ open, onClose, onSave, editingBank, supplierId, existingBanks = [] }: BankDialogProps) => {
  const [selectedBankInfo, setSelectedBankInfo] = useState<any>(null);

  // Check if this is the first bank for the supplier
  const isFirstBank = !editingBank && existingBanks.length === 0;

  const formik = useFormik({
    initialValues: {
      code: editingBank?.code || '',
      name: editingBank?.name || '',
      fullName: editingBank?.fullName || '',
      swiftCode: editingBank?.swiftCode || '',
      bankCode: editingBank?.bankCode || '',
      branchName: editingBank?.branchName || '',
      branchCode: editingBank?.branchCode || '',
      address: editingBank?.address || '',
      phone: editingBank?.phone || '',
      email: editingBank?.email || '',
      website: editingBank?.website || '',
      country: editingBank?.country || 'Vietnam',
      city: editingBank?.city || '',
      currency: editingBank?.currency || 'VND',
      isDefault: editingBank?.isDefault !== undefined ? editingBank.isDefault : isFirstBank ? 1 : 0
    } as BankFormData,
    validationSchema: bankSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSave(values);
    }
  });

  const handleBankNameChange = (event: any, newValue: string | null) => {
    if (newValue) {
      formik.setFieldValue('name', newValue);
      const bankInfo = vietnameseBanks.find((bank) => bank.name === newValue);
      if (bankInfo) {
        setSelectedBankInfo(bankInfo);
        // Auto-fill fields from bank info
        formik.setFieldValue('code', bankInfo.bankCode); // Use bankCode as code
        formik.setFieldValue('fullName', bankInfo.fullName);
        formik.setFieldValue('swiftCode', bankInfo.swiftCode);
        formik.setFieldValue('bankCode', bankInfo.bankCode);
        formik.setFieldValue('website', bankInfo.website);
        formik.setFieldValue('city', ''); // Reset city as it's branch-specific
        formik.setFieldValue('country', 'Vietnam'); // Set default country
      }
    } else {
      setSelectedBankInfo(null);
      // Clear auto-filled fields when bank is deselected
      formik.setFieldValue('code', '');
      formik.setFieldValue('fullName', '');
      formik.setFieldValue('swiftCode', '');
      formik.setFieldValue('bankCode', '');
      formik.setFieldValue('website', '');
    }
  };

  useEffect(() => {
    if (editingBank?.name) {
      const bankInfo = vietnameseBanks.find((bank) => bank.name === editingBank.name);
      if (bankInfo) {
        setSelectedBankInfo(bankInfo);
      }
    } else {
      setSelectedBankInfo(null);
    }
  }, [editingBank]);

  // Update isDefault when dialog opens and it's the first bank
  useEffect(() => {
    if (open && isFirstBank && !editingBank) {
      formik.setFieldValue('isDefault', 1);
    }
  }, [open, isFirstBank, editingBank]);

  const handleClose = () => {
    formik.resetForm();
    setSelectedBankInfo(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingBank ? messages.titles.bank.edit : messages.titles.bank.create}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {isFirstBank && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.main">
                ℹ️ <strong>Lưu ý:</strong> {messages.info.firstBank}
              </Typography>
            </Box>
          )}
          <Grid container spacing={2}>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="name">
                  Tên ngân hàng{' '}
                  <Typography variant="caption" color="error">
                    *
                  </Typography>
                </InputLabel>
                <Autocomplete
                  id="name"
                  options={vietnameseBanks.map((bank) => bank.name)}
                  value={formik.values.name || null}
                  onChange={handleBankNameChange}
                  onBlur={formik.handleBlur}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="name"
                      placeholder="Chọn tên ngân hàng"
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                    />
                  )}
                />
              </Stack>
            </Grid>

            {selectedBankInfo && (
              <Grid size={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {messages.titles.bank.info}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Typography variant="body2" color="text.secondary">
                          Mã ngân hàng: <strong>{selectedBankInfo.bankCode}</strong>
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tên đầy đủ: <strong>{selectedBankInfo.fullName}</strong>
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2" color="text.secondary">
                          Mã SWIFT: <strong>{selectedBankInfo.swiftCode}</strong>
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2" color="text.secondary">
                          Website: <strong>{selectedBankInfo.website}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid size={6}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="branchName">
                  Tên chi nhánh{' '}
                  <Typography variant="caption" color="error">
                    *
                  </Typography>
                </InputLabel>
                <TextField
                  fullWidth
                  id="branchName"
                  name="branchName"
                  placeholder="Nhập tên chi nhánh"
                  value={formik.values.branchName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                  helperText={formik.touched.branchName && formik.errors.branchName}
                />
              </Stack>
            </Grid>

            <Grid size={6}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="branchCode">
                  Mã chi nhánh{' '}
                  <Typography variant="caption" color="error">
                    *
                  </Typography>
                </InputLabel>
                <TextField
                  fullWidth
                  id="branchCode"
                  name="branchCode"
                  placeholder="Nhập mã chi nhánh"
                  value={formik.values.branchCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.branchCode && Boolean(formik.errors.branchCode)}
                  helperText={formik.touched.branchCode && formik.errors.branchCode}
                />
              </Stack>
            </Grid>

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="address">
                  Địa chỉ{' '}
                  <Typography variant="caption" color="error">
                    *
                  </Typography>
                </InputLabel>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  placeholder="Nhập địa chỉ chi nhánh"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  multiline
                  rows={2}
                />
              </Stack>
            </Grid>

            <Grid size={6}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="phone">
                  Số điện thoại{' '}
                  <Typography variant="caption" color="error">
                    *
                  </Typography>
                </InputLabel>
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
                />
              </Stack>
            </Grid>

            <Grid size={6}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="email">Email</InputLabel>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Stack>
            </Grid>

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="currency">
                  Tiền tệ{' '}
                  <Typography variant="caption" color="error">
                    *
                  </Typography>
                </InputLabel>
                <Select
                  fullWidth
                  id="currency"
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.currency && Boolean(formik.errors.currency)}
                >
                  {currencyOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.currency && formik.errors.currency && <FormHelperText error>{formik.errors.currency}</FormHelperText>}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {messages.buttons.cancel}
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {editingBank ? messages.buttons.update : messages.buttons.add}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function SupplierUpdateOrInsert({ mode = 'create' }: SupplierUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<any>(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [createdSupplier, setCreatedSupplier] = useState<any>(null);
  const [modeTransitionLoading, setModeTransitionLoading] = useState(false);

  // State for cascading location dropdowns
  const [availableProvinces, setAvailableProvinces] = useState<any[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);

  const { getById, create, update } = useSupplier();
  const { list, create: createBank, update: updateBank, delete: deleteBank, setDefault } = useBank();

  const isEditing = currentMode === 'edit' && (!!id || !!createdSupplier);
  const isViewing = currentMode === 'view';
  const isCreating = currentMode === 'create';

  const shouldFetchSupplier = (isEditing || isViewing) && !!id;
  const supplierId = shouldFetchSupplier ? Number(id) : createdSupplier ? createdSupplier.id : 0;

  const { supplier, supplierLoading, supplierError } = getById(supplierId);

  // Get banks for supplier
  const bankParams =
    supplierId > 0
      ? {
        refId: supplierId,
        refType: 'SUPPLIER',
        sortBy: 'id',
        sortOrder: 'asc' as const
      }
      : undefined;

  const { banks, banksLoading, refetch: refetchBanks } = list(bankParams);

  // Use banks directly - backend handles default logic
  const processedBanks = banks || [];

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      website: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      supplierType: '',
      rating: 1,
      costSpend: 0,
      costRemain: 0,
      region: '',
      province: '',
      district: ''
    } as SupplierFormData,
    validationSchema: extendedSupplierScheme,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isCreating) {
          const newSupplier = await create(values);

          // Show transition loading
          setModeTransitionLoading(true);

          // Show success message and switch to edit mode to add banks
          openSnackbar({
            open: true,
            message: messages.success.supplier.create,
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Small delay for smooth transition
          setTimeout(() => {
            setCreatedSupplier(newSupplier);
            setCurrentMode('edit');
            setModeTransitionLoading(false);
          }, 500);
        } else if (isEditing || (supplier || createdSupplier) && (id || createdSupplier)) {
          const updateId = id ? Number(id) : createdSupplier.id;
          await update(updateId, values);
          // console.log('Trạng thái loading:', loading);
          openSnackbar({
            open: true,
            message: messages.success.supplier.update,
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Stay on the same page after updating
        }
      } catch (error) {
        console.error('Error saving supplier:', error);
        openSnackbar({
          open: true,
          message: messages.error.supplier.saving,
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });
  // useEffect(() => {
  //   console.log('Chế độ hiện tại:', currentMode);
  // }, [currentMode]);
  // useEffect(() => {
  //   console.log('Lỗi biểu mẫu:', formik.errors);
  //   console.log('Giá trị biểu mẫu:', formik.values);

  // }, [formik.errors, formik.values]);
  useEffect(() => {
    const supplierData = supplier || createdSupplier;
    if (supplierData && (shouldFetchSupplier || createdSupplier)) {
      formik.setValues({
        name: supplierData.name || '',
        phone: supplierData.phone || '',
        email: supplierData.email || '',
        address: supplierData.address || '',
        taxCode: supplierData.taxCode || '',
        website: supplierData.website || '',
        contactPerson: supplierData.contactPerson || '',
        contactPhone: supplierData.contactPhone || '',
        contactEmail: supplierData.contactEmail || '',
        supplierType: supplierData.supplierType || '',
        rating: supplierData.rating || 1,
        costSpend: supplierData.costSpend || 0,
        costRemain: supplierData.costRemain || 0,
        region: supplierData.region || '',
        province: supplierData.province || '',
        district: supplierData.district || ''
      });
      formik.validateForm();

      // Update cascading dropdowns based on loaded data
      if (supplierData.region) {
        const provinces = getProvincesByRegion(supplierData.region);
        setAvailableProvinces(provinces);
      }
      if (supplierData.province) {
        const districts = getDistrictsByProvince(supplierData.province);
        setAvailableDistricts(districts);
      }
    }
  }, [supplier, createdSupplier, shouldFetchSupplier]);

  useEffect(() => {
    if (supplierError && shouldFetchSupplier) {
      console.error('Error fetching supplier data:', supplierError);
      openSnackbar({
        open: true,
        message: messages.error.supplier.loading,
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [supplierError, shouldFetchSupplier]);

  const handleBankSave = async (bankData: BankFormData) => {
    try {
      if (editingBank) {
        await updateBank(editingBank.id, bankData);
        openSnackbar({
          open: true,
          message: messages.success.supplier.bankUpdate,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      } else {
        await createBank({ ...bankData, refId: supplierId, refType: 'SUPPLIER' });
        openSnackbar({
          open: true,
          message: messages.success.supplier.bankCreate,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      }
      setBankDialogOpen(false);
      setEditingBank(null);
      refetchBanks();
    } catch (error) {
      console.error('Error saving bank:', error);
      openSnackbar({
        open: true,
        message: messages.error.supplier.bankSaving,
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  };

  const handleBankEdit = (bank: any) => {
    setEditingBank(bank);
    setBankDialogOpen(true);
  };

  const handleBankDelete = (bank: any) => {
    // Check if this bank is default
    if (bank.isDefault === 1) {
      openSnackbar({
        open: true,
        message: messages.warning.bankDeleteDefault,
        variant: 'alert',
        alert: { color: 'warning' }
      } as SnackbarProps);
      return;
    }

    // Open confirm dialog
    setBankToDelete(bank);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBank = async () => {
    if (!bankToDelete) return;

    try {
      await deleteBank(bankToDelete.id);
      openSnackbar({
        open: true,
        message: messages.success.supplier.bankDelete,
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      refetchBanks();
    } catch (error) {
      console.error('Error deleting bank:', error);
      openSnackbar({
        open: true,
        message: messages.error.supplier.bankDeleting,
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setDeleteDialogOpen(false);
      setBankToDelete(null);
    }
  };

  const cancelDeleteBank = () => {
    setDeleteDialogOpen(false);
    setBankToDelete(null);
  };

  const handleSetDefault = async (bankId: number) => {
    try {
      // Backend automatically handles setting other banks to non-default
      await setDefault(bankId, supplierId, 'SUPPLIER');
      openSnackbar({
        open: true,
        message: messages.success.supplier.bankSetDefault,
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      refetchBanks();
    } catch (error) {
      console.error('Error setting default bank:', error);
      openSnackbar({
        open: true,
        message: messages.error.supplier.bankSetDefault,
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  };

  const handleAddBank = () => {
    setEditingBank(null);
    setBankDialogOpen(true);
  };

  // Location dropdown handlers
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

  const handleProvinceChange = (event: any, newValue: string | null) => {
    formik.setFieldValue('province', newValue || '');
    formik.setFieldValue('district', '');

    if (newValue) {
      const districts = getDistrictsByProvince(newValue);
      setAvailableDistricts(districts);
    } else {
      setAvailableDistricts([]);
    }
  };

  const handleDistrictChange = (event: any, newValue: string | null) => {
    formik.setFieldValue('district', newValue || '');
  };

  const getTitle = () => {
    if (isViewing) return messages.titles.supplier.view;
    if (isEditing) return messages.titles.supplier.edit;
    return messages.titles.supplier.create;
  };

  if (supplierLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={24} />
            <div>{messages.loading.supplier.loading}</div>
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
              <div>{messages.loading.supplier.preparingEdit}</div>
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
                    {messages.fields.basicInfo}
                  </Typography>
                  {isCreating && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      💡 <strong>Lưu ý:</strong> {messages.info.afterCreate}
                    </Typography>
                  )}
                </Grid>

                <Grid size={6}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="name">
                      Tên nhà cung cấp{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      placeholder="Nhập tên nhà cung cấp"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={3}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="phone">
                      Số điện thoại{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
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

                <Grid size={3}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="region">
                      Vùng miền{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
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
                          onBlur={formik.handleBlur}
                          disabled={isViewing}
                        />
                      )}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="province">
                      Tỉnh/Thành phố{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <Autocomplete
                      id="province"
                      options={availableProvinces.map((province) => province.code)}
                      getOptionLabel={(option) => availableProvinces.find((p) => p.code === option)?.name || ''}
                      value={formik.values.province || null}
                      onChange={handleProvinceChange}
                      onBlur={formik.handleBlur}
                      disabled={isViewing || !formik.values.region}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="province"
                          placeholder={formik.values.region ? 'Chọn tỉnh/thành phố' : 'Chọn vùng miền trước'}
                          error={formik.touched.province && Boolean(formik.errors.province)}
                          helperText={formik.touched.province && formik.errors.province}
                        />
                      )}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="district">Quận/Huyện</InputLabel>
                    <Autocomplete
                      id="district"
                      options={availableDistricts.map((district) => district.code)}
                      getOptionLabel={(option) => availableDistricts.find((d) => d.code === option)?.name || ''}
                      value={formik.values.district || null}
                      onChange={handleDistrictChange}
                      onBlur={formik.handleBlur}
                      disabled={isViewing || !formik.values.province}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="district"
                          placeholder={formik.values.province ? 'Chọn quận/huyện' : 'Chọn tỉnh/thành phố trước'}
                          error={formik.touched.district && Boolean(formik.errors.district)}
                          helperText={formik.touched.district && formik.errors.district}
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="address">Địa chỉ</InputLabel>
                    <TextField
                      fullWidth
                      id="address"
                      name="address"
                      placeholder="Nhập địa chỉ đầy đủ"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="taxCode">Mã số thuế</InputLabel>
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

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="website">Website</InputLabel>
                    <TextField
                      fullWidth
                      id="website"
                      name="website"
                      placeholder="Nhập địa chỉ website"
                      value={formik.values.website}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.website && Boolean(formik.errors.website)}
                      helperText={formik.touched.website && formik.errors.website}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="contactPerson">
                      Người liên hệ{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
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

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="contactPhone">Số điện thoại</InputLabel>
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

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="contactEmail">Email</InputLabel>
                    <TextField
                      fullWidth
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      value={formik.values.contactEmail}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                      helperText={formik.touched.contactEmail && formik.errors.contactEmail}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="rating">Điểm đánh giá (1-5)</InputLabel>
                    <FormControl fullWidth error={formik.touched.rating && Boolean(formik.errors.rating)} disabled={isViewing}>
                      <Select
                        id="rating"
                        name="rating"
                        value={formik.values.rating || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Chọn điểm đánh giá
                        </MenuItem>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <MenuItem key={rating} value={rating}>
                            {rating} Điểm
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.rating && formik.errors.rating && <FormHelperText>{formik.errors.rating}</FormHelperText>}
                    </FormControl>
                  </Stack>
                </Grid>

                {/* <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="supplierType">
                      Loại nhà cung cấp{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <FormControl fullWidth error={formik.touched.supplierType && Boolean(formik.errors.supplierType)} disabled={isViewing}>
                      <Select
                        id="supplierType"
                        name="supplierType"
                        value={formik.values.supplierType || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Chọn loại
                        </MenuItem>
                        {supplierTypes.map((type) => (
                          <MenuItem key={type.code} value={type.code}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.supplierType && formik.errors.supplierType && (
                        <FormHelperText>{formik.errors.supplierType}</FormHelperText>
                      )}
                    </FormControl>
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="costSpend">
                      Chi phí đã chi{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="costSpend"
                      name="costSpend"
                      type="number"
                      placeholder="Enter cost spend"
                      value={formik.values.costSpend || 0}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.costSpend && Boolean(formik.errors.costSpend)}
                      helperText={formik.touched.costSpend && formik.errors.costSpend}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="costRemain">
                      Chi phí còn lại{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="costRemain"
                      name="costRemain"
                      type="number"
                      placeholder="Enter cost remain"
                      value={formik.values.costRemain || 0}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.costRemain && Boolean(formik.errors.costRemain)}
                      helperText={formik.touched.costRemain && formik.errors.costRemain}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid> */}

                {/* Bank Accounts Section */}
                {(isEditing || isViewing) && supplierId > 0 && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6">
                          {messages.fields.bankInfo}
                          {processedBanks.length > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {processedBanks.length} ngân hàng - Click vào
                              <Typography component="span" color="warning.main" sx={{ mx: 0.5 }}>
                                ⭐
                              </Typography>
                              để thiết lập mặc định
                            </Typography>
                          )}
                        </Typography>
                        {!isViewing && (
                          <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAddBank} size="small">
                            {messages.buttons.addBank}
                          </Button>
                        )}
                      </Stack>
                    </Grid>

                    <Grid size={12}>
                      {banksLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                          <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={24} />
                            <div>{messages.loading.bank.loading}</div>
                          </Stack>
                        </Box>
                      ) : (
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>{messages.tableHeaders.code}</TableCell>
                                <TableCell>{messages.tableHeaders.bankName}</TableCell>
                                <TableCell>{messages.tableHeaders.fullName}</TableCell>
                                <TableCell>{messages.tableHeaders.swiftCode}</TableCell>
                                <TableCell>{messages.tableHeaders.branch}</TableCell>
                                <TableCell>{messages.tableHeaders.address}</TableCell>
                                {!isViewing && <TableCell align="center">{messages.tableHeaders.actions}</TableCell>}
                                {isViewing && <TableCell align="center">{messages.tableHeaders.default}</TableCell>}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {processedBanks.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={7} align="center">
                                    {messages.empty.bankInfo}
                                  </TableCell>
                                </TableRow>
                              ) : (
                                processedBanks.map((bank) => (
                                  <TableRow
                                    key={bank.id}
                                    hover
                                    sx={{
                                      backgroundColor: bank.isDefault === 1 ? 'rgba(255, 152, 0, 0.08)' : 'inherit'
                                    }}
                                  >
                                    <TableCell>{bank.code}</TableCell>
                                    <TableCell>{bank.name}</TableCell>
                                    <TableCell>{bank.fullName}</TableCell>
                                    <TableCell>{bank.swiftCode}</TableCell>
                                    <TableCell>{bank.branchName}</TableCell>
                                    <TableCell>{bank.address}</TableCell>
                                    {!isViewing && (
                                      <TableCell>
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                          {/* Star for default status - show for all rows */}
                                          <Tooltip
                                            title={bank.isDefault === 1 ? messages.tooltips.defaultBank : messages.tooltips.setDefault}
                                          >
                                            <IconButton
                                              size="small"
                                              onClick={() => handleSetDefault(bank.id)}
                                              disabled={bank.isDefault === 1}
                                              sx={{
                                                backgroundColor: bank.isDefault === 1 ? '#FFF8E1' : 'transparent',
                                                '&:hover': {
                                                  backgroundColor: bank.isDefault === 1 ? '#FFECB3' : 'rgba(0, 0, 0, 0.04)'
                                                },
                                                '& .anticon': {
                                                  fontSize: '20px',
                                                  color: bank.isDefault === 1 ? '#FFA726' : '#9E9E9E'
                                                }
                                              }}
                                            >
                                              {bank.isDefault === 1 ? <StarFilled /> : <StarOutlined />}
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title={messages.tooltips.edit}>
                                            <IconButton size="small" onClick={() => handleBankEdit(bank)}>
                                              <EditOutlined />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title={messages.tooltips.delete}>
                                            <IconButton size="small" onClick={() => handleBankDelete(bank)} color="error">
                                              <DeleteOutlined />
                                            </IconButton>
                                          </Tooltip>
                                        </Stack>
                                      </TableCell>
                                    )}
                                    {isViewing && (
                                      <TableCell>
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                          {/* Star for default status - show for all rows in view mode */}
                                          <Tooltip
                                            title={bank.isDefault === 1 ? messages.tooltips.defaultBank : messages.tooltips.regularBank}
                                          >
                                            <IconButton
                                              size="small"
                                              disabled
                                              sx={{
                                                backgroundColor: bank.isDefault === 1 ? '#FFF8E1' : 'transparent',
                                                '& .anticon': {
                                                  fontSize: '20px',
                                                  color: bank.isDefault === 1 ? '#FFA726' : '#9E9E9E'
                                                }
                                              }}
                                            >
                                              {bank.isDefault === 1 ? <StarFilled /> : <StarOutlined />}
                                            </IconButton>
                                          </Tooltip>
                                        </Stack>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Grid>
                  </>
                )}

                {/* Action Buttons */}
                <Grid size={12}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={() => setCancelDialogOpen(true)} variant="outlined" color="secondary" disabled={loading}>
                      {isCreating ? messages.buttons.cancel : messages.buttons.backToList}
                    </Button>
                    {!isViewing && (
                      <Button type="submit" variant="contained" disabled={loading}>
                        {isCreating ? messages.buttons.supplier.create : messages.buttons.supplier.update}
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
            <div style={{ color: '#333' }}>{isCreating ? messages.loading.supplier.creating : messages.loading.supplier.updating}</div>
          </Stack>
        </Backdrop>
      </Box>

      {/* Bank Dialog */}
      <BankDialog
        open={bankDialogOpen}
        onClose={() => {
          setBankDialogOpen(false);
          setEditingBank(null);
        }}
        onSave={handleBankSave}
        editingBank={editingBank}
        supplierId={supplierId}
        existingBanks={processedBanks}
      />
      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <QuestionCircleOutlined style={{ color: '#faad14' }} />
            <Typography variant="h6">Xác nhận hủy</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">Bạn có chắc chắn muốn hủy không? Mọi thay đổi chưa lưu sẽ bị mất.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="secondary">
            Không
          </Button>
          <Button onClick={() => navigate('/master/supplier')} variant="contained" color="primary">
            Có
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteBank} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteOutlined style={{ color: '#f44336' }} />
            <Typography variant="h6">{messages.titles.bank.delete}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Bạn có chắc chắn muốn xóa ngân hàng này không?
          </Typography>
          {bankToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Mã:</strong> {bankToDelete.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Tên:</strong> {bankToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Chi nhánh:</strong> {bankToDelete.branchName}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            <strong>Lưu ý:</strong> {messages.warning.actionUndoable}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteBank} color="secondary">
            {messages.buttons.cancel}
          </Button>
          <Button onClick={confirmDeleteBank} variant="contained" color="error" startIcon={<DeleteOutlined />}>
            {messages.buttons.confirmDelete}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
