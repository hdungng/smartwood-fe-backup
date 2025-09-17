import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
  Avatar
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useParams, useSearchParams } from 'react-router-dom';
import MainCard from 'components/MainCard';
import CreateReportModal from './CreateReportModal';
import ApprovalModal from '../qc/ApprovalModal';
import EditReportForm from './EditReportForm';
import IconButtonExt from 'components/@extended/IconButton';
import CommentComponent from '../../apps/qc/CommentComponent';
import axiosServices from 'utils/axios';
import { EVALUATE_API, USER_API, FEEDBACKREPORT_API, GOOD_API, SUPPLIER_API, IMAGE_API, ACCOUNT_API } from 'api/constants';
import FeedbackReportService from 'services/feedbackReport/service';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import CommentOutlined from '@ant-design/icons/CommentOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import dayjs from 'dayjs';

interface Report {
  id: number;
  reportId: string;
  qcPersonName: string;
  qcPersonId: string;
  title: string;
  content: string;
  productName: string;
  batchNumber: string;
  testDate: string;
  createdAt: string;
  status: 'Đã phê duyệt' | 'Từ chối' | 'Chờ xử lý';
  comments: { id: number; authorName: string; content: string; createdAt?: string; replyToAuthorName?: string; replyToCommentId?: number }[];
  approvedBy?: string;
  approvedAt?: string;
  approvalReason?: string;
  imageUrl: string[];
  qualityRate?: string;
  material?: string;
  goodId?: number;
  supplierId?: number;
  supplierName?: string;
  tonVien?: number;
  description?: string;
  pelletImageUrls?: string[];
  materialImageUrls?: string[];
}

interface ImageData {
  imagePath: string;
  status: number;
  id?: number;
}

const commentSchema = Yup.object().shape({
  content: Yup.string().required('Vui lòng nhập nội dung comment').min(1, 'Comment không được để trống')
});

const baseurl = import.meta.env.VITE_APP_API_URL || 'https://localhost:44364/';

function formatDateDDMMYYYY(dateStr?: string | null) {
  if (!dateStr) return 'Chưa có';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Chưa có';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function mapStatusToText(status?: number | null): 'Đã phê duyệt' | 'Từ chối' | 'Chờ xử lý' {
  switch (status) {
    case 0:
      return 'Từ chối';
    case 1:
      return 'Chờ xử lý';
    case 2:
      return 'Đã phê duyệt';
    default:
      return 'Chờ xử lý';
  }
}

type ImagesCache = Record<number, { pellet: ImageData[]; material: ImageData[] }>;

const QualityReportPost = ({
  report,
  currentUser,
  onAddComment,
  onApproveLocal,
  onEditLocal,
  id,
  images,
  onLoadImages
}: {
  report: Report;
  currentUser: { id: string; name: string; role: string };
  onAddComment: (reportId: number, content: string, replyToCommentId?: number, replyToAuthorName?: string) => Promise<void>;
  onApproveLocal: (reportId: number, statusText: 'Đã phê duyệt' | 'Từ chối' | 'Chờ xử lý', reason?: string, approvedByName?: string) => void;
  onEditLocal: (updatedReport: Partial<Report> & { id: number; pelletImageUrls?: string[]; materialImageUrls?: string[] }) => void;
  id: string | undefined;
  images?: { pellet: ImageData[]; material: ImageData[] };
  onLoadImages: () => Promise<void>;
}) => {
  const theme = useTheme();
  const [showComments, setShowComments] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyingToAuthorName, setReplyingToAuthorName] = useState<string | undefined>(undefined);
  const [expandedReplyComments, setExpandedReplyComments] = useState<Record<number, boolean>>({});
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [showAllPelletImages, setShowAllPelletImages] = useState(false);
  const [showAllMaterialImages, setShowAllMaterialImages] = useState(false);
  const canApprove = report.status === 'Chờ xử lý' && !isNaN(Number(report.id));
  const canEdit = true;
  const initialImageCount = 4;

  useEffect(() => {
    if (!images) {
      onLoadImages().catch(() => {});
    }
  }, [report.id]); // load ảnh 1 lần theo reportId (có cache ở cha)

  const handleSubmitComment = async (values: { content: string }, { resetForm, setSubmitting }: any) => {
    try {
      await onAddComment(report.id, values.content, replyingToCommentId ?? undefined, replyingToAuthorName);
      resetForm();
      setShowCommentInput(false);
      setReplyingToCommentId(null);
      setReplyingToAuthorName(undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLightbox = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenLightbox(true);
  };

  const handleCloseLightbox = () => {
    setOpenLightbox(false);
    setSelectedImage(null);
  };

  const pelletImages = images?.pellet ?? [];
  const materialImages = images?.material ?? [];

  return (
    <>
      <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: theme.palette.primary.main }}>{(report.qcPersonName || 'U').charAt(0)}</Avatar>}
          action={<IconButtonExt><MoreOutlined /></IconButtonExt>}
          title={
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {report.qcPersonName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                QC ID: {report.qcPersonId} •{' '}
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2, fontSize: '16px' }}>{report.content || 'Không có nội dung'}</Typography>
          <Chip
            label={`Trạng thái: ${report.status || 'Chưa xác định'}`}
            color={report.status === 'Đã phê duyệt' ? 'success' : report.status === 'Từ chối' ? 'error' : 'warning'}
            size="small"
            sx={{ mb: 2 }}
          />
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, bgcolor: '#f5f5f5', mb: 2 }} onDoubleClick={() => canEdit && setEditModalOpen(true)}>
            <Grid container spacing={2}>
              <Grid size={4}>
                <Typography>Ngày kiểm tra:</Typography>
                <Typography fontWeight="bold">{formatDateDDMMYYYY(report.testDate)}</Typography>
                <Typography mt={2}>Xưởng:</Typography>
                <Typography fontWeight="bold">{report.supplierName || 'Chưa có'}</Typography>
                <Typography mt={2}>Chất lượng viên:</Typography>
                <Typography fontWeight="bold">{report.qualityRate || 'Chưa có'}</Typography>
              </Grid>
              <Grid size={4}>
                <Typography>Tên sản phẩm:</Typography>
                <Typography fontWeight="bold">{report.productName || 'Chưa có'}</Typography>
                <Typography mt={2}>Tồn viên (tấn):</Typography>
                <Typography fontWeight="bold">{report.tonVien !== undefined ? report.tonVien : 'Chưa có'}</Typography>
                <Typography mt={2}>Nguyên liệu:</Typography>
                <Typography fontWeight="bold">{report.material || 'Chưa có'}</Typography>
              </Grid>
              <Grid size={4}>
                <Typography>Mã đơn hàng:</Typography>
                <Typography fontWeight="bold">{report.batchNumber || 'Chưa có'}</Typography>
                <Typography mt={2}>Mã báo cáo:</Typography>
                <Typography fontWeight="bold">{report.reportId || 'Chưa có'}</Typography>
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ my: 2 }} />
          {(pelletImages.length > 0 || materialImages.length > 0) && (
            <>
              {pelletImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main }}>
                    Hình ảnh chất lượng viên
                  </Typography>
                  <Grid container spacing={2}>
                    {pelletImages.slice(0, showAllPelletImages ? pelletImages.length : initialImageCount).map((image, index) => (
                      <Grid key={image.id || index} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                              transform: 'translateY(-4px)'
                            }
                          }}
                          onClick={() => handleOpenLightbox(baseurl + image.imagePath)}
                        >
                          <img
                            src={baseurl + image.imagePath}
                            alt={`Pellet Quality ${index + 1}`}
                            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  {pelletImages.length > initialImageCount && (
                    <Collapse in={showAllPelletImages}>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {pelletImages.slice(initialImageCount).map((image, index) => (
                          <Grid key={image.id || index + initialImageCount} size={{ xs: 6, sm: 4, md: 3 }}>
                            <Box
                              sx={{
                                position: 'relative',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                  transform: 'translateY(-4px)'
                                }
                              }}
                              onClick={() => handleOpenLightbox(baseurl + image.imagePath)}
                            >
                              <img
                                src={baseurl + image.imagePath}
                                alt={`Pellet Quality ${index + initialImageCount + 1}`}
                                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Collapse>
                  )}
                  {pelletImages.length > initialImageCount && (
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Button
                        variant="outlined"
                        startIcon={<EyeOutlined />}
                        onClick={() => setShowAllPelletImages(!showAllPelletImages)}
                        sx={{ borderRadius: '20px', textTransform: 'none' }}
                      >
                        {showAllPelletImages ? 'Ẩn bớt' : 'Xem thêm'}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
              {materialImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main }}>
                    Hình ảnh nguyên liệu
                  </Typography>
                  <Grid container spacing={2}>
                    {materialImages.slice(0, showAllMaterialImages ? materialImages.length : initialImageCount).map((image, index) => (
                      <Grid key={image.id || index} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                              transform: 'translateY(-4px)'
                            }
                          }}
                          onClick={() => handleOpenLightbox(baseurl + image.imagePath)}
                        >
                          <img
                            src={baseurl + image.imagePath}
                            alt={`Material ${index + 1}`}
                            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  {materialImages.length > initialImageCount && (
                    <Collapse in={showAllMaterialImages}>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {materialImages.slice(initialImageCount).map((image, index) => (
                          <Grid key={image.id || index + initialImageCount} size={{ xs: 6, sm: 4, md: 3 }}>
                            <Box
                              sx={{
                                position: 'relative',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                  transform: 'translateY(-4px)'
                                }
                              }}
                              onClick={() => handleOpenLightbox(baseurl + image.imagePath)}
                            >
                              <img
                                src={baseurl + image.imagePath}
                                alt={`Material ${index + initialImageCount + 1}`}
                                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Collapse>
                  )}
                  {materialImages.length > initialImageCount && (
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Button
                        variant="outlined"
                        startIcon={<EyeOutlined />}
                        onClick={() => setShowAllMaterialImages(!showAllMaterialImages)}
                        sx={{ borderRadius: '20px', textTransform: 'none' }}
                      >
                        {showAllMaterialImages ? 'Ẩn bớt' : 'Xem thêm'}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
            </>
          )}
          {(pelletImages.length === 0 && materialImages.length === 0) && (
            <Box sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">Không có hình ảnh nào được tải lên.</Typography>
            </Box>
          )}
          <Grid container sx={{ mb: 2 }} alignItems="flex-start">
            <Grid size="auto">
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', pr: 1 }}>Lý do quyết định:</Typography>
            </Grid>
            <Grid>
              <Typography
                variant="body1"
                color={report.approvalReason ? 'text.primary' : 'text.secondary'}
                sx={{ fontStyle: report.approvalReason ? 'normal' : 'italic', whiteSpace: 'pre-line', textAlign: 'justify' }}
              >
                {report.approvalReason || 'Chưa có lý do'}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                startIcon={<CommentOutlined />}
                variant="text"
                color="inherit"
                onClick={() => {
                  setShowComments(!showComments);
                  if (!showComments && report.comments.length === 0) {
                    setShowCommentInput(true);
                  }
                }}
              >
                Đánh giá ({report.comments.length})
              </Button>
              <Button
                startIcon={<ShareAltOutlined />}
                variant="text"
                color="inherit"
                onClick={async () => {
                  const shareData = {
                    title: `Báo cáo chất lượng: ${report.productName}`,
                    text: `Báo cáo chất lượng\n--------------------\nSản phẩm: ${report.productName}\nMã lô hàng: ${report.batchNumber}\nNgày kiểm tra: ${formatDateDDMMYYYY(report.testDate)}\nNgười QC: ${report.qcPersonName}\nNội dung: ${report.content}`,
                    url: `${window.location.origin}/quality-control/quality-reports?reportId=${report.id}`
                  };
                  if (navigator.share) {
                    try { await navigator.share(shareData); } catch {}
                  } else {
                    try {
                      await navigator.clipboard.writeText(shareData.text + '\n\nLink: ' + shareData.url);
                      openSnackbar({ open: true, message: 'Nội dung và link báo cáo đã được sao chép!', variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
                    } catch {
                      openSnackbar({ open: true, message: 'Lỗi: Không thể sao chép nội dung.', variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
                    }
                  }
                }}
              >
                Chia sẻ
              </Button>
            </Stack>
            {canApprove && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleOutlined />}
                onClick={() => setApprovalModalOpen(true)}
              >
                Phê Duyệt
              </Button>
            )}
          </Box>
          <Collapse in={showComments}>
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              {report.comments?.filter((c) => !c.replyToCommentId).map((c) => {
                const replies = (report.comments || []).filter((r) => r.replyToCommentId === c.id);
                const expanded = !!expandedReplyComments[c.id];
                return (
                  <Box key={c.id} sx={{ mb: 1 }}>
                    <CommentComponent comment={{ id: c.id, author: c.authorName, content: c.content, createdAt: c.createdAt, replyToAuthor: c.replyToAuthorName }} />
                    <Stack direction="row" spacing={1} sx={{ ml: 7 }}>
                      <Button size="small" variant="text" onClick={() => { setShowCommentInput(true); setReplyingToCommentId(c.id); setReplyingToAuthorName(c.authorName); setTimeout(() => {
                        const el = document.querySelector<HTMLInputElement>(`#reply-input-${report.id}-${c.id}`); if (el) { el.focus(); }
                      }, 0); }}>Phản hồi ({replies.length})</Button>
                      {replies.length > 0 && (
                        <Button size="small" variant="text" onClick={() => setExpandedReplyComments((prev) => ({ ...prev, [c.id]: !expanded }))}>
                          {expanded ? 'Ẩn phản hồi' : 'Hiển thị phản hồi'}
                        </Button>
                      )}
                    </Stack>
                    {replyingToCommentId === c.id && (
                      <Box sx={{ mt: 1, ml: 7 }}>
                        <Formik initialValues={{ content: '' }} validationSchema={commentSchema} onSubmit={handleSubmitComment}>
                          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                            <Form>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main }}>{(currentUser.name || 'U').charAt(0)}</Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <TextField
                                    name="content"
                                    placeholder="Vui lòng nhập nội dung phản hồi"
                                    value={values.content}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.content && Boolean(errors.content)}
                                    helperText={touched.content && errors.content}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    size="small"
                                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                                    id={`reply-input-${report.id}-${c.id}`}
                                  />
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                                    <Button size="small" variant="outlined" onClick={() => { setReplyingToCommentId(null); setReplyingToAuthorName(undefined); }} startIcon={<CloseOutlined />}>
                                      Hủy
                                    </Button>
                                    <Button type="submit" size="small" variant="contained" disabled={isSubmitting || !values.content.trim()} startIcon={<SendOutlined />}>
                                      Gửi
                                    </Button>
                                  </Box>
                                </Box>
                              </Box>
                            </Form>
                          )}
                        </Formik>
                      </Box>
                    )}
                    {expanded && replies.length > 0 && (
                      <Box sx={{ mt: 1, ml: 7 }}>
                        {replies.map((rc) => (
                          <Box key={rc.id} sx={{ mb: 1 }}>
                            <CommentComponent comment={{ id: rc.id, author: rc.authorName, content: rc.content, createdAt: rc.createdAt, replyToAuthor: rc.replyToAuthorName }} />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
              {!showCommentInput ? (
                <Button size="small" variant="outlined" onClick={() => setShowCommentInput(true)} sx={{ mt: 1 }}>
                  Thêm bình luận
                </Button>
              ) : (
                <Formik initialValues={{ content: '' }} validationSchema={commentSchema} onSubmit={handleSubmitComment}>
                  {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>{(currentUser.name || 'U').charAt(0)}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            name="content"
                            placeholder="Viết bình luận của bạn..."
                            value={values.content}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.content && Boolean(errors.content)}
                            helperText={touched.content && errors.content}
                            multiline
                            rows={2}
                            fullWidth
                            size="small"
                            sx={{ bgcolor: 'white', borderRadius: 1 }}
                            id={`reply-input-${report.id}`}
                          />
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                            <Button size="small" variant="outlined" onClick={() => setShowCommentInput(false)} startIcon={<CloseOutlined />}>
                              Hủy
                            </Button>
                            <Button type="submit" size="small" variant="contained" disabled={isSubmitting || !values.content.trim()} startIcon={<SendOutlined />}>
                              Gửi
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Form>
                  )}
                </Formik>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
      {canApprove && (
        <ApprovalModal
          open={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          reportId={Number(report.id)}
          reportTitle={report.title}
          currentStatus={report.status}
          onSuccess={(newStatus, reason) => {
            setApprovalModalOpen(false);
            const statusText = newStatus === 2 ? 'Đã phê duyệt' : newStatus === 0 ? 'Từ chối' : 'Chờ xử lý';
            onApproveLocal(report.id, statusText, reason, currentUser.name);
          }}
        />
      )}
      {canEdit && (
        <EditReportForm
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditField(null); }}
          report={report}
          onUpdate={(updated) => { onEditLocal({ id: report.id, ...updated }); }}
          initialField={editField}
        />
      )}
      {openLightbox && selectedImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onClick={handleCloseLightbox}
        >
          <img
            src={selectedImage}
            alt="Full-size preview"
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
          />
        </Box>
      )}
    </>
  );
};

export default function QualityReportsList() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string }>({ id: '', name: '', role: '' });

  const usersMapRef = useRef<Record<string, string>>({});
  const goodsMapRef = useRef<Map<number, { id: number; name: string; description: string }>>(new Map());
  const suppliersMapRef = useRef<Map<number, { id: number; name: string }>>(new Map());
  const [imagesCache, setImagesCache] = useState<ImagesCache>({});

  const fetchCatalogsOnce = async () => {
    const [meRes, userRes, goodsRes, suppliersRes] = await Promise.all([
      axiosServices.get(ACCOUNT_API.GET_ME),
      axiosServices.get(USER_API.COMMON),
      axiosServices.get(GOOD_API.COMMON),
      axiosServices.get(SUPPLIER_API.COMMON)
    ]);
    const apiUser = userRes.data?.data;
    const users: Record<string, string> = Array.isArray(apiUser)
      ? apiUser.reduce((m: any, u: any) => { m[String(u.id)] = u.name || 'Unknown'; return m; }, {})
      : { [String(apiUser?.id)]: apiUser?.name || 'Unknown' };
    usersMapRef.current = users;

    const me = meRes.data?.data || {};
    const meId = String(me?.id || '');
    const meName = users[meId] || me?.name || 'Unknown';
    setCurrentUser({ id: meId, name: meName, role: me?.role || '' });

    (goodsRes.data?.data || []).forEach((g: any) => goodsMapRef.current.set(g.id, { id: g.id, name: g.name, description: g.description || '' }));
    (suppliersRes.data?.data || []).forEach((s: any) => suppliersMapRef.current.set(s.id, { id: s.id, name: s.name }));
  };

  const fetchEvaluates = async () => {
    setLoading(true);
    try {
      const evaluationsRes = await axiosServices.get(`${EVALUATE_API.COMMON}?status=-1&t=${Date.now()}`);
      const apiData = evaluationsRes.data?.data ?? [];

      const reportsMapped: Report[] = apiData.map((it: any) => {
        const code = it.code || '';
        const checkDate = it.checkDate || '';
        const generatedReportId = code && checkDate ? `${code}${dayjs(checkDate).format('DDMM')}` : code || `EVAL-${it.id}`;

        const productName = goodsMapRef.current.get(it.goodId)?.name || it.material || 'Unknown';
        const supplierName = suppliersMapRef.current.get(it.supplierId)?.name || it.supplierName || 'Unknown';

        return {
          id: it.id,
          reportId: generatedReportId,
          qcPersonName: usersMapRef.current[String(it.userId)] || 'Unknown',
          qcPersonId: String(it.userId ?? ''),
          title: it.material ?? '',
          content: it.description ?? '',
          productName,
          batchNumber: it.lotCode ?? generatedReportId,
          testDate: it.checkDate ?? '',
          createdAt: it.createdAt ?? '',
          status: mapStatusToText(it.status),
          comments: [],
          approvedBy: it.approvedBy ?? undefined,
          approvedAt: it.approvedAt ?? undefined,
          approvalReason: it.nodeDecided_Evaluate ?? undefined,
          imageUrl: [],
          qualityRate: it.qualityRate ?? undefined,
          material: it.material ?? undefined,
          goodId: it.goodId ?? undefined,
          supplierId: it.supplierId ?? undefined,
          supplierName,
          tonVien: it.tonVien ?? undefined,
          description: it.description ?? ''
        };
      });

      const filteredById = id
        ? reportsMapped.filter((report) => report.batchNumber.startsWith(`${id}_`))
        : reportsMapped;

      setReports(filteredById);

      // Fetch comments for each report and merge
      try {
        const commentResponses = await Promise.all(
          filteredById.map((r) =>
            axiosServices.get(FEEDBACKREPORT_API.COMMON, { params: { reportId: r.id, reportType: 'evaluate' } }).catch(() => ({ data: { data: [] } }))
          )
        );

        const reportsWithComments = filteredById.map((r, idx) => {
          const items = commentResponses[idx]?.data?.data || [];
          const mapped = Array.isArray(items)
            ? items.map((it: any) => ({
                id: it.id,
                authorName: usersMapRef.current[String(it.userId || it.createdBy || '')] || 'Unknown',
                content: (it.feedbackContent || it.content || '').replace(/^@@reply:[^\n|]*\|?parentId:\d+\n|^@@reply:[^\n]*\n/, ''),
                replyToAuthorName: ((it.feedbackContent || it.content || '').match(/^@@reply:([^\n|]*)/) || [])[1],
                replyToCommentId: Number((((it.feedbackContent || it.content || '').match(/\|parentId:(\d+)/) || [])[1])) || undefined,
                createdAt: it.createdAt
              }))
            : [];
          return { ...r, comments: mapped } as Report;
        });
        setReports(reportsWithComments);
      } catch {}
    } catch (error: any) {
      openSnackbar({
        open: true,
        message: `Lỗi khi tải dữ liệu đánh giá: ${error.message || 'Không xác định'}`,
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadImagesIfNeeded = async (reportId: number) => {
    if (imagesCache[reportId]) return;
    try {
      const [pelletResponse, materialResponse] = await Promise.all([
        axiosServices.get(IMAGE_API.COMMON, { params: { referId: reportId, referType: 'QUALITY-REPORT' } }),
        axiosServices.get(IMAGE_API.COMMON, { params: { referId: reportId, referType: 'QUALITY-REPORT-MATERIAL' } })
      ]);
      const pellet = Array.isArray(pelletResponse.data?.data)
        ? pelletResponse.data.data.filter((img: any) => img.status === 1 && img.referType === 'QUALITY-REPORT')
          .map((img: any) => ({ imagePath: img.imagePath, status: img.status, id: img.id }))
        : [];
      const material = Array.isArray(materialResponse.data?.data)
        ? materialResponse.data.data.filter((img: any) => img.status === 1 && img.referType === 'QUALITY-REPORT-MATERIAL')
          .map((img: any) => ({ imagePath: img.imagePath, status: img.status, id: img.id }))
        : [];
      setImagesCache((prev) => ({ ...prev, [reportId]: { pellet, material } }));
    } catch {
      setImagesCache((prev) => ({ ...prev, [reportId]: { pellet: [], material: [] } }));
    }
  };

  const handleAddComment = async (reportId: number, content: string, replyToCommentId?: number, replyToAuthorName?: string) => {
    try {
      // Encode reply metadata vào content nếu là phản hồi
      const feedbackContent = replyToAuthorName ? `@@reply:${replyToAuthorName}|parentId:${replyToCommentId}\n${content}` : content;
      const feedbackData = { reportId, feedbackContent, reportType: 'evaluate', code: `FB_${Date.now()}`, status: 1, createdBy: Number(currentUser.id) || undefined };
      await axiosServices.post(FEEDBACKREPORT_API.COMMON, feedbackData);
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== reportId) return r;
          const newContent = feedbackContent;
          const displayContent = replyToAuthorName ? content : newContent;
          return {
            ...r,
            comments: [
              ...(r.comments || []),
              { id: Date.now(), authorName: currentUser.name || 'Unknown', content: displayContent, createdAt: new Date().toISOString(), replyToAuthorName, replyToCommentId }
            ]
          };
        })
      );
      openSnackbar({ open: true, message: 'Gửi bình luận thành công', variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
    } catch (err: any) {
      throw err;
    }
  };

  const handleCreateReport = (newReport: Report) => {
    setReports((prevReports) => [newReport, ...prevReports]);
  };

  const handleApproveLocal = (reportId: number, statusText: 'Đã phê duyệt' | 'Từ chối' | 'Chờ xử lý', reason?: string, approvedByName?: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: statusText, approvalReason: reason, approvedBy: approvedByName, approvedAt: new Date().toISOString() } : r))
    );
  };

  const handleEditLocal = (updated: Partial<Report> & { id: number; pelletImageUrls?: string[]; materialImageUrls?: string[] }) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } as Report : r)));
    if (updated.pelletImageUrls || updated.materialImageUrls) {
      setImagesCache((prev) => {
        const cur = prev[updated.id] || { pellet: [], material: [] };
        return {
          ...prev,
          [updated.id]: {
            pellet: [
              ...cur.pellet,
              ...(updated.pelletImageUrls || []).map((url) => ({ imagePath: url.replace(baseurl, ''), status: 1 }))
            ],
            material: [
              ...cur.material,
              ...(updated.materialImageUrls || []).map((url) => ({ imagePath: url.replace(baseurl, ''), status: 1 }))
            ]
          }
        };
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchCatalogsOnce();
        await fetchEvaluates();
      } catch {
        // Errors are notified inside functions
      }
    })();
  }, [id]);

  useEffect(() => {
    const timerId = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    const reportId = searchParams.get('reportId');
    if (reportId && reports.length > 0) {
      const targetReport = document.getElementById(`report-${reportId}`);
      if (targetReport) {
        targetReport.scrollIntoView({ behavior: 'smooth', block: 'start' });
        (targetReport as HTMLElement).style.border = '2px solid #1976d2';
        setTimeout(() => { (targetReport as HTMLElement).style.border = 'none'; }, 2000);
      }
    }
  }, [reports, searchParams]);

  const filteredReports = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    if (!term) return reports;
    return reports.filter((r) =>
      (r.qcPersonName || '').toLowerCase().includes(term) ||
      (r.title || '').toLowerCase().includes(term) ||
      (r.productName || '').toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term)
    );
  }, [reports, debouncedSearchTerm]);

  return (
    <>
      <MainCard
        title={
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Báo cáo chất lượng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách các báo cáo kiểm tra chất lượng từ đội ngũ QC
            </Typography>
          </Box>
        }
        secondary={
          <Button
            variant="contained"
            size="small"
            startIcon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Tạo báo cáo mới
          </Button>
        }
      >
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên QC, tiêu đề báo cáo hoặc sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: 600, bgcolor: 'white', borderRadius: 1 }}
          />
        </Box>
        <Box>
          {loading ? (
            <Typography>Đang tải dữ liệu...</Typography>
          ) : filteredReports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Box sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>
                <SearchOutlined />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Không tìm thấy báo cáo nào
              </Typography>
              <Typography variant="body2">
                {searchTerm
                  ? `Không có báo cáo nào phù hợp với từ khóa "${searchTerm}"`
                  : id
                    ? `Không có báo cáo nào cho ID ${id}`
                    : 'Chưa có báo cáo chất lượng nào'}
              </Typography>
            </Box>
          ) : (
            filteredReports.map((report) => (
              <div id={`report-${report.id}`} key={report.id}>
                <QualityReportPost
                  report={report}
                  currentUser={currentUser}
                  onAddComment={handleAddComment}
                  onApproveLocal={handleApproveLocal}
                  onEditLocal={handleEditLocal}
                  id={id}
                  images={imagesCache[report.id]}
                  onLoadImages={() => loadImagesIfNeeded(report.id)}
                />
              </div>
            ))
          )}
        </Box>
      </MainCard>
      <CreateReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateReport}
        reportId={id ? Number(id) : undefined}
      />
    </>
  );
}