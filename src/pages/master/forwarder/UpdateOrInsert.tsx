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
import useForwarder from 'api/forwarder';
import useBank from 'api/bank';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { ForwarderFormData, TForwarder } from 'types/forwarder.types';
import { BankFormData } from 'types/bank';

// validation
import { forwarderSchema } from 'validations/forwarder.scheme';
import { bankSchema } from 'validations/bank.scheme';
import { Typography } from '@mui/material';

// icons
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import StarFilled from '@ant-design/icons/StarFilled';
import StarOutlined from '@ant-design/icons/StarOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
// constants
import { vietnameseBanks, messages, currencyOptions } from 'constants/banks';
import { getProvincesByRegion, Province, vietnamRegions } from 'data/vietnam-location';
interface ForwarderUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

interface BankDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bankData: BankFormData) => Promise<void>;
  editingBank?: any;
  forwarderId?: number;
  existingBanks?: any[];
}

const BankDialog = ({ open, onClose, onSave, editingBank, forwarderId, existingBanks = [] }: BankDialogProps) => {
  const [selectedBankInfo, setSelectedBankInfo] = useState<any>(null);

  // Check if this is the first bank for the forwarder
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
                <InputLabel htmlFor="email">
                  Email{' '}
                  <Typography variant="caption" color="error">
                    *
                  </Typography>
                </InputLabel>
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

export default function ForwarderUpdateOrInsert({ mode = 'create' }: ForwarderUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<any>(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [createdForwarder, setCreatedForwarder] = useState<TForwarder | null>(null);
  const [modeTransitionLoading, setModeTransitionLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { getById, create, update } = useForwarder();
  const { create: createBank, update: updateBank, delete: deleteBank, setDefault } = useBank();

  const isEditing = currentMode === 'edit' && (!!id || !!createdForwarder);
  const isViewing = currentMode === 'view';
  const isCreating = currentMode === 'create';

  const shouldFetchForwarder = (isEditing || isViewing) && !!id;
  const forwarderId = shouldFetchForwarder ? Number(id) : createdForwarder ? createdForwarder.id : 0;

  const { forwarder, forwarderLoading, forwarderError, refetch: refetchForwarder } = getById(forwarderId);

  // Use banks from forwarder response instead of separate API call
  const processedBanks = forwarder?.banks || createdForwarder?.banks || [];

  const formik = useFormik({
    initialValues: {
      code: '',
      forwarderNameVn: '',
      forwarderNameEn: '',
      address: '',
      taxCode: '',
      bankAccount: '',
      fwBankName: '',
      description: '',
      region: '',
      transportName: '',
      status: 1
    } as ForwarderFormData,
    validationSchema: forwarderSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isCreating) {
          const newForwarder = await create(values);

          // Show transition loading
          setModeTransitionLoading(true);

          // Show success message and switch to edit mode to add banks
          openSnackbar({
            open: true,
            message: 'Tạo forwarder thành công!',
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Small delay for smooth transition
          setTimeout(() => {
            setCreatedForwarder(newForwarder);
            setCurrentMode('edit');
            setModeTransitionLoading(false);
          }, 500);
          return;
        } else if (isEditing && (forwarder || createdForwarder) && (id || createdForwarder)) {
          const updateId = id ? Number(id) : createdForwarder?.id || 0;
          await update(updateId, values);

          openSnackbar({
            open: true,
            message: 'Cập nhật forwarder thành công!',
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Stay on the same page after updating
          return;
        }
      } catch (error) {
        console.error('Error saving forwarder:', error);
        openSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi lưu forwarder',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    const forwarderData = forwarder || createdForwarder;
    if (forwarderData && (shouldFetchForwarder || createdForwarder)) {
      formik.setValues({
        code: forwarderData.code || '',
        forwarderNameVn: forwarderData.forwarderNameVn || '',
        forwarderNameEn: forwarderData.forwarderNameEn || '',
        address: forwarderData.address || '',
        taxCode: forwarderData.taxCode || '',
        transportName: forwarderData.transportName || '',
        region: forwarderData.region || '',
        description: forwarderData.description || '',
        bankAccount: forwarderData.bankAccount || '',
        fwBankName: forwarderData.fwBankName || ''
      });
      formik.validateForm();
    }
  }, [forwarder, createdForwarder, shouldFetchForwarder]);

  useEffect(() => {
    if (forwarderError && shouldFetchForwarder) {
      console.error('Error fetching forwarder data:', forwarderError);
      openSnackbar({
        open: true,
        message: messages.error.loading,
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [forwarderError, shouldFetchForwarder]);

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
        await createBank({ ...bankData, refId: forwarderId, refType: 'FORWARDER' });
        openSnackbar({
          open: true,
          message: messages.success.supplier.bankCreate,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      }
      setBankDialogOpen(false);
      setEditingBank(null);
      refetchForwarder(); // Refetch forwarder data to get updated banks
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
  const handleRegionChange = (event: any, newValue: string | null) => {
    formik.setFieldValue('region', newValue || '');
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
      refetchForwarder(); // Refetch forwarder data to get updated banks
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
      await setDefault(bankId, forwarderId, 'FORWARDER');
      openSnackbar({
        open: true,
        message: messages.success.supplier.bankSetDefault,
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      refetchForwarder(); // Refetch forwarder data to get updated banks
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

  const getTitle = () => {
    if (isViewing) return 'Xem thông tin forwarder';
    if (isEditing) return 'Chỉnh sửa forwarder';
    return 'Tạo forwarder mới';
  };

  if (forwarderLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={24} />
            <div>Đang tải thông tin forwarder...</div>
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
                      💡 <strong>Lưu ý:</strong> Sau khi tạo forwarder thành công, phần thông tin ngân hàng sẽ hiển thị ngay tại đây.
                    </Typography>
                  )}
                  {isEditing && createdForwarder && (
                    <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                      ✅ <strong>Forwarder đã được tạo thành công!</strong> Bạn có thể thêm thông tin ngân hàng ở phía dưới.
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                      placeholder="Nhập mã forwarder"
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
                    <InputLabel htmlFor="transportName">
                      Tên vận tải{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="transportName"
                      name="transportName"
                      placeholder="Nhập tên vận tải"
                      value={formik.values.transportName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.transportName && Boolean(formik.errors.transportName)}
                      helperText={formik.touched.transportName && formik.errors.transportName}
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
                      getOptionLabel={(option: string) => vietnamRegions.find((r) => r.code === option)?.name || ''}
                      value={formik.values.region as string || null}
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="forwarderNameVn">
                      Tên công ty tiếng Việt{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="forwarderNameVn"
                      name="forwarderNameVn"
                      placeholder="Nhập tên tiếng Việt"
                      value={formik.values.forwarderNameVn}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.forwarderNameVn && Boolean(formik.errors.forwarderNameVn)}
                      helperText={formik.touched.forwarderNameVn && formik.errors.forwarderNameVn}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="forwarderNameEn">
                      Tên công ty tiếng Anh{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="forwarderNameEn"
                      name="forwarderNameEn"
                      placeholder="Nhập tên tiếng Anh"
                      value={formik.values.forwarderNameEn}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.forwarderNameEn && Boolean(formik.errors.forwarderNameEn)}
                      helperText={formik.touched.forwarderNameEn && formik.errors.forwarderNameEn}
                      disabled={isViewing}
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
                      placeholder="Nhập địa chỉ đầy đủ"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                      disabled={isViewing}
                      multiline
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="bankAccount">
                      Số tài khoản{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="bankAccount"
                      name="bankAccount"
                      placeholder="Nhập số tài khoản"
                      value={formik.values.bankAccount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.bankAccount && Boolean(formik.errors.bankAccount)}
                      helperText={formik.touched.bankAccount && formik.errors.bankAccount}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>
                <Grid size={6}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="fwBankName">
                      Ngân hàng{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="fwBankName"
                      name="fwBankName"
                      placeholder="Nhập ngân hàng"
                      value={formik.values.fwBankName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.fwBankName && Boolean(formik.errors.fwBankName)}
                      helperText={formik.touched.fwBankName && formik.errors.fwBankName}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="description">
                      Mô tả{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      placeholder="Mô tả"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      disabled={isViewing}
                      multiline
                      rows={2}
                    />
                  </Stack>
                </Grid>

                {/* Bank Accounts Section */}
                {(isEditing || isViewing) && forwarderId > 0 && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6">
                          Thông tin ngân hàng
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
                            Thêm ngân hàng
                          </Button>
                        )}
                      </Stack>
                    </Grid>

                    <Grid size={12}>
                      {forwarderLoading ? (
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
                                <TableCell>{messages.tableHeaders.name}</TableCell>
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
                                          <Tooltip
                                            title={bank.isDefault === 1 ? messages.tooltips.defaultBank : messages.tooltips.setDefault}
                                          >
                                            <IconButton
                                              size="small"
                                              onClick={() => handleSetDefault(bank.id!)}
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
                    <Button
                      onClick={() => navigate('/master/forwarder', { state: { refresh: true } })}
                      variant="outlined"
                      color="secondary"
                      disabled={loading}
                    >
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
            <div style={{ color: '#333' }}>{isCreating ? 'Đang tạo forwarder...' : 'Đang cập nhật forwarder...'}</div>
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
        forwarderId={forwarderId}
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
          <Button onClick={() => navigate('/master/forwarder')} variant="contained" color="primary">
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
            {messages.warning.confirmDelete}
          </Typography>
          {bankToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{messages.tableHeaders.code}:</strong> {bankToDelete.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{messages.tableHeaders.bankName}:</strong> {bankToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{messages.tableHeaders.branch}:</strong> {bankToDelete.branchName}
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

