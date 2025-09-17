import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Stack
} from '@mui/material';
// import { DeleteOutlined } from "@ant-design/icons";

import { enqueueSnackbar } from 'notistack';
import axiosServices from 'utils/axios';
import { BUSSINESS_PLAN_SUPLIER } from 'api/CommonAPI/BusinessPlan';
import { useGlobal } from 'contexts/GlobalContext';
import { useDispatch, useSelector } from 'react-redux';
import { setSupplierInfoForm, supplierInfoSelector, updateSupplierInfoForm } from 'redux/SupplierInfo';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { isArrayOfObjectsDifferent } from 'utils';

const LIST_KEYS = [
  'supplierId',
  'goodId',
  'shippingCompany',
  'coveringCompany',
  'region',
  'quantity',
  'purchasePrice',
  'totalAmount',
  'expectedDeliveryDate'
];

// Define a proper type for supplier row
interface SupplierRow {
  code: string;
  status: 0;
  lastUpdatedProgram: string;
  businessPlanId: 1;
  supplierId: number;
  goodId: number;
  shippingCompany: string;
  coveringCompany: string;
  region: string;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  expectedDeliveryDate: string;
  quantityType: number;
  level: number;
  [key: string]: string | number; // Add index signature
}

// Create a type for string-only keys
type SupplierRowStringKeys = Extract<keyof SupplierRow, string>;

type Child2Props = {
  id: any;
  isView: boolean;
  dataForm: any;
  businessPlanId: number;
  onCallParent: () => void;
  onCallBack: () => void;
};
const SupplierInfoTable: React.FC<Child2Props> = ({ id, isView, dataForm, businessPlanId, onCallParent, onCallBack }) => {
  const intl = useIntl();
  const global = useGlobal(); // lay bien global context
  const rows = useSelector(supplierInfoSelector);
  const dispatch = useDispatch();
  const supplierFormTemp = useRef(
    dataForm?.map((item: any) => {
      return {
        supplierId: item.supplierId,
        goodId: item.goodId,
        shippingCompany: item.goodId,
        coveringCompany: item.coveringCompany,
        region: item.region,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        totalAmount: item.totalAmount,
        expectedDeliveryDate: moment(item.expectedDeliveryDate).format('YYYY-MM-DD')
      };
    })
  );
  const [errors, setErrors] = useState<{ [key in keyof SupplierRow]?: string }>({});

  // const [rows, setRows] = useState<SupplierRow[]>([
  //   supplierForm,
  // ]);

  // console.log("SupplierInfoTable___sss  ", { dataForm, rows, supplierFormTemp: supplierFormTemp.current })
  useEffect(() => {
    if (isView) {
      LIST_KEYS?.forEach((item) => {
        dataForm?.forEach((ele: any) => {
          if (item === 'expectedDeliveryDate') {
            dispatch(
              setSupplierInfoForm({
                // item,
                [item]: moment(ele[item]).format('YYYY-MM-DD')
              })
            );
          } else {
            dispatch(
              setSupplierInfoForm({
                // item,
                [item]: ele[item]
              })
            );
          }
        });
      });
    }
  }, [id]);

  const handleInputChange = (index: number, field: SupplierRowStringKeys, value: string | number) => {
    // Clear validation error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Update the supplier info through Redux action
    dispatch(updateSupplierInfoForm(field, value));
  };

  // Function to clear validation error for a specific field
  const clearFieldError = (field: SupplierRowStringKeys) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // const handleAddRow = () => {
  //   setRows([
  //     ...rows,
  //     {
  //       supplierId: 0,
  //       goodId: 0,
  //       shippingCompany: "",
  //       coveringCompany: "",
  //       region: 1,
  //       quantity: 0,
  //       purchasePrice: 0,
  //       totalAmount: 0,
  //       expectedDeliveryDate: "",
  //       code: "",
  //       status: 0,
  //       lastUpdatedProgram: "",
  //       businessPlanId: 1,
  //       quantityType: 0,
  //       level: 0,
  //     },
  //   ]);
  // };

  // const handleDeleteRow = (index: number) => {
  //   const updatedRows = rows.filter((_, i) => i !== index);
  //   setRows(updatedRows);
  // };

  const calculateTotal = (field: keyof SupplierRow) => {
    return rows
      .reduce((sum: number, row: any) => sum + (typeof row[field] === 'number' ? (row[field] as number) : 0), 0)
      .toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
  };

  const table_head = [
    'Tên nhà cung cấp',
    'Tên hàng hóa',
    'Đơn vị vận chuyển',
    'Công ty phủ',
    'Khu vực',
    'Khối lượng',
    'Giá mua',
    'Thành tiền',
    'Ngày giao hàng dự kiến'
    // "Hành động",
  ];

  const validateCustomerInfo = (data: SupplierRow) => {
    const newErrors: { [key in keyof SupplierRow]?: string } = {};
    if (!data.supplierId) newErrors.supplierId = 'Tên nhà cung cấp không được bỏ trống!';
    if (!data.goodId) newErrors.goodId = 'Tên hàng hoá không được bỏ trống!';
    if (!data.region) newErrors.region = 'Khu vực không được bỏ trống!';
    if (!data.quantity || isNaN(Number(data.quantity))) newErrors.quantity = 'Khối lượng không được bỏ trống!';
    if (!data.purchasePrice || isNaN(Number(data.purchasePrice))) newErrors.purchasePrice = 'Đơn giá không được bỏ trống!';
    if (!_.isNil(data.purchasePrice) && isNaN(Number(data.purchasePrice))) newErrors.purchasePrice = 'Đơn giá không hợp lệ!';

    // if (!_.isNil(data.quantity) && isNaN(Number(data.quantity))) newErrors.unitPrice = 'Khối lượng không hợp lệ!';

    if (!data.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Ngày giao hàng dự kiến không được bỏ trống!';
    // ...thêm trường khác nếu cần
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitSupplier = async () => {
    if (!validateCustomerInfo(rows[0]) && !_.isEmpty(errors.quantity)) {
      enqueueSnackbar(`${errors?.quantity}`, {
        autoHideDuration: 3000,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });

      return;
    }

    if (!validateCustomerInfo(rows[0]) && !_.isEmpty(errors.purchasePrice)) {
      enqueueSnackbar(`${errors?.purchasePrice}`, {
        autoHideDuration: 3000,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    try {
      const { data, status } = await axiosServices.post(BUSSINESS_PLAN_SUPLIER.INSERT, { ...rows[0], businessPlanId });
      if (status === 201 || status === 200) {
        enqueueSnackbar('Tạo thông tin nhà cung cấp thành công!', {
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
          variant: 'success'
        });
        // setTimeout(() => navigate("/business-plan/list"), 1500)
      }
      onCallParent();
    } catch (err) {
      console.log('FETCH FAIL!', err);
      enqueueSnackbar('Có lỗi khi xảy ra. Vui lòng thử lại sau!', {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
    }
  };

  const handleUpdateSupplierForm = async () => {
    try {
      const { data, status } = await axiosServices.put(BUSSINESS_PLAN_SUPLIER.INSERT + `/${dataForm[0]?.id}`, {
        ...rows[0],
        businessPlanId
      });
      if (status === 201 || status === 200) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
          variant: 'success'
        });
        // setTimeout(() => navigate("/business-plan/list"), 1500)
        onCallParent();
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
    }
  };

  return (
    <Box>
      {/* Button Section */}
      {/* <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight="bold">
          Danh sách nhà cung cấp
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAddRow}>
          Thêm dòng
        </Button>
      </Stack> */}

      {/* Table Section */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {table_head.map((head, index) => (
                <TableCell key={index}>
                  {head}
                  {(index === 6 || index === 5) && (
                    <strong style={{ color: 'red' }}>
                      <strong style={{ color: 'red' }}>*</strong>
                    </strong>
                  )}{' '}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  <Select
                    value={row.supplierId}
                    defaultValue={row?.[0]?.supplierId}
                    onChange={(e) => handleInputChange(index, 'supplierId', Number(e.target.value))}
                    fullWidth
                    error={!row.supplierId && !!errors.supplierId}
                  >
                    {global.suppliers.map((supplier) => (
                      <MenuItem value={supplier.id}>{supplier.name}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={row?.[0]?.goodId}
                    value={row.goodId}
                    onChange={(e) => handleInputChange(index, 'goodId', Number(e.target.value))}
                    fullWidth
                  >
                    {global.goods.map((good) => (
                      <MenuItem value={good.id}>{good.name}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField
                    type="text"
                    value={row.shippingCompany}
                    onChange={(e) => handleInputChange(index, 'shippingCompany', e.target.value)}
                    placeholder="Đơn vị vận chuyển"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="text"
                    value={row.coveringCompany}
                    onChange={(e) => handleInputChange(index, 'coveringCompany', e.target.value)}
                    placeholder="Công ty phủ"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <Select value={row.region} onChange={(e) => handleInputChange(index, 'region', String(e.target.value))} fullWidth>
                    <MenuItem value="Bắc">Bắc</MenuItem>
                    <MenuItem value="Trung">Trung</MenuItem>
                    <MenuItem value="Nam">Nam</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleInputChange(index, 'quantity', Number(e.target.value))}
                    placeholder="1000"
                    fullWidth
                    inputProps={{
                      min: 0
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.purchasePrice}
                    onChange={(e) => handleInputChange(index, 'purchasePrice', Number(e.target.value))}
                    placeholder="50000"
                    fullWidth
                    inputProps={{
                      min: 0
                    }}
                  />
                </TableCell>
                <TableCell>
                  {row.totalAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={row.expectedDeliveryDate}
                    onChange={(e) => handleInputChange(index, 'expectedDeliveryDate', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                {/* <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteRow(index)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </TableCell> */}
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography fontWeight="bold">Tổng:</Typography>
              </TableCell>
              <TableCell>{calculateTotal('quantity')}</TableCell>
              <TableCell>{calculateTotal('purchasePrice')}</TableCell>
              <TableCell>{calculateTotal('totalAmount')}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="contained" onClick={onCallBack} sx={{ m: 3 }}>
          Quay lại
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            // console.log('isUpdate___', supplierFormTemp.current, format)
            if (isView) {
              const format = rows?.map((item: any) => {
                return {
                  supplierId: item.supplierId,
                  goodId: item.goodId,
                  shippingCompany: item.goodId,
                  coveringCompany: item.coveringCompany,
                  region: item.region,
                  quantity: item.quantity,
                  purchasePrice: item.purchasePrice,
                  totalAmount: item.totalAmount,
                  expectedDeliveryDate: moment(item.expectedDeliveryDate).format('YYYY-MM-DD')
                };
              });
              const isUpdate = isArrayOfObjectsDifferent(supplierFormTemp.current, format);
              if (isUpdate) {
                handleUpdateSupplierForm();
              } else {
                onCallParent();
              }
              return;
            } else {
              submitSupplier();
            }
          }}
          sx={{ m: 3 }}
        >
          Gửi
        </Button>
      </Box>
    </Box>
  );
};

export default SupplierInfoTable;
