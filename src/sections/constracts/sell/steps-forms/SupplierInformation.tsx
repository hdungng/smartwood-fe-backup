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
  Paper,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Tooltip,
  Autocomplete
} from '@mui/material';
// import SupplierInfoTable from './SupplierInfoTable';
import Typography from '@mui/material/Typography';
import { Formik, Form, FieldArray } from 'formik';
import { useIntl } from 'react-intl';
import { useGlobal } from 'contexts/GlobalContext';
import { useState, useEffect } from 'react';
import moment from 'moment';
import axiosServices from 'utils/axios';
import { BUSSINESS_PLAN_SUPLIER } from 'api/CommonAPI/BusinessPlan';
import { enqueueSnackbar } from 'notistack';
import { DeleteOutlined } from '@ant-design/icons';
import { isDifferentArrayObjects } from 'utils';
import useSupplier from 'api/supplier';
import useShippingUnit from 'api/shipping-unit';
import { formatNumber, parseFormattedNumber } from 'utils';

interface SupplierInformationProps {
  id: any;
  isView: boolean;
  dataForm: any;
  businessPlanId: number;
  onCallParent: (data?: any) => void;
  onCallBack: () => void;
}

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

type TSupplier = {
  id: number;
  supplierId: number;
  goodId: number;
  shippingCompany: string;
  coveringCompany: string;
  region: string;
  quantity: number | null;
  purchasePrice: number | null;
  totalAmount: number | null;
  expectedDeliveryDate: string;
};

type NumericKeysOfTSupplier = {
  [K in keyof TSupplier]: TSupplier[K] extends number | null ? K : never;
}[keyof TSupplier];

const calculateTotal = (arr: { listSupplier: TSupplier[] }, key: NumericKeysOfTSupplier): string => {
  const total = arr.listSupplier
    .map((item) => item[key])
    .filter((value): value is number => value !== null && value !== undefined)
    .reduce((a, b) => a + b, 0);

  if (key === 'totalAmount') {
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } else {
    return total.toLocaleString('en-US');
  }
};

// Component for truncated text with tooltip
const TruncatedCell = ({ children, maxWidth = 150 }: { children: React.ReactNode; maxWidth?: number }) => (
  <Tooltip title={children} arrow placement="top">
    <Box
      sx={{
        maxWidth: maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'help'
      }}
    >
      {children}
    </Box>
  </Tooltip>
);

// Define fixed column widths
const columnWidths = {
  supplier: 180,
  goods: 180,
  shipping: 150,
  covering: 150,
  region: 100,
  quantity: 120,
  price: 130,
  total: 140,
  date: 160,
  action: 80
};

const table_head = [
  'supplier_name',
  'goods_name',
  'shipping_company',
  'coating_company',
  'region',
  'quantity',
  'purchase_price',
  'total_amount',
  'expected_delivery_date'
  // "Hành động",
];

export default function SupplierInformation({ id, isView, dataForm, businessPlanId, onCallParent, onCallBack }: SupplierInformationProps) {
  const intl = useIntl();
  const global = useGlobal(); // lay bien global context

  const [errors, setErrors] = useState<{ [key in keyof SupplierRow]?: string }>({});
  const [initialValues, setInitialValues] = useState<{
    listSupplier: TSupplier[];
  }>({ listSupplier: [] });

  // Add hooks for fetching covering companies and shipping companies
  const supplier = useSupplier();
  const shippingUnit = useShippingUnit();
  const { suppliers: coveringCompanies } = supplier.list({
    supplierType: 'COVER',
    status: 1
  });
  const { shippingUnits } = shippingUnit.list({ status: 1 });

  useEffect(() => {
    if (dataForm && dataForm.length > 0) {
      const mappedData = dataForm.map((item: any): TSupplier => {
        return {
          id: item?.id || 0,
          supplierId: item.supplierId,
          goodId: item.goodId,
          shippingCompany: item.shippingCompany || '',
          coveringCompany: item.coveringCompany || '',
          region: item.region || '1',
          quantity: item.quantity ?? null,
          purchasePrice: item.purchasePrice ?? null,
          totalAmount: item.totalAmount ?? null,
          expectedDeliveryDate: moment(item.expectedDeliveryDate).format('YYYY-MM-DD')
        };
      });

      setInitialValues({
        listSupplier: dataForm
      });
    }
  }, [dataForm]);

  // Đợi global data có sẵn trước khi render
  if (!global.suppliers || !global.goods || global.suppliers.length === 0 || global.goods.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>
          Loading... (Suppliers: {global.suppliers?.length || 0}, Goods: {global.goods?.length || 0})
        </Typography>
      </Box>
    );
  }

  // Cập nhật giá trị mặc định nếu chưa có data
  if (initialValues.listSupplier.length === 0 && global.suppliers.length > 0) {
    const defaultSupplier = {
      id: 0,
      supplierId: global.suppliers[0].id,
      goodId: global.goods[0].id,
      shippingCompany: '',
      coveringCompany: '',
      region: '1',
      quantity: null,
      purchasePrice: null,
      totalAmount: null,
      expectedDeliveryDate: moment().format('YYYY-MM-DD')
    };

    const updatedValues = {
      ...initialValues,
      listSupplier: [defaultSupplier]
    };

    setInitialValues(updatedValues);
  } else if (!isView && initialValues.listSupplier.length > 0) {
    const firstSupplier = initialValues.listSupplier[0];
    if (firstSupplier.supplierId === 1 && global.suppliers.length > 0) {
      const updatedValues = {
        ...initialValues,
        listSupplier: [
          {
            ...firstSupplier,
            supplierId: global.suppliers[0].id,
            goodId: global.goods[0].id
          }
        ]
      };
      setInitialValues(updatedValues);
    }
  }

  // console.log("dataForm___", { dataForm, initialValues })

  const createBusinessPlanSupplier = async (list_supplier: TSupplier[]) => {
    try {
      const payload = list_supplier.map((item) => ({
        supplierId: item.supplierId,
        goodId: item.goodId,
        shippingCompany: item.shippingCompany,
        coveringCompany: item.coveringCompany,
        region: item.region,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        totalAmount: item.totalAmount,
        expectedDeliveryDate: moment(item.expectedDeliveryDate).format('YYYY-MM-DD')
      }));

      const { data, status } = await axiosServices.post('api/businessplansupplier', payload);
      if (status === 201 || status === 200) {
        onCallBack();
      }
    } catch (error) {
      console.log('CREATE_BUSINESS_PLAN_SUPPLIER_ERROR', error);
    }
  };

  const updateBusinessPlanSupplier = async (list_supplier: TSupplier[]) => {
    try {
      const payload = list_supplier.map((item) => ({
        id: item.id,
        supplierId: item.supplierId,
        goodId: item.goodId,
        shippingCompany: item.shippingCompany,
        coveringCompany: item.coveringCompany,
        region: item.region,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        totalAmount: item.totalAmount,
        expectedDeliveryDate: moment(item.expectedDeliveryDate).format('YYYY-MM-DD')
      }));

      const { data, status } = await axiosServices.put('api/businessplansupplier', payload);
      if (status === 201 || status === 200) {
        onCallBack();
      }
    } catch (error) {
      console.log('UPDATE_BUSINESS_PLAN_SUPPLIER_ERROR', error);
    }
  };

  const createSingleSuppllier = async (payload: any, func = (v: number) => {}) => {
    try {
      const { data, status } = await axiosServices.post(BUSSINESS_PLAN_SUPLIER.INSERT, {
        ...payload,
        expectedDeliveryDate: moment(payload.expectedDeliveryDate).format('YYYY-MM-DD'),
        businessPlanId: Number(businessPlanId)
      });
      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'create_tracsaction_infor_success' }), {
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
          variant: 'success'
        });
        func(Number(data.data.id));
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

  const deleteSingleSupplier = async (id: number, func = () => {}) => {
    try {
      const { status } = await axiosServices.delete(BUSSINESS_PLAN_SUPLIER.INSERT + `/${id}`);
      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_delete_success_text' }), {
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
          variant: 'success'
        });
        func();
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
    }
  };

  return (
    <>
      <Formik
        enableReinitialize // This ensures Formik reinitializes values when `initialValues` change
        initialValues={initialValues}
        onSubmit={async (values) => {
          // Lưu data khi submit
          if (values.listSupplier && values.listSupplier.length > 0) {
            onCallParent(values.listSupplier);
          }
          if (isView) {
            // console.log("FORM_SUBMIT_DATA_isView", values)
            const isUpdate = isDifferentArrayObjects(
              values.listSupplier.map((item: any) => {
                return {
                  id: item?.id,
                  supplierId: item?.supplierId,
                  goodId: item?.goodId,
                  shippingCompany: item?.shippingCompany,
                  coveringCompany: item?.coveringCompany,
                  region: item?.region,
                  quantity: item?.quantity,
                  purchasePrice: item?.purchasePrice,
                  totalAmount: item?.totalAmount,
                  expectedDeliveryDate: moment(item?.expectedDeliveryDate).format('YYYY-MM-DD')
                };
              }),
              initialValues.listSupplier
            );
            if (isUpdate) {
              updateBusinessPlanSupplier(values.listSupplier);
            } else {
              onCallParent(values.listSupplier);
            }
          } else {
            // console.log("FORM_SUBMIT_DATA_isCreate", values)
            createBusinessPlanSupplier(values.listSupplier);
          }
        }}
      >
        {({ values, ...rest }) => {
          return (
            <Form>
              <FieldArray name="listSupplier">
                {({ insert, remove, push }) => (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {intl.formatMessage({ id: 'transaction_information' })}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          if (isView) {
                            const payload = {
                              supplierId: global.suppliers?.[0]?.id || 1,
                              goodId: global.goods?.[0]?.id || 1,
                              shippingCompany: '',
                              coveringCompany: '',
                              region: '1',
                              quantity: null,
                              purchasePrice: null,
                              totalAmount: null,
                              expectedDeliveryDate: moment().format('YYYY-MM-DD')
                            };
                            createSingleSuppllier(
                              {
                                ...payload
                              },
                              (value: number) => {
                                push({ ...payload, id: value });
                                // Lưu data ngay khi thêm supplier mới

                                onCallParent(values.listSupplier);
                              }
                            );
                          } else {
                            push({
                              supplierId: global.suppliers?.[0]?.id || 1,
                              goodId: global.goods?.[0]?.id || 1,
                              shippingCompany: '',
                              coveringCompany: '',
                              region: '1',
                              quantity: null,
                              purchasePrice: null,
                              totalAmount: null,
                              expectedDeliveryDate: moment().format('YYYY-MM-DD')
                            });
                            // Lưu data ngay khi thêm supplier mới

                            onCallParent(values.listSupplier);
                          }
                        }}
                      >
                        {intl.formatMessage({ id: 'add_more' })}
                      </Button>
                    </Stack>

                    <TableContainer
                      component={Paper}
                      sx={{
                        minWidth: 1400,
                        maxHeight: 600,
                        overflow: 'auto'
                      }}
                    >
                      <Table
                        sx={{
                          tableLayout: 'fixed',
                          width: '100%'
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            {table_head.map((head, index) => {
                              const widthMap = [
                                columnWidths.supplier,
                                columnWidths.goods,
                                columnWidths.shipping,
                                columnWidths.covering,
                                columnWidths.region,
                                columnWidths.quantity,
                                columnWidths.price,
                                columnWidths.total,
                                columnWidths.date
                              ];

                              return (
                                <TableCell
                                  key={index}
                                  sx={{
                                    width: widthMap[index],
                                    minWidth: widthMap[index],
                                    maxWidth: widthMap[index],
                                    fontWeight: 'bold',
                                    backgroundColor: '#f5f5f5'
                                  }}
                                >
                                  <TruncatedCell maxWidth={widthMap[index] - 20}>
                                    {intl.formatMessage({ id: head })}
                                    {(index === 6 || index === 5) && <strong style={{ color: 'red' }}>*</strong>}
                                  </TruncatedCell>
                                </TableCell>
                              );
                            })}
                            <TableCell
                              sx={{
                                width: columnWidths.action,
                                minWidth: columnWidths.action,
                                maxWidth: columnWidths.action,
                                fontWeight: 'bold',
                                backgroundColor: '#f5f5f5'
                              }}
                            >
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {values.listSupplier.length > 0 &&
                            values.listSupplier.map((supplier: TSupplier, index: number) => {
                              const selectedSupplier = global.suppliers.find((s) => s.id === supplier.supplierId);
                              const selectedGood = global.goods.find((g) => g.id === supplier.goodId);

                              return (
                                <TableRow key={index}>
                                  {/* Supplier */}
                                  <TableCell
                                    sx={{
                                      width: columnWidths.supplier,
                                      p: 1
                                    }}
                                  >
                                    <Select
                                      name={`listSupplier.${index}.supplierId`}
                                      value={supplier.supplierId}
                                      size="medium"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const fieldName = `listSupplier.${index}.supplierId`;

                                        // Update Formik field
                                        rest.setFieldValue(fieldName, value);

                                        // Manually build updated list
                                        const updatedList = [...values.listSupplier];
                                        updatedList[index] = {
                                          ...updatedList[index],
                                          supplierId: Number(value)
                                        };

                                        // Call parent with updated data
                                        onCallParent(updatedList);
                                      }}
                                      sx={{ width: '100%' }}
                                      renderValue={(value) => (
                                        <TruncatedCell maxWidth={columnWidths.supplier - 40}>{selectedSupplier?.name || ''}</TruncatedCell>
                                      )}
                                    >
                                      {global.suppliers.map((supplierOption) => (
                                        <MenuItem key={supplierOption.id} value={supplierOption.id}>
                                          <Tooltip title={supplierOption.name} arrow>
                                            <span>{supplierOption.name}</span>
                                          </Tooltip>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </TableCell>

                                  {/* Goods */}
                                  <TableCell sx={{ width: columnWidths.goods, p: 1 }}>
                                    <Select
                                      name={`listSupplier.${index}.goodId`}
                                      value={supplier.goodId}
                                      size="medium"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const fieldName = `listSupplier.${index}.goodId`;

                                        // Update Formik state
                                        rest.setFieldValue(fieldName, value);

                                        // Create updated list with new goodId
                                        const updatedList = [...values.listSupplier];
                                        updatedList[index] = {
                                          ...updatedList[index],
                                          goodId: Number(value)
                                        };

                                        // Call parent with updated data
                                        onCallParent(updatedList);
                                      }}
                                      sx={{ width: '100%' }}
                                      renderValue={(value) => (
                                        <TruncatedCell maxWidth={columnWidths.goods - 40}>{selectedGood?.name || ''}</TruncatedCell>
                                      )}
                                    >
                                      {global.goods.map((good) => (
                                        <MenuItem key={good.id} value={good.id}>
                                          <Tooltip title={good.name} arrow>
                                            <span>{good.name}</span>
                                          </Tooltip>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </TableCell>

                                  {/* Shipping Company */}
                                  <TableCell
                                    sx={{
                                      width: columnWidths.shipping,
                                      p: 1
                                    }}
                                  >
                                    <Select
                                      name={`listSupplier.${index}.shippingCompany`}
                                      value={supplier.shippingCompany}
                                      size="medium"
                                      onChange={(e) => {
                                        rest.handleChange(e);
                                        // Lưu data ngay khi thay đổi

                                        onCallParent(values.listSupplier);
                                      }}
                                      sx={{ width: '100%' }}
                                      renderValue={(value) => (
                                        <TruncatedCell maxWidth={columnWidths.shipping - 40}>{value || ''}</TruncatedCell>
                                      )}
                                    >
                                      <MenuItem value="">
                                        <em>
                                          {intl.formatMessage({
                                            id: 'select_shipping_company'
                                          })}
                                        </em>
                                      </MenuItem>
                                      {shippingUnits.map((unit) => (
                                        <MenuItem key={unit.id} value={unit.name}>
                                          <Tooltip title={unit.name} arrow>
                                            <span>{unit.name}</span>
                                          </Tooltip>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </TableCell>

                                  {/* Covering Company */}
                                  <TableCell
                                    sx={{
                                      width: columnWidths.covering,
                                      p: 1
                                    }}
                                  >
                                    <Select
                                      name={`listSupplier.${index}.coveringCompany`}
                                      value={supplier.coveringCompany}
                                      size="medium"
                                      onChange={(e) => {
                                        rest.handleChange(e);
                                        // Lưu data ngay khi thay đổi

                                        onCallParent(values.listSupplier);
                                      }}
                                      sx={{ width: '100%' }}
                                      renderValue={(value) => (
                                        <TruncatedCell maxWidth={columnWidths.covering - 40}>{value || ''}</TruncatedCell>
                                      )}
                                    >
                                      <MenuItem value="">
                                        <em>
                                          {intl.formatMessage({
                                            id: 'select_covering_company'
                                          })}
                                        </em>
                                      </MenuItem>
                                      {coveringCompanies.map((company) => (
                                        <MenuItem key={company.id} value={company.name}>
                                          <Tooltip title={company.name} arrow>
                                            <span>{company.name}</span>
                                          </Tooltip>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </TableCell>

                                  {/* Region */}
                                  <TableCell sx={{ width: columnWidths.region, p: 1 }}>
                                    <Select
                                      name={`listSupplier.${index}.region`}
                                      value={supplier.region}
                                      size="medium"
                                      onChange={(e) => {
                                        rest.handleChange(e);
                                        // Lưu data ngay khi thay đổi

                                        onCallParent(values.listSupplier);
                                      }}
                                      sx={{ width: '100%' }}
                                    >
                                      <MenuItem value="Bắc">Bắc</MenuItem>
                                      <MenuItem value="Trung">Trung</MenuItem>
                                      <MenuItem value="Nam">Nam</MenuItem>
                                    </Select>
                                  </TableCell>

                                  {/* Quantity */}
                                  <TableCell
                                    sx={{
                                      width: columnWidths.quantity,
                                      p: 1
                                    }}
                                  >
                                    <TextField
                                      name={`listSupplier.${index}.quantity`}
                                      type="number"
                                      value={supplier.quantity}
                                      placeholder="1000"
                                      size="medium"
                                      inputProps={{ min: 0 }}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);
                                        const fieldName = `listSupplier.${index}.quantity`;

                                        // Update Formik state
                                        rest.setFieldValue(fieldName, value);

                                        // Call parent with up-to-date values
                                        const updatedList = [...values.listSupplier];
                                        updatedList[index] = {
                                          ...updatedList[index],
                                          quantity: Number(value)
                                        };
                                        onCallParent(updatedList);
                                      }}
                                      sx={{ width: '100%' }}
                                    />
                                  </TableCell>

                                  {/* Purchase Price */}
                                  <TableCell sx={{ width: columnWidths.price, p: 1 }}>
                                    <TextField
                                      name={`listSupplier.${index}.purchasePrice`}
                                      type="number"
                                      value={supplier.purchasePrice}
                                      placeholder="50000"
                                      size="medium"
                                      inputProps={{ min: 0 }}
                                      onChange={(event) => {
                                        rest.handleChange(event);
                                        // Lưu data ngay khi thay đổi

                                        onCallParent(values.listSupplier);
                                      }}
                                      onBlur={() => {
                                        const quantity = supplier.quantity || 0;
                                        const price = supplier.purchasePrice || 0;
                                        rest.setFieldValue(`listSupplier.${index}.totalAmount`, quantity * price);
                                        // Lưu data sau khi tính toán totalAmount

                                        onCallParent(values.listSupplier);
                                      }}
                                      sx={{ width: '100%' }}
                                    />
                                  </TableCell>

                                  {/* Total Amount */}
                                  <TableCell sx={{ width: columnWidths.total, p: 1 }}>
                                    <TruncatedCell maxWidth={columnWidths.total - 20}>
                                      {Number(supplier.totalAmount).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      })}
                                    </TruncatedCell>
                                  </TableCell>

                                  {/* Expected Delivery Date */}
                                  <TableCell sx={{ width: columnWidths.date, p: 1 }}>
                                    <TextField
                                      name={`listSupplier.${index}.expectedDeliveryDate`}
                                      type="date"
                                      value={moment(supplier.expectedDeliveryDate).format('YYYY-MM-DD')}
                                      size="medium"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const fieldName = `listSupplier.${index}.expectedDeliveryDate`;

                                        // Update Formik field
                                        rest.setFieldValue(fieldName, value);

                                        // Manually build updated data to pass to parent
                                        const updatedList = [...values.listSupplier];
                                        updatedList[index] = {
                                          ...updatedList[index],
                                          expectedDeliveryDate: value
                                        };

                                        // Pass updated list to parent
                                        onCallParent(updatedList);
                                      }}
                                      sx={{ width: '100%' }}
                                    />
                                  </TableCell>

                                  {/* Action */}
                                  <TableCell
                                    sx={{
                                      width: columnWidths.action,
                                      p: 1,
                                      textAlign: 'center'
                                    }}
                                  >
                                    <IconButton
                                      color="error"
                                      size="medium"
                                      onClick={() => deleteSingleSupplier(supplier.id, () => remove(index))}
                                    >
                                      <DeleteOutlined />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                            <TableCell
                              colSpan={5}
                              align="right"
                              sx={{
                                fontWeight: 'bold',
                                borderTop: '2px solid #ddd'
                              }}
                            >
                              <Typography fontWeight="bold">{intl.formatMessage({ id: 'total' })}:</Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 'bold',
                                borderTop: '2px solid #ddd',
                                width: columnWidths.quantity
                              }}
                            >
                              <TruncatedCell maxWidth={columnWidths.quantity - 20}>{calculateTotal(values, 'quantity')}</TruncatedCell>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 'bold',
                                borderTop: '2px solid #ddd',
                                width: columnWidths.price
                              }}
                            >
                              <TruncatedCell maxWidth={columnWidths.price - 20}>{calculateTotal(values, 'purchasePrice')}</TruncatedCell>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 'bold',
                                borderTop: '2px solid #ddd',
                                width: columnWidths.total
                              }}
                            >
                              <TruncatedCell maxWidth={columnWidths.total - 20}>{calculateTotal(values, 'totalAmount')}</TruncatedCell>
                            </TableCell>
                            <TableCell colSpan={2} sx={{ borderTop: '2px solid #ddd' }} />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </FieldArray>
            </Form>
          );
        }}
      </Formik>
    </>
  );
}

{
  /* <SupplierInfoTable id={id} isView={isView} dataForm={dataForm} businessPlanId={businessPlanId} onCallParent={onCallParent} onCallBack={onCallBack} /> */
}
