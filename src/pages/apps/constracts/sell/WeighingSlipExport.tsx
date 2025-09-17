import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { CONTRACT_WEIGHT } from 'api/CommonAPI/Contract';
// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// third-party
import {
  CheckOutlined as Check,
  DeleteOutlined as Delete
} from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { useRole } from 'contexts/RoleContext';
import { Field } from 'forms';
import { enqueueSnackbar } from 'notistack';
import { FormProvider as RHFFormProvider, useForm, useWatch } from 'react-hook-form';
import { dateHelper } from 'utils';
import axiosServices from 'utils/axios';
import { CSVExport } from 'components/third-party/react-table';
import { PermissionGuard } from 'components/guards';

// types
interface PackingListItem {
  id?: number;
  no?: number;
  contNo: string;
  sealNo: string | null;
  truckNo?: string | null;
  weightNet: number; // N.WEIGHT (KG)
  weightGross: number; // G.WEIGHT (KG)
  weighingDate: string; // date string YYYY-MM-DD or ISO
  isEditing?: boolean;
  saleContractId?: number;
}

export default function WeighingSlipExport() {
  const navigate = useNavigate();
  const { id: saleContractId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const intl = useIntl();
  const [weighSlipItem, setWeightSlipItem] = useState<PackingListItem>({
    contNo: '',
    sealNo: '',
    weightNet: 0,
    weightGross: 0,
    weighingDate: ''
  });

  const [weighSlipList, setWeightSlipList] = useState<PackingListItem[]>([]);

  const [packingList, setPackingList] = useState<PackingListItem[]>([]);

  const [errors, setErrors] = useState<{ [key in keyof PackingListItem]?: string }>({});
  const methods = useForm<{ weights: Record<string, { weightNet: number; weightGross: number }> }>({
    defaultValues: { weights: {} }
  });

  const getListWeightContract = async (id: number | string) => {
    try {
      setLoading(true);
      const shippingScheduleId = searchParams.get('bookingId');
      if (!shippingScheduleId) {
        setWeightSlipList([]);
        return;
      }
      const { data, status } = await axiosServices.get(CONTRACT_WEIGHT.COMMON + `?shippingScheduleId=${shippingScheduleId}`);
      if (status === 201 || status === 200) {
        setWeightSlipList(data.data);
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
      setLoading(false);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (saleContractId) {
      getListWeightContract(saleContractId);
    }
  }, [saleContractId, searchParams]);

  // Update packingList when weighSlipList changes
  useEffect(() => {
    // Add numbering to the items from API
    const numberedItems = weighSlipList.map((item, index) => ({
      ...item,
      no: index + 1
    }));

    setPackingList(numberedItems);
  }, [weighSlipList]);

  // Sync RHF weights with packingList
  useEffect(() => {
    const weights: Record<string, { weightNet: number; weightGross: number }> = {};
    packingList.forEach((item) => {
      if (!item.id) return;
      weights[item.id] = {
        weightNet: item.weightNet ?? 0,
        weightGross: item.weightGross ?? 0
      };
    });
    methods.reset({ weights });
  }, [packingList]);

  // Watch weights for calculating totals
  const weights = useWatch({ control: methods.control, name: 'weights' }) as Record<string, { weightNet: number; weightGross: number }>;

  // Calculate totals using RHF weights when available
  const { totalweightNet, totalweightGross } = useMemo(() => {
    const sum = { net: 0, gross: 0 };
    packingList.forEach((item) => {
      const w = item.id ? weights?.[item.id] : undefined;
      const weightNet = w?.weightNet ?? item.weightNet ?? 0;
      const weightGross = w?.weightGross ?? item.weightGross ?? 0;
      if (item.contNo || item.sealNo || weightNet > 0 || weightGross > 0) {
        sum.net += Number(weightNet) || 0;
        sum.gross += Number(weightGross) || 0;
      }
    });
    return { totalweightNet: sum.net, totalweightGross: sum.gross };
  }, [packingList, weights]);

  const validateCustomerInfo = (data: PackingListItem) => {
    const newErrors: { [key in keyof PackingListItem]?: string } = {};
    if (!data.weightGross) newErrors.weightGross = 'Trọng lượng ghi nhận không được bỏ trống!';
    if (!data.weightNet) newErrors.weightNet = 'Trọng lượng phiếu cân không được bỏ trống!';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (id: number) => {
    const editingItem = packingList.find((item) => item.id === id);
    if (!editingItem) {
      enqueueSnackbar('Không tìm thấy dòng cần lưu', {
        autoHideDuration: 3000,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    const formWeight = (weights?.[id] || {}) as Partial<{ weightNet: number; weightGross: number }>;
    const merged: PackingListItem = {
      ...editingItem,
      weightNet: formWeight.weightNet ?? editingItem.weightNet,
      weightGross: formWeight.weightGross ?? editingItem.weightGross
    };

    if (!validateCustomerInfo(merged)) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_require_fill' }), {
        autoHideDuration: 3000,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    try {
      setLoading(true);

      // Always PUT to update existing record
      const { status } = await axiosServices.put(CONTRACT_WEIGHT.COMMON + `/${id}`, {
        ...editingItem,
        weightNet: merged.weightNet,
        weightGross: merged.weightGross,
        saleContractId: saleContractId
      });
      if (status === 200) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      }

      // Refresh data
      if (saleContractId) {
        await getListWeightContract(saleContractId);
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
      setLoading(false);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const { status } = await axiosServices.delete(CONTRACT_WEIGHT.DELETE(id));
      if (status === 200 || status === 204) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });

        if (saleContractId) {
          await getListWeightContract(saleContractId);
        }
      }
    } catch (err) {
      console.log('DELETE FAIL!', err);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id: number, field: keyof PackingListItem, value: string | number) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }

    setPackingList((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setWeightSlipItem({ ...weighSlipItem, [field]: value });
  };

  const renderEditableCell = (item: PackingListItem, field: keyof PackingListItem, type: 'text' | 'number' | 'date') => {
    const value = item[field];

    // Disabled inputs for Container/Seal/Truck
    if (field === 'contNo' || field === 'sealNo' || field === 'truckNo') {
      return (
        <TextField
          size="small"
          value={(value as string) || ''}
          variant="standard"
          // disabled
          InputProps={{ style: { textAlign: 'center' } , readOnly: true}}
          sx={{
            '& .MuiInput-root, & .MuiInputBase-root': {
              fontSize: '0.875rem',
              textAlign: 'center',
              '&:before': { display: 'none' },
              '&:after': { display: 'none' }
            }
          }}
        />
      );
    }

    // Editable number inputs for weights
    if (field === 'weightNet' || field === 'weightGross') {
      return (
        <Field.Number
          name={`weights.${item.id}.${field}`}
          fullWidth
          slotProps={{
            number: {
              thousandSeparator: true,
              decimalScale: 3,
              allowNegative: false,
              allowedDecimalSeparators: ['.', ',']
            },
            input: {
              sx: {
                '& .MuiInput-root, & .MuiInputBase-root': {
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  '&:before': { display: 'none' },
                  '&:after': { display: 'none' }
                },
              },
              endAdornment: <InputAdornment position="end">KG</InputAdornment>
            }
          }}
        />
      );
    }

    // Disabled date input for weighing date (read-only)
    if (field === 'weighingDate') {
      return (
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
        >
          {value ? dateHelper.formatDate(value as string, 'DD/MM/YYYY') : ''}
        </Typography>
      );
    }

    // Fallback read-only
    return (
      <Box sx={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{String(value ?? '')}</Box>
    );
  };

  const formatNumber = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n || 0);

  const csvData = useMemo(() => {
    const rows = packingList.map((item) => {
      const w = item.id ? weights?.[item.id] : undefined;
      const weightNet = w?.weightNet ?? item.weightNet ?? 0;
      const weightGross = w?.weightGross ?? item.weightGross ?? 0;
      return {
        no: item.no ?? '',
        contNo: item.contNo ?? '',
        sealNo: item.sealNo ?? '',
        truckNo: item.truckNo ?? '',
        weightNet: Number(weightNet).toFixed(3),
        weightGross: Number(weightGross).toFixed(3),
        weighingDate: item.weighingDate ? dateHelper.formatDate(item.weighingDate, 'DD/MM/YYYY') : ''
      };
    });
    rows.push({
      no: 'Tổng',
      contNo: '',
      sealNo: '',
      truckNo: '',
      weightNet: Number(totalweightNet).toFixed(3),
      weightGross: Number(totalweightGross).toFixed(3),
      weighingDate: ''
    } as any);
    return rows;
  }, [packingList, weights, totalweightNet, totalweightGross]);

  const csvHeaders = useMemo(
    () => [
      { label: 'No.', key: 'no' },
      { label: 'Số Container', key: 'contNo' },
      { label: 'Số niêm phong', key: 'sealNo' },
      { label: 'Số xe', key: 'truckNo' },
      { label: 'Trọng lượng phiếu cân', key: 'weightNet' },
      { label: 'Trọng lượng ghi nhận', key: 'weightGross' },
      { label: 'Ngày cân hàng', key: 'weighingDate' }
    ],
    []
  );

  return (
    <MainCard>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            PHIẾU CÂN XUẤT HÀNG
          </Typography>
          <Stack direction="row" spacing={2}>
            <CSVExport data={csvData} headers={csvHeaders as any} filename={'phieu-can-xuat-hang.csv'} />
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Stack>
        </Box>

        {/* Detail Packing List Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <RHFFormProvider {...methods}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="detail packing list table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      No.
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Số Container
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Số niêm phong
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Số xe
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Trọng lượng phiếu cân
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Trọng lượng ghi nhận
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Ngày cân hàng
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {packingList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                        {item.no}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #ddd', p: 1 }}>
                        {renderEditableCell(item, 'contNo', 'text')}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #ddd', p: 1 }}>
                        {renderEditableCell(item, 'sealNo', 'text')}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #ddd', p: 1 }}>
                        {renderEditableCell(item, 'truckNo', 'text')}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #ddd', p: 1 }}>
                        {renderEditableCell(item, 'weightNet', 'number')}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #ddd', p: 1 }}>
                        {renderEditableCell(item, 'weightGross', 'number')}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #ddd', p: 1 }}>
                        {renderEditableCell(item, 'weighingDate', 'date')}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Lưu">
                            <IconButton size="small" color="success" onClick={() => handleSave(item.id!)}>
                              <Check />
                            </IconButton>
                          </Tooltip>
                          {/* Optional delete for roles other than Logistic/Domestic/Sales */}
                          <PermissionGuard permission='SALE_CONTRACT_DELETE'>
                            <Tooltip title="Xóa">
                              <IconButton size="small" color="error" onClick={() => handleDelete(item.id!)}>
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Total Row */}
                  <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      Tổng
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}></TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}></TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}></TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      {formatNumber(totalweightNet)} KG
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                      {formatNumber(totalweightGross)} KG
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}></TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}></TableCell>
                  </TableRow>
                </TableBody>
                </Table>
              </TableContainer>
            </RHFFormProvider>
          </CardContent>
        </Card>

        {/* Footer Information */}
        {/* <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            BULK IN : 25 X 20 GP CONTAINERS
          </Typography>
          <Typography variant="body1">Cellmark Asia Pte Ltd</Typography>
        </Box> */}
      </Stack>
    </MainCard>
  );
}
