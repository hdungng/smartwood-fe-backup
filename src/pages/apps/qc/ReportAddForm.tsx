// import React, { useEffect, useState } from 'react';
// import {
//   Grid,
//   TextField,
//   MenuItem,
//   Button,
//   CircularProgress
// } from '@mui/material';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { useNavigate } from 'react-router-dom';
// import axiosServices from 'utils/axios';
// import { openSnackbar } from 'api/snackbar';
// import { REPORT_API, CUSTOMER_API, CONTRACT_API } from 'api/constants';
// import { SnackbarProps } from 'types/snackbar';

// interface Customer {
//   id: number;
//   name: string;
// }

// interface Contract {
//   id: number;
//   code: string;
// }

// const ReportAddForm: React.FC = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [contracts, setContracts] = useState<Contract[]>([]);

//   // Lấy danh sách customer và contract
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [customerRes, contractRes] = await Promise.all([
//           axiosServices.get(CUSTOMER_API.GET_LIST),
//           axiosServices.get(CONTRACT_API.GET_LIST)
//         ]);
//         setCustomers(customerRes.data.data || []);
//         setContracts(contractRes.data.data || []);
//       } catch (error) {
//         console.error('Error fetching customers/contracts:', error);
//       }
//     };
//     fetchData();
//   }, []);

//   const formik = useFormik({
//     initialValues: {
//       code: '',
//       customerId: '',
//       contractId: '',
//       checkDate: '',
//       statusRequestPayment: 0
//     },
//     validationSchema: Yup.object({
//       code: Yup.string().required('Bắt buộc nhập mã báo cáo'),
//       customerId: Yup.number().required('Chọn khách hàng'),
//       contractId: Yup.number().required('Chọn hợp đồng'),
//       checkDate: Yup.date().required('Chọn ngày báo cáo'),
//       statusRequestPayment: Yup.number().oneOf([0, 1, 2]).required()
//     }),
//     onSubmit: async (values, { setSubmitting }) => {
//       setLoading(true);
//       try {
//         const payload = {
//           code: values.code,
//           customerId: Number(values.customerId),
//           contractId: Number(values.contractId),
//           checkDate: new Date(values.checkDate).toISOString(), // convert đúng ISO
//           statusRequestPayment: values.statusRequestPayment,
//           status: 0, // default pending
//           lastUpdatedProgram: 'QC-Frontend',
//           statusContract: 0
//         };

//         await axiosServices.post(REPORT_API.CREATE, payload);

//         openSnackbar({
//           open: true,
//           message: 'Thêm báo cáo thành công',
//           variant: 'alert',
//           alert: { color: 'success' }
//         } as SnackbarProps);

//         navigate('/quality-control/reports');
//       } catch (error) {
//         console.error(error);
//         openSnackbar({
//           open: true,
//           message: 'Lỗi khi thêm báo cáo',
//           variant: 'alert',
//           alert: { color: 'error' }
//         } as SnackbarProps);
//       } finally {
//         setLoading(false);
//         setSubmitting(false);
//       }
//     }
//   });

//   const { values, errors, touched, handleChange, handleSubmit } = formik;

//   return (
//     <form onSubmit={handleSubmit}>
//       <Grid container spacing={2}>
//         <Grid size={12} mb={6}>
//           <TextField
//             fullWidth
//             name="code"
//             label="Mã báo cáo"
//             value={values.code}
//             onChange={handleChange}
//             error={touched.code && Boolean(errors.code)}
//             helperText={touched.code && errors.code}
//           />
//         </Grid>

//         <Grid size={12} mb={6}>
//           <TextField
//             select
//             fullWidth
//             name="customerId"
//             label="Khách hàng"
//             value={values.customerId}
//             onChange={handleChange}
//             error={touched.customerId && Boolean(errors.customerId)}
//             helperText={touched.customerId && errors.customerId}
//           >
//             {customers.map((c) => (
//               <MenuItem key={c.id} value={c.id}>
//                 {c.name}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>

//         <Grid size={12} mb={6}>
//           <TextField
//             select
//             fullWidth
//             name="contractId"
//             label="Hợp đồng"
//             value={values.contractId}
//             onChange={handleChange}
//             error={touched.contractId && Boolean(errors.contractId)}
//             helperText={touched.contractId && errors.contractId}
//           >
//             {contracts.map((c) => (
//               <MenuItem key={c.id} value={c.id}>
//                 {c.code}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>

//         <Grid size={12} mb={6}>
//           <TextField
//             type="date"
//             fullWidth
//             name="checkDate"
//             label="Ngày báo cáo"
//             InputLabelProps={{ shrink: true }}
//             value={values.checkDate}
//             onChange={handleChange}
//             error={touched.checkDate && Boolean(errors.checkDate)}
//             helperText={touched.checkDate && errors.checkDate}
//           />
//         </Grid>

//         <Grid size={12} mb={6}>
//           <TextField
//             select
//             fullWidth
//             name="statusRequestPayment"
//             label="Trạng thái thanh toán"
//             value={values.statusRequestPayment}
//             onChange={handleChange}
//             error={
//               touched.statusRequestPayment &&
//               Boolean(errors.statusRequestPayment)
//             }
//             helperText={
//               touched.statusRequestPayment && errors.statusRequestPayment
//             }
//           >
//             <MenuItem value={0}>Chưa thanh toán</MenuItem>
//             <MenuItem value={1}>Đã thanh toán</MenuItem>
//             <MenuItem value={2}>Thanh toán một phần</MenuItem>
//           </TextField>
//         </Grid>

//         <Grid size={12}>
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             disabled={loading}
//             startIcon={loading && <CircularProgress size={18} />}
//           >
//             {loading ? 'Đang lưu...' : 'Thêm báo cáo'}
//           </Button>
//         </Grid>
//       </Grid>
//     </form>
//   );
// };

// export default ReportAddForm;
