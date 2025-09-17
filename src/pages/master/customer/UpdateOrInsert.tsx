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
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';

// project imports
import { openSnackbar } from 'api/snackbar';
import MainCard from 'components/MainCard';
import useCustomer from 'api/customer';
import useBank from 'api/bank';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { CustomerFormData } from 'types/customer';
import { BankFormData } from 'types/bank';

// validation
import { customerSchema } from 'validations/customer.scheme';
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
import { APP_DEFAULT_PATH } from 'config';

interface CustomerUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

interface BankDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bankData: BankFormData) => Promise<void>;
  editingBank?: any;
  customerId?: number;
  existingBanks?: any[];
}



const BankDialog = ({ open, onClose, onSave, editingBank, customerId, existingBanks = [] }: BankDialogProps) => {
  const [selectedBankInfo, setSelectedBankInfo] = useState<any>(null);

  // Check if this is the first bank for the customer
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
  console.log(formik.values);

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
      <DialogTitle>{editingBank ? 'Chỉnh sửa thông tin ngân hàng' : 'Thêm thông tin ngân hàng'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {isFirstBank && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.main">
                ℹ️ <strong>Thông tin:</strong> Đây là ngân hàng đầu tiên của khách hàng, hệ thống sẽ tự động thiết lập làm ngân hàng mặc
                định.
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
                  freeSolo
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
                      Thông tin ngân hàng
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
                  <MenuItem value="VND">VND</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
                {formik.touched.currency && formik.errors.currency && <FormHelperText error>{formik.errors.currency}</FormHelperText>}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {editingBank ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function CustomerUpdateOrInsert({ mode = 'create' }: CustomerUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<any>(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<any>(null);
  const [modeTransitionLoading, setModeTransitionLoading] = useState(false);

  const { getById, create, update } = useCustomer();
  const { getByCustomerId, create: createBank, update: updateBank, delete: deleteBank, setDefault } = useBank();

  const isEditing = currentMode === 'edit' && (!!id || !!createdCustomer);
  const isViewing = currentMode === 'view';
  const isCreating = currentMode === 'create';

  const shouldFetchCustomer = (isEditing || isViewing) && !!id;
  const customerId = shouldFetchCustomer ? Number(id) : createdCustomer ? createdCustomer.id : 0;

  const { customer, customerLoading, customerError } = getById(customerId);
  const { banks, banksLoading, refetch: refetchBanks } = getByCustomerId(customerId);

  // Use banks directly - backend handles default logic
  const processedBanks = banks || [];

  const formik = useFormik({
    initialValues: {
      name: '',
      represented: '',
      fax: '',
      phone: '',
      address: '',
      email: '',
      taxCode: '',
      bankId: undefined,
      status: 1
    } as CustomerFormData,
    validationSchema: customerSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isCreating) {
          const newCustomer = await create(values);

          // Show transition loading
          setModeTransitionLoading(true);

          // Show success message and switch to edit mode to add banks
          openSnackbar({
            open: true,
            message: 'Tạo khách hàng thành công! Bạn có thể thêm thông tin ngân hàng ngay bây giờ.',
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Small delay for smooth transition
          setTimeout(() => {
            setCreatedCustomer(newCustomer);
            setCurrentMode('edit');
            setModeTransitionLoading(false);
          }, 500);
          return;
        } else if (isEditing && (customer || createdCustomer) && (id || createdCustomer)) {
          const updateId = id ? Number(id) : createdCustomer.id;
          await update(updateId, values);

          const message = 'Cập nhật khách hàng thành công!';
          openSnackbar({
            open: true,
            message,
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);

          // Stay on the same page after updating
          return;
        }
      } catch (error: any) {
        console.log(error);
        console.error('Error saving customer:', error);
        openSnackbar({
          open: true,
          message: error?.message || 'Có lỗi xảy ra khi lưu thông tin khách hàng',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } 
      finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    const customerData = customer || createdCustomer;
    if (customerData && (shouldFetchCustomer || createdCustomer)) {
      formik.setValues({
        name: customerData.name || '',
        represented: customerData.represented || '',
        fax: customerData.fax || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        email: customerData.email || '',
        taxCode: customerData.taxCode || '',
        bankId: customerData.bankId || undefined,
        status: customerData.status ?? 1
      });
      formik.validateForm();
    }
  }, [customer, createdCustomer, shouldFetchCustomer]);

  useEffect(() => {
    if (customerError && shouldFetchCustomer) {
      openSnackbar({
        open: true,
        message: 'Không tìm thấy khách hàng hoặc có lỗi xảy ra. Sẽ quay lại trang danh sách.',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      setTimeout(() => {
        navigate('/master/customer');
      }, 1500);
    }
  }, [customerError, shouldFetchCustomer, navigate]);

  const handleBankSave = async (bankData: BankFormData) => {
    try {
      if (editingBank) {
        await updateBank(editingBank.id, bankData);
        openSnackbar({
          open: true,
          message: 'Cập nhật thông tin ngân hàng thành công!',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
      } else {
        await createBank({ ...bankData, refId: customerId, refType: 'CUSTOMER' });
        openSnackbar({
          open: true,
          message: 'Thêm thông tin ngân hàng thành công!',
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
        message: 'Có lỗi xảy ra khi lưu thông tin ngân hàng',
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
        message: 'Không thể xóa ngân hàng mặc định. Vui lòng thiết lập ngân hàng khác làm mặc định trước khi xóa.',
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
        message: 'Xóa thông tin ngân hàng thành công!',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      refetchBanks();
    } catch (error) {
      console.error('Error deleting bank:', error);
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi xóa thông tin ngân hàng',
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
      await setDefault(bankId, customerId, 'CUSTOMER');
      openSnackbar({
        open: true,
        message: 'Thiết lập ngân hàng mặc định thành công!',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      refetchBanks();
    } catch (error) {
      console.error('Error setting default bank:', error);
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi thiết lập ngân hàng mặc định',
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
    if (isViewing) return 'Xem thông tin khách hàng';
    if (isEditing) return 'Chỉnh sửa khách hàng';
    return 'Tạo khách hàng mới';
  };


  if (customerLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={24} />
            <div>Đang tải dữ liệu khách hàng...</div>
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
          <div>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid size={12}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  {isCreating && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      💡 <strong>Lưu ý:</strong> Sau khi tạo khách hàng thành công, phần thông tin ngân hàng sẽ hiển thị ngay tại đây.
                    </Typography>
                  )}
                  {isEditing && createdCustomer && (
                    <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                      ✅ <strong>Khách hàng đã được tạo thành công!</strong> Bạn có thể thêm thông tin ngân hàng ở phía dưới.
                    </Typography>
                  )}
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="name">
                      Tên khách hàng{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      placeholder="Nhập tên khách hàng"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={6}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="represented">
                      Người đại diện{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="represented"
                      name="represented"
                      placeholder="Nhập tên người đại diện"
                      value={formik.values.represented}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.represented && Boolean(formik.errors.represented)}
                      helperText={formik.touched.represented && formik.errors.represented}
                      disabled={isViewing}
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
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
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
                      disabled={isViewing}
                    />
                  </Stack>
                </Grid>

                <Grid size={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="taxCode">
                      Mã số thuế{' '}
                      <Typography variant="caption" color="error">
                        *
                      </Typography>
                    </InputLabel>
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
                    <InputLabel htmlFor="fax">Số fax</InputLabel>
                    <TextField
                      fullWidth
                      id="fax"
                      name="fax"
                      placeholder="Nhập số fax"
                      value={formik.values.fax}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.fax && Boolean(formik.errors.fax)}
                      helperText={formik.touched.fax && formik.errors.fax}
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
                      placeholder="Nhập địa chỉ"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                      disabled={isViewing}
                      multiline
                      rows={3}
                    />
                  </Stack>
                </Grid>

                {/* Bank Accounts Section */}
                {(isEditing || isViewing) && customerId > 0 && (
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
                      {banksLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                          <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={24} />
                            <div>Đang tải thông tin ngân hàng...</div>
                          </Stack>
                        </Box>
                      ) : (
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Mã</TableCell>
                                <TableCell>Tên ngân hàng</TableCell>
                                <TableCell>Tên đầy đủ</TableCell>
                                <TableCell>Mã SWIFT</TableCell>
                                <TableCell>Chi nhánh</TableCell>
                                <TableCell>Địa chỉ</TableCell>
                                {!isViewing && <TableCell align="center">Hành động</TableCell>}
                                {isViewing && <TableCell align="center">Mặc định</TableCell>}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {processedBanks.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={7} align="center">
                                    Chưa có thông tin ngân hàng
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
                                          <Tooltip title={bank.isDefault === 1 ? 'Ngân hàng mặc định' : 'Thiết lập làm mặc định'}>
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
                                          <Tooltip title="Chỉnh sửa">
                                            <IconButton size="small" onClick={() => handleBankEdit(bank)}>
                                              <EditOutlined />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Xóa">
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
                                          <Tooltip title={bank.isDefault === 1 ? 'Ngân hàng mặc định' : 'Ngân hàng thông thường'}>
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
                      {isCreating ? 'Hủy' : 'Quay lại danh sách'}
                    </Button>
                    {!isViewing && (
                      <Button type="submit" variant="contained" disabled={loading}>
                        {isCreating ? 'Tạo khách hàng' : 'Cập nhật'}
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </div>
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
            <div style={{ color: '#333' }}>{isCreating ? 'Đang tạo khách hàng...' : 'Đang cập nhật khách hàng...'}</div>
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
        customerId={customerId}
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
          <Button onClick={() => navigate('/master/customer')} variant="contained" color="primary">
            Có
          </Button>
        </DialogActions>
      </Dialog>

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
          <Button onClick={() => navigate('/master/customer')} variant="contained" color="primary">
            Có
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteBank} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteOutlined style={{ color: '#f44336' }} />
            <Typography variant="h6">Xác nhận xóa ngân hàng</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Bạn có chắc chắn muốn xóa ngân hàng sau không?
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
            <strong>Lưu ý:</strong> Thao tác này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteBank} color="secondary">
            Hủy
          </Button>
          <Button onClick={confirmDeleteBank} variant="contained" color="error" startIcon={<DeleteOutlined />}>
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
