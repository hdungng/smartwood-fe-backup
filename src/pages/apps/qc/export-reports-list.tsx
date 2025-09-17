// import { useState } from 'react';
// import { useParams } from 'react-router-dom';

// // material-ui
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CardHeader,
//   Chip,
//   Collapse,
//   Divider,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Stack,
//   TextField,
//   Typography,
//   useTheme,
//   Paper
// } from '@mui/material';

// // third-party
// import { Formik, Form } from 'formik';
// import * as Yup from 'yup';

// // project imports
// import MainCard from 'components/MainCard';
// import { ExportControl } from 'pages/qc/ExportControl';
// import ApprovalModal from './ApprovalModal';

// // assets
// import CommentOutlined from '@ant-design/icons/CommentOutlined';
// import MoreOutlined from '@ant-design/icons/MoreOutlined';
// import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';
// import SendOutlined from '@ant-design/icons/SendOutlined';
// import CloseOutlined from '@ant-design/icons/CloseOutlined';
// import SearchOutlined from '@ant-design/icons/SearchOutlined';
// import PlusOutlined from '@ant-design/icons/PlusOutlined';
// import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// // Mock data cho export reports - updated theo ExportControl
// interface ExportReport {
//   id: number;
//   title: string;
//   contractId: string;
//   reportId: string;
//   exportDate: string;
//   status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
//   priority: 'High' | 'Medium' | 'Low';
//   createdAt: string;
//   updatedAt: string;
//   qcPersonName: string;
//   qcPersonId: string;
//   qcPersonAvatar?: string;
//   exportDetails: {
//     factory: string;
//     material: string;
//     materialStock: string;
//     pelletQuality: string;
//     pelletStock: string;
//     containerNumber: string;
//     sealNumber: string;
//     truckNumber: string;
//     destination: string;
//     customerName: string;
//     exportQuantity: string;
//     note: string;
//   };
//   images: string[];
//   comments: ExportComment[];
//   approvedBy?: string;
//   approvedAt?: string;
//   approvalReason?: string;
// }

// interface ExportComment {
//   id: number;
//   authorName: string;
//   authorAvatar?: string;
//   content: string;
//   createdAt: string;
// }

// // Mock current user - updated để có role phù hợp
// const mockCurrentUser = {
//   id: '1',
//   name: 'Nguyễn Văn A',
//   role: 'QC_MANAGER', // QC_MANAGER có thể phê duyệt
//   avatar: '/images/avatar1.png'
// };

// // Helper function kiểm tra quyền phê duyệt
// const canApproveReports = (role: string) => {
//   return role === 'QC_MANAGER' || role === 'ADMIN';
// };

// // Mock export reports data - updated theo cấu trúc mới
// const mockExportReports: ExportReport[] = [
//   {
//     id: 1,
//     title: 'Báo cáo xuất hàng - Đơn hàng #CO001',
//     contractId: 'CO001',
//     reportId: 'EX-2024-001',
//     exportDate: '2024-03-15T08:30:00',
//     status: 'Approved',
//     priority: 'High',
//     createdAt: '2024-03-15T07:00:00',
//     updatedAt: '2024-03-15T10:00:00',
//     qcPersonName: 'Trần Thị B',
//     qcPersonId: 'QC002',
//     qcPersonAvatar: '/images/avatar2.png',
//     exportDetails: {
//       factory: 'Xưởng A - Hà Nội',
//       material: 'Mùn cưa thông',
//       materialStock: '500',
//       pelletQuality: 'Xuất sắc (A+)',
//       pelletStock: '300',
//       containerNumber: 'TCLU1234567',
//       sealNumber: 'SL001234',
//       truckNumber: '29C-12345',
//       destination: 'Cảng Hải Phòng',
//       customerName: 'Công ty TNHH ABC',
//       exportQuantity: '25',
//       note: 'Xuất hàng đúng lịch, chất lượng tốt'
//     },
//     images: [],
//     comments: [
//       {
//         id: 1,
//         authorName: 'Lê Văn C',
//         authorAvatar: '/images/avatar3.png',
//         content: 'Báo cáo xuất hàng rất chi tiết và đầy đủ thông tin.',
//         createdAt: '2024-03-15T09:00:00'
//       }
//     ],
//     approvedBy: 'Nguyễn Văn A',
//     approvedAt: '2024-03-15T10:00:00',
//     approvalReason: 'Báo cáo đầy đủ thông tin và chính xác'
//   },
//   {
//     id: 2,
//     title: 'Báo cáo xuất hàng - Đơn hàng #CO002',
//     contractId: 'CO002',
//     reportId: 'EX-2024-002',
//     exportDate: '2024-03-16T10:00:00',
//     status: 'Submitted',
//     priority: 'Medium',
//     createdAt: '2024-03-16T08:00:00',
//     updatedAt: '2024-03-16T08:30:00',
//     qcPersonName: 'Phạm Minh D',
//     qcPersonId: 'QC003',
//     qcPersonAvatar: '/images/avatar4.png',
//     exportDetails: {
//       factory: 'Xưởng B - Đà Nẵng',
//       material: 'Mùn cưa cao su',
//       materialStock: '750',
//       pelletQuality: 'Tốt (A)',
//       pelletStock: '450',
//       containerNumber: 'MSKU9876543',
//       sealNumber: 'SL005678',
//       truckNumber: '30A-67890',
//       destination: 'Cảng Đà Nẵng',
//       customerName: 'Tập đoàn XYZ',
//       exportQuantity: '20',
//       note: 'Kiểm tra kỹ trước khi xuất'
//     },
//     images: [],
//     comments: []
//   },
//   {
//     id: 3,
//     title: 'Báo cáo xuất hàng - Đơn hàng #CO003',
//     contractId: 'CO003',
//     reportId: 'EX-2024-003',
//     exportDate: '2024-03-17T14:00:00',
//     status: 'Draft',
//     priority: 'Low',
//     createdAt: '2024-03-17T09:00:00',
//     updatedAt: '2024-03-17T09:15:00',
//     qcPersonName: 'Hoàng Thị E',
//     qcPersonId: 'QC004',
//     qcPersonAvatar: '/images/avatar5.png',
//     exportDetails: {
//       factory: 'Xưởng C - TP.HCM',
//       material: 'Dăm gỗ thông',
//       materialStock: '1200',
//       pelletQuality: 'Trung bình (B)',
//       pelletStock: '800',
//       containerNumber: 'COSCO123456',
//       sealNumber: 'SL009876',
//       truckNumber: '51F-54321',
//       destination: 'Cảng Sài Gòn',
//       customerName: 'Công ty Cổ phần DEF',
//       exportQuantity: '30',
//       note: 'Cần kiểm tra thêm chất lượng trước khi xuất'
//     },
//     images: [],
//     comments: []
//   },
//   {
//     id: 4,
//     title: 'Báo cáo xuất hàng - Đơn hàng #CO004',
//     contractId: 'CO004',
//     reportId: 'EX-2024-004',
//     exportDate: '2024-03-18T09:00:00',
//     status: 'Submitted',
//     priority: 'High',
//     createdAt: '2024-03-18T07:30:00',
//     updatedAt: '2024-03-18T08:00:00',
//     qcPersonName: 'Nguyễn Văn F',
//     qcPersonId: 'QC005',
//     qcPersonAvatar: '/images/avatar6.png',
//     exportDetails: {
//       factory: 'Xưởng D - Cần Thơ',
//       material: 'Mùn cưa keo',
//       materialStock: '600',
//       pelletQuality: 'Xuất sắc (A+)',
//       pelletStock: '400',
//       containerNumber: 'OOLU2468135',
//       sealNumber: 'SL112233',
//       truckNumber: '65B-11111',
//       destination: 'Cảng Cái Mép',
//       customerName: 'DN Tư nhân GHI',
//       exportQuantity: '28',
//       note: 'Đơn hàng ưu tiên cao, cần xuất gấp'
//     },
//     images: [],
//     comments: [
//       {
//         id: 2,
//         authorName: 'Trưởng phòng QC',
//         authorAvatar: '/images/avatar7.png',
//         content: 'Báo cáo cần bổ sung thêm thông tin về độ ẩm.',
//         createdAt: '2024-03-18T08:15:00'
//       }
//     ]
//   },
//   {
//     id: 5,
//     title: 'Báo cáo xuất hàng - Đơn hàng #CO005',
//     contractId: 'CO005',
//     reportId: 'EX-2024-005',
//     exportDate: '2024-03-19T15:30:00',
//     status: 'Submitted',
//     priority: 'Medium',
//     createdAt: '2024-03-19T10:00:00',
//     updatedAt: '2024-03-19T11:00:00',
//     qcPersonName: 'Lê Thị G',
//     qcPersonId: 'QC006',
//     qcPersonAvatar: '/images/avatar8.png',
//     exportDetails: {
//       factory: 'Xưởng E - Hải Phòng',
//       material: 'Gỗ phế liệu',
//       materialStock: '900',
//       pelletQuality: 'Tốt (A)',
//       pelletStock: '650',
//       containerNumber: 'CMAU3691470',
//       sealNumber: 'SL445566',
//       truckNumber: '31A-22222',
//       destination: 'Cảng Vũng Tàu',
//       customerName: 'Công ty TNHH JKL',
//       exportQuantity: '35',
//       note: 'Chất lượng ổn định, đã qua kiểm định'
//     },
//     images: [],
//     comments: []
//   },
//   {
//     id: 6,
//     title: 'Báo cáo xuất hàng - Đơn hàng #CO006',
//     contractId: 'CO006',
//     reportId: 'EX-2024-006',
//     exportDate: '2024-03-20T11:00:00',
//     status: 'Submitted',
//     priority: 'High',
//     createdAt: '2024-03-20T08:00:00',
//     updatedAt: '2024-03-20T09:30:00',
//     qcPersonName: 'Võ Minh H',
//     qcPersonId: 'QC007',
//     qcPersonAvatar: '/images/avatar9.png',
//     exportDetails: {
//       factory: 'Xưởng A - Hà Nội',
//       material: 'Dăm gỗ keo',
//       materialStock: '800',
//       pelletQuality: 'Xuất sắc (A+)',
//       pelletStock: '500',
//       containerNumber: 'HLBU7531902',
//       sealNumber: 'SL778899',
//       truckNumber: '29D-33333',
//       destination: 'Cảng Hải Phòng',
//       customerName: 'Tập đoàn MNO',
//       exportQuantity: '40',
//       note: 'Lô hàng đặc biệt cho khách hàng VIP'
//     },
//     images: [],
//     comments: [
//       {
//         id: 3,
//         authorName: 'Chuyên viên QC',
//         authorAvatar: '/images/avatar10.png',
//         content: 'Chất lượng rất tốt, đạt tiêu chuẩn xuất khẩu.',
//         createdAt: '2024-03-20T09:00:00'
//       }
//     ]
//   },
//   {
//     id: 7,
//     title: 'Báo cáo xuất hàng - Đơn hàng #CO007',
//     contractId: 'CO007',
//     reportId: 'EX-2024-007',
//     exportDate: '2024-03-21T13:45:00',
//     status: 'Rejected',
//     priority: 'Low',
//     createdAt: '2024-03-21T09:00:00',
//     updatedAt: '2024-03-21T14:00:00',
//     qcPersonName: 'Đặng Thị I',
//     qcPersonId: 'QC008',
//     qcPersonAvatar: '/images/avatar11.png',
//     exportDetails: {
//       factory: 'Xưởng B - Đà Nẵng',
//       material: 'Mùn cưa tạp',
//       materialStock: '300',
//       pelletQuality: 'Kém (C)',
//       pelletStock: '200',
//       containerNumber: 'TEMU9514673',
//       sealNumber: 'SL001122',
//       truckNumber: '43C-44444',
//       destination: 'Cảng Đà Nẵng',
//       customerName: 'Công ty Cổ phần PQR',
//       exportQuantity: '15',
//       note: 'Chất lượng không đạt yêu cầu'
//     },
//     images: [],
//     comments: [
//       {
//         id: 4,
//         authorName: 'QC Manager',
//         authorAvatar: '/images/avatar12.png',
//         content: 'Cần cải thiện quy trình sản xuất trước khi xuất hàng.',
//         createdAt: '2024-03-21T13:30:00'
//       }
//     ],
//     approvedBy: 'Nguyễn Văn A',
//     approvedAt: '2024-03-21T14:00:00',
//     approvalReason: 'Chất lượng không đạt tiêu chuẩn xuất khẩu, cần sản xuất lại'
//   }
// ];

// // Comment validation schema
// const commentSchema = Yup.object().shape({
//   content: Yup.string().required('Vui lòng nhập nội dung comment').min(1, 'Comment không được để trống')
// });

// // Comment component
// interface CommentComponentProps {
//   comment: ExportComment;
// }

// const CommentComponent = ({ comment }: CommentComponentProps) => {
//   const theme = useTheme();

//   return (
//     <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//       <Avatar src={comment.authorAvatar} sx={{ width: 32, height: 32 }}>
//         {comment.authorName.charAt(0)}
//       </Avatar>
//       <Box sx={{ flex: 1 }}>
//         <Box
//           sx={{
//             backgroundColor: theme.palette.grey[100],
//             borderRadius: 2,
//             px: 2,
//             py: 1
//           }}
//         >
//           <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//             {comment.authorName}
//           </Typography>
//           <Typography variant="body2" sx={{ mt: 0.5 }}>
//             {comment.content}
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1, mt: 0.5, ml: 1 }}>
//           <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
//             Thích
//           </Typography>
//           <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
//             Phản hồi
//           </Typography>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// // Export Report Post component
// interface ExportReportPostProps {
//   report: ExportReport;
//   onAddComment: (reportId: number, content: string) => void;
//   onApprove: (reportId: number, status: 'Approved' | 'Rejected', reason: string) => void;
// }

// const ExportReportPost = ({ report, onAddComment, onApprove }: ExportReportPostProps) => {
//   const theme = useTheme();
//   const [showComments, setShowComments] = useState(false);
//   const [showCommentInput, setShowCommentInput] = useState(false);
//   const [approvalModalOpen, setApprovalModalOpen] = useState(false);

//   const currentUser = mockCurrentUser;
//   const canApprove = canApproveReports(currentUser.role) && report.status === 'Submitted';

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Approved':
//         return 'success';
//       case 'Rejected':
//         return 'error';
//       case 'Submitted':
//         return 'info';
//       case 'Draft':
//         return 'warning';
//       default:
//         return 'default';
//     }
//   };

//   const getStatusLabel = (status: string) => {
//     switch (status) {
//       case 'Approved':
//         return 'Đã duyệt';
//       case 'Rejected':
//         return 'Từ chối';
//       case 'Submitted':
//         return 'Chờ duyệt';
//       case 'Draft':
//         return 'Nháp';
//       default:
//         return status;
//     }
//   };

//   const handleSubmitComment = (values: { content: string }, { resetForm }: any) => {
//     onAddComment(report.id, values.content);
//     resetForm();
//     setShowCommentInput(false);
//   };

//   const handleApproval = (status: 'Pass' | 'Fail', reason: string) => {
//     // Convert status to match our interface
//     const mappedStatus = status === 'Pass' ? 'Approved' : 'Rejected';
//     onApprove(report.id, mappedStatus, reason);
//   };

//   return (
//     <>
//       <Card sx={{ mb: 3 }}>
//         <CardHeader
//           avatar={
//             <Avatar src={report.qcPersonAvatar} sx={{ width: 48, height: 48 }}>
//               {report.qcPersonName.charAt(0)}
//             </Avatar>
//           }
//           action={
//             <IconButton>
//               <MoreOutlined />
//             </IconButton>
//           }
//           title={
//             <Box>
//               <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                 {report.qcPersonName}
//               </Typography>
//               <Typography variant="caption" color="text.secondary">
//                 QC ID: {report.qcPersonId} •{' '}
//               </Typography>
//             </Box>
//           }
//         />

//         <CardContent sx={{ pt: 0 }}>
//           {/* Title and status */}
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="h6" sx={{ mb: 1 }}>
//               {report.title}
//             </Typography>
//             <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
//               <Chip label={`Trạng thái: ${getStatusLabel(report.status)}`} color={getStatusColor(report.status) as any} size="small" />
//               <Chip label={`Mã báo cáo: ${report.reportId}`} variant="outlined" size="small" />
//             </Stack>
//           </Box>

//           {/* Approval info */}
//           {report.approvedBy && report.approvalReason && (
//             <Box
//               sx={{ mb: 2, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}
//             >
//               <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                 📋 Kết quả phê duyệt:
//               </Typography>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                 <strong>Người phê duyệt:</strong> {report.approvedBy}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 <strong>Lý do:</strong> {report.approvalReason}
//               </Typography>
//             </Box>
//           )}

//           {/* Export info - updated theo cấu trúc mới */}
//           <Box sx={{ mb: 2, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
//             <Grid container spacing={2}>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Xưởng:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.factory}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Khách hàng:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.customerName}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Mã đơn hàng:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.contractId}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Nguyên liệu:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.material}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Tồn nguyên liệu:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.materialStock} tấn
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Tồn viên:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.pelletStock} tấn
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Số lượng xuất:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.exportQuantity} tấn
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Chất lượng viên:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.pelletQuality}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Số công:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.containerNumber}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Số chì:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.sealNumber}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Số xe:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.truckNumber}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Điểm đến:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {report.exportDetails.destination}
//                 </Typography>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                 <Typography variant="body2" color="text.secondary">
//                   Ngày xuất:
//                 </Typography>
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {new Date(report.exportDate).toLocaleDateString('vi-VN')}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Content - Export details as text */}
//           <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
//             {report.exportDetails.note && `Ghi chú: ${report.exportDetails.note}`}
//           </Typography>

//           {/* Images (if any) */}
//           {report.images && report.images.length > 0 && (
//             <Box sx={{ mb: 2 }}>
//               <Grid container spacing={1}>
//                 {report.images.map((image, index) => (
//                   <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
//                     <Box
//                       sx={{
//                         width: '100%',
//                         height: 120,
//                         backgroundColor: theme.palette.grey[200],
//                         borderRadius: 1,
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center'
//                       }}
//                     >
//                       <Typography variant="caption" color="text.secondary">
//                         Hình ảnh {index + 1}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>
//             </Box>
//           )}

//           <Divider sx={{ my: 2 }} />

//           {/* Actions */}
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
//             <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
//               <Button
//                 startIcon={<CommentOutlined />}
//                 variant="text"
//                 color="inherit"
//                 onClick={() => {
//                   setShowComments(!showComments);
//                   if (!showComments && report.comments.length === 0) {
//                     setShowCommentInput(true);
//                   }
//                 }}
//               >
//                 Feedback ({report.comments.length})
//               </Button>
//               <Button startIcon={<ShareAltOutlined />} variant="text" color="inherit">
//                 Chia sẻ
//               </Button>
//             </Stack>

//             {/* Approval buttons for Manager */}
//             {canApprove && (
//               <Stack direction="row" spacing={1}>
//                 <Button
//                   variant="contained"
//                   color="success"
//                   size="small"
//                   startIcon={<CheckCircleOutlined />}
//                   onClick={() => setApprovalModalOpen(true)}
//                 >
//                   Phê duyệt
//                 </Button>
//               </Stack>
//             )}
//           </Box>

//           {/* Comments section */}
//           <Collapse in={showComments}>
//             <Box sx={{ mt: 2 }}>
//               <Divider sx={{ mb: 2 }} />

//               {/* Existing comments */}
//               {report.comments.map((comment) => (
//                 <CommentComponent key={comment.id} comment={comment} />
//               ))}

//               {/* Add comment button/form */}
//               {!showCommentInput ? (
//                 <Button size="small" variant="outlined" onClick={() => setShowCommentInput(true)} sx={{ mt: 1 }}>
//                   Thêm bình luận
//                 </Button>
//               ) : (
//                 <Formik initialValues={{ content: '' }} validationSchema={commentSchema} onSubmit={handleSubmitComment}>
//                   {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
//                     <Form>
//                       <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
//                         <Avatar sx={{ width: 32, height: 32 }}>{currentUser.name.charAt(0)}</Avatar>
//                         <Box sx={{ flex: 1 }}>
//                           <TextField
//                             name="content"
//                             placeholder="Viết bình luận của bạn..."
//                             value={values.content}
//                             onChange={handleChange}
//                             onBlur={handleBlur}
//                             error={touched.content && Boolean(errors.content)}
//                             helperText={touched.content && errors.content}
//                             multiline
//                             rows={2}
//                             fullWidth
//                             size="small"
//                           />
//                           <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
//                             <Button
//                               size="small"
//                               variant="outlined"
//                               onClick={() => setShowCommentInput(false)}
//                               startIcon={<CloseOutlined />}
//                             >
//                               Hủy
//                             </Button>
//                             <Button
//                               type="submit"
//                               size="small"
//                               variant="contained"
//                               disabled={isSubmitting || !values.content.trim()}
//                               startIcon={<SendOutlined />}
//                             >
//                               Gửi
//                             </Button>
//                           </Box>
//                         </Box>
//                       </Box>
//                     </Form>
//                   )}
//                 </Formik>
//               )}
//             </Box>
//           </Collapse>
//         </CardContent>
//       </Card>

//       {/* Approval Modal */}
//       <ApprovalModal
//         open={approvalModalOpen}
//         onClose={() => setApprovalModalOpen(false)}
//         onSubmit={handleApproval}
//         reportTitle={report.title}
//         currentStatus={report.status}
//       />
//     </>
//   );
// };

// // Main component
// export default function ExportReportsList() {
//   const { id } = useParams<{ id: string }>();
//   const [reports, setReports] = useState<ExportReport[]>(mockExportReports);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showExportForm, setShowExportForm] = useState(false);

//   // Filter reports based on search term only
//   const filteredReports = reports.filter(
//     (report) =>
//       report.qcPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       report.exportDetails.customerName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleAddComment = (reportId: number, content: string) => {
//     const newComment: ExportComment = {
//       id: Date.now(),
//       authorName: mockCurrentUser.name,
//       authorAvatar: mockCurrentUser.avatar,
//       content,
//       createdAt: new Date().toISOString()
//     };

//     setReports((prevReports) =>
//       prevReports.map((report) => (report.id === reportId ? { ...report, comments: [...report.comments, newComment] } : report))
//     );
//   };

//   const handleApprove = (reportId: number, status: 'Approved' | 'Rejected', reason: string) => {
//     setReports((prevReports) =>
//       prevReports.map((report) =>
//         report.id === reportId
//           ? {
//               ...report,
//               status,
//               updatedAt: new Date().toISOString(),
//               approvedBy: mockCurrentUser.name,
//               approvedAt: new Date().toISOString(),
//               approvalReason: reason
//             }
//           : report
//       )
//     );
//   };

//   const handleCreateReport = (reportData: any) => {
//     // Generate new report with ID
//     const newReport: ExportReport = {
//       id: Date.now(),
//       title: `Báo cáo xuất hàng - ${new Date().toLocaleDateString('vi-VN')}`,
//       ...reportData
//     };

//     // Add to the beginning of the list
//     setReports((prevReports) => [newReport, ...prevReports]);
//   };

//   return (
//     <>
//       <MainCard
//         title={
//           <Box>
//             <Typography variant="h4" sx={{ mb: 1 }}>
//               Báo cáo xuất hàng - Đơn hàng #{id}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Danh sách các báo cáo xuất hàng từ đội ngũ QC
//             </Typography>
//           </Box>
//         }
//         secondary={
//           <Button variant="contained" size="small" startIcon={<PlusOutlined />} onClick={() => setShowExportForm(true)}>
//             Tạo báo cáo mới
//           </Button>
//         }
//       >
//         {/* Search input */}
//         <Box sx={{ mb: 3 }}>
//           <TextField
//             fullWidth
//             placeholder="Tìm kiếm theo tên QC, tiêu đề báo cáo hoặc khách hàng..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchOutlined />
//                 </InputAdornment>
//               )
//             }}
//             sx={{ maxWidth: 600 }}
//           />
//         </Box>

//         {/* Reports list */}
//         <Box>
//           {filteredReports.length === 0 ? (
//             <Box
//               sx={{
//                 textAlign: 'center',
//                 py: 8,
//                 color: 'text.secondary'
//               }}
//             >
//               <Box sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>
//                 <SearchOutlined />
//               </Box>
//               <Typography variant="h6" sx={{ mb: 1 }}>
//                 Không tìm thấy báo cáo nào
//               </Typography>
//               <Typography variant="body2">
//                 {searchTerm ? `Không có báo cáo nào phù hợp với từ khóa "${searchTerm}"` : 'Chưa có báo cáo xuất hàng nào'}
//               </Typography>
//             </Box>
//           ) : (
//             filteredReports.map((report) => (
//               <ExportReportPost key={report.id} report={report} onAddComment={handleAddComment} onApprove={handleApprove} />
//             ))
//           )}
//         </Box>
//       </MainCard>

//       {/* Export form modal/dialog */}
//       {showExportForm && (
//         <Box
//           sx={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'rgba(0, 0, 0, 0.5)',
//             zIndex: 1300,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center'
//           }}
//         >
//           <Box
//             sx={{
//               backgroundColor: 'white',
//               borderRadius: 2,
//               maxWidth: '90vw',
//               maxHeight: '90vh',
//               overflow: 'auto',
//               p: 3
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
//               <Typography variant="h5">Tạo báo cáo xuất hàng</Typography>
//               <IconButton onClick={() => setShowExportForm(false)}>
//                 <CloseOutlined />
//               </IconButton>
//             </Stack>
//             <ExportControl />
//             <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
//               <Button variant="outlined" onClick={() => setShowExportForm(false)}>
//                 Hủy
//               </Button>
//               <Button variant="contained" onClick={() => setShowExportForm(false)}>
//                 Lưu báo cáo
//               </Button>
//             </Stack>
//           </Box>
//         </Box>
//       )}
//     </>
//   );
// }
