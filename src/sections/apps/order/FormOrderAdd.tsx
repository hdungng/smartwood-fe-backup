import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';

// project imports
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import AlertOrderDelete from './AlertOrderDelete';

import { insertOrder, updateOrder } from 'api/order';
import { openSnackbar } from 'api/snackbar';

// assets
import DeleteFilled from '@ant-design/icons/DeleteFilled';

// types
import { Grid } from '@mui/material';
import { Status } from 'config';
import { OrderList } from 'types/order';
import { SnackbarProps } from 'types/snackbar';

interface StatusProps {
  value: number;
  label: string;
}

const allStatus: StatusProps[] = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];

// ==============================|| ORDER ADD / EDIT - FORM ||============================== //

export default function FormOrderAdd({ order, closeModal }: { order: OrderList | null; closeModal: () => void }) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const OrderSchema = Yup.object().shape({
    customerName: Yup.string().max(255).required('Customer Name is required'),
    productName: Yup.string().max(255).required('Product Name is required'),
    deliveryLocation: Yup.string().max(255).required('Delivery Location is required'),
    importCountry: Yup.string().max(255).required('Import Country is required'),
    deliveryMethod: Yup.string().max(255).required('Delivery Method is required'),
    paymentMethod: Yup.string().max(255).required('Payment Method is required'),
    currency: Yup.string().max(10).required('Currency is required'),
    unitPrice: Yup.number().required('Unit Price is required').min(0, 'Unit Price must be greater than or equal to 0'),
    weight: Yup.number().required('Weight is required').min(0, 'Weight must be greater than or equal to 0'),
    status: Yup.number().required('Status is required')
  });

  const [openAlert, setOpenAlert] = useState(false);

  const formik = useFormik({
    initialValues: {
      customerName: order?.customerName || '',
      productName: order?.productName || '',
      deliveryLocation: order?.deliveryLocation || '',
      importCountry: order?.importCountry || '',
      deliveryMethod: order?.deliveryMethod || '',
      paymentMethod: order?.paymentMethod || '',
      currency: order?.currency || '',
      unitPrice: order?.unitPrice || 0,
      weight: order?.weight || 0,
      status: order?.status || 2
    },
    validationSchema: OrderSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Create complete OrderList object with all required properties
        const completeOrder: OrderList = {
          ...values,
          status: values.status as Status,
          suppliers: order?.suppliers || [
            {
              supplierName: '',
              transportCompanyName: '',
              coatingCompanyName: '',
              area: 0,
              mass: 0,
              purchasePrice: 0,
              totalPrice: 0,
              expectedDelivery: ''
            }
          ],
          seaFreight: order?.seaFreight || 0,
          factoryToPort: order?.factoryToPort || 0,
          portStorage: order?.portStorage || 0,
          trucking: order?.trucking || 0,
          localCharge: order?.localCharge || 0,
          totalRevenue: order?.totalRevenue || 0,
          breakEvenPoint: order?.breakEvenPoint || 0,
          actualProfit: order?.actualProfit || 0,
          profitMargin: order?.profitMargin || 0
        };

        if (order) {
          await updateOrder(order.id!, completeOrder).then(() => {
            openSnackbar({
              open: true,
              message: 'Order updated successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        } else {
          await insertOrder(completeOrder).then(() => {
            openSnackbar({
              open: true,
              message: 'Order added successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{order ? 'Edit Order' : 'New Order'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-customerName">Customer Name</InputLabel>
                      <TextField
                        fullWidth
                        id="order-customerName"
                        placeholder="Enter Customer Name"
                        {...getFieldProps('customerName')}
                        error={Boolean(touched.customerName && errors.customerName)}
                        helperText={touched.customerName && errors.customerName}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-productName">Product Name</InputLabel>
                      <TextField
                        fullWidth
                        id="order-productName"
                        placeholder="Enter Product Name"
                        {...getFieldProps('productName')}
                        error={Boolean(touched.productName && errors.productName)}
                        helperText={touched.productName && errors.productName}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-deliveryLocation">Delivery Location</InputLabel>
                      <TextField
                        fullWidth
                        id="order-deliveryLocation"
                        placeholder="Enter Delivery Location"
                        {...getFieldProps('deliveryLocation')}
                        error={Boolean(touched.deliveryLocation && errors.deliveryLocation)}
                        helperText={touched.deliveryLocation && errors.deliveryLocation}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-importCountry">Import Country</InputLabel>
                      <TextField
                        fullWidth
                        id="order-importCountry"
                        placeholder="Enter Import Country"
                        {...getFieldProps('importCountry')}
                        error={Boolean(touched.importCountry && errors.importCountry)}
                        helperText={touched.importCountry && errors.importCountry}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-deliveryMethod">Delivery Method</InputLabel>
                      <TextField
                        fullWidth
                        id="order-deliveryMethod"
                        placeholder="Enter Delivery Method"
                        {...getFieldProps('deliveryMethod')}
                        error={Boolean(touched.deliveryMethod && errors.deliveryMethod)}
                        helperText={touched.deliveryMethod && errors.deliveryMethod}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-paymentMethod">Payment Method</InputLabel>
                      <TextField
                        fullWidth
                        id="order-paymentMethod"
                        placeholder="Enter Payment Method"
                        {...getFieldProps('paymentMethod')}
                        error={Boolean(touched.paymentMethod && errors.paymentMethod)}
                        helperText={touched.paymentMethod && errors.paymentMethod}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-currency">Currency</InputLabel>
                      <TextField
                        fullWidth
                        id="order-currency"
                        placeholder="Enter Currency"
                        {...getFieldProps('currency')}
                        error={Boolean(touched.currency && errors.currency)}
                        helperText={touched.currency && errors.currency}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-unitPrice">Unit Price</InputLabel>
                      <TextField
                        type="number"
                        fullWidth
                        id="order-unitPrice"
                        placeholder="Enter Unit Price"
                        {...getFieldProps('unitPrice')}
                        error={Boolean(touched.unitPrice && errors.unitPrice)}
                        helperText={touched.unitPrice && errors.unitPrice}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-weight">Weight</InputLabel>
                      <TextField
                        type="number"
                        fullWidth
                        id="order-weight"
                        placeholder="Enter Weight"
                        {...getFieldProps('weight')}
                        error={Boolean(touched.weight && errors.weight)}
                        helperText={touched.weight && errors.weight}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="order-status">Status</InputLabel>
                      <FormControl fullWidth>
                        <Select
                          id="order-status"
                          displayEmpty
                          {...getFieldProps('status')}
                          // onChange={(event: SelectChangeEvent) => setFieldValue('status', Number(event.target.value))}
                          onChange={(event: SelectChangeEvent) => setFieldValue('status', event.target.value)}
                          input={<OutlinedInput id="select-status" />}
                          renderValue={(selected) => {
                            if (!selected) {
                              return <Typography variant="subtitle1">Select Status</Typography>;
                            }


                            // const selectedStatus = allStatus.find((item) => item.value === (Number)(selected));
                            

                            const selectedStatus = allStatus.find((item) => item.value.toString() === selected);
                            return <Typography variant="subtitle2">{selectedStatus ? selectedStatus.label : 'Pending'}</Typography>;
                          }}
                        >
                          {allStatus.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {touched.status && errors.status && (
                        <Typography color="error" variant="caption">
                          {errors.status}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ gap: 2, justifyContent: 'space-between', width: '100%' }}>
              {order && (
                <Button color="error" startIcon={<DeleteFilled />} onClick={() => setOpenAlert(true)}>
                  Delete
                </Button>
              )}
              <Stack direction="row" sx={{ gap: 2 }}>
                <Button color="error" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {order ? 'Edit' : 'Add'}
                </Button>
              </Stack>
            </Stack>
          </DialogActions>
        </Form>
      </FormikProvider>
      {order && <AlertOrderDelete id={order.id!} title={order.customerName} open={openAlert} handleClose={closeModal} />}
    </>
  );
}
