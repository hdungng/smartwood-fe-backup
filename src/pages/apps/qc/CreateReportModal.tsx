import { useState, useEffect, useContext, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
  Paper,
  Box,
  InputLabel,
  Autocomplete,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axiosServices from 'utils/axios';
import JWTContext from 'contexts/JWTContext';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { CONTRACT_API, EVALUATE_API, IMAGE_API, GOOD_API, SUPPLIER_API, CODEDELTAIL_API, ACCOUNT_API, USER_API } from 'api/constants';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { CloudUploadOutlined } from '@ant-design/icons';

interface ImageData {
  file: File | string;
  status: number;
  id?: number;
}

// Simple Dropzone Component (giữ nguyên UI)
const SimpleDropzone = ({
  files,
  setFiles,
  label
}: {
  files: ImageData[];
  setFiles: (files: ImageData[]) => void;
  label: string;
}) => {
  const baseurl = import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).map((file) => ({ file, status: 1 }));
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map((file) => ({ file, status: 1 }));
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles[index].status = 0; // Mark as deleted
    setFiles(newFiles);
  };

  return (
    <Box>
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: 1,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: 'grey.50',
          '&:hover': { bgcolor: 'grey.100' },
          p: 2
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUploadOutlined style={{ fontSize: '2rem', color: '#1976d2' }} />
        <Typography variant="body2">Kéo thả hoặc nhấp để tải lên {label}</Typography>
        <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
      </Box>

      {files.some((f) => f.status === 1) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {files.filter((f) => f.status === 1).length} hình ảnh đã chọn:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: 100, overflowY: 'auto' }}>
            {files.map((item, index) => {
              if (item.status === 0) return null;
              const imageUrl = typeof item.file === 'string' ? baseurl + item.file : URL.createObjectURL(item.file);
              return (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Preview ${index}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onLoad={() => typeof item.file !== 'string' && URL.revokeObjectURL(imageUrl)}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeFile(index)}
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      bgcolor: 'error.main',
                      color: 'white',
                      width: 20,
                      height: 20,
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                  >
                    <CloseOutlined style={{ fontSize: '0.7rem' }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Form values
interface QualityReportFormValues {
  contractId: number | null;
  code: string;
  goodId: number | null;
  supplierId: number | null;
  lotCode: string;
  checkDate: Date | string | null;
  description: string;
  material: string;
  qualityRate: string;
  tonVien: number;
  status: number;
}

const validationSchema = yup.object({
  contractId: yup.number().required('Hợp đồng là bắt buộc').nullable(),
  code: yup.string(),
  goodId: yup.number().required('Sản phẩm là bắt buộc'),
  supplierId: yup.number().required('Xưởng là bắt buộc'),
  lotCode: yup.string().required('Mã đơn hàng là bắt buộc'),
  checkDate: yup.date().required('Ngày kiểm tra là bắt buộc').test('is-valid-date', 'Ngày không hợp lệ', (value) => value && dayjs(value).isValid()),
  description: yup.string().required('Nội dung báo cáo là bắt buộc'),
  material: yup.string().required('Nguyên liệu là bắt buộc'),
  qualityRate: yup.string().required('Chất lượng viên là bắt buộc'),
  tonVien: yup.number().required('Tồn viên là bắt buộc').min(0, 'Tồn viên phải là số không âm')
});

const CreateReportModal = ({
  open,
  onClose,
  onSubmit,
  reportId
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  reportId?: number;
}) => {
  const [pelletQualityImages, setPelletQualityImages] = useState<ImageData[]>([]);
  const [materialImages, setMaterialImages] = useState<ImageData[]>([]);
  const [contractOptions, setContractOptions] = useState<{ id: number; code: string }[]>([]);
  const [goodOptions, setGoodOptions] = useState<{ id: number; name: string; description: string }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [qualityRateOptions, setQualityRateOptions] = useState<{ id: number; description: string }[]>([]);
  const [fetched, setFetched] = useState(false);
  const authContext = useContext(JWTContext);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string }>({ id: 0, name: 'Unknown' });

  // Fetch options 1 lần khi mở lần đầu
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [meRes, usersRes, contractsRes, goodsRes, suppliersRes, codeDetailRes] = await Promise.all([
          axiosServices.get(ACCOUNT_API.GET_ME),
          axiosServices.get(USER_API.COMMON),
          axiosServices.get(CONTRACT_API.GET_LIST),
          axiosServices.get(GOOD_API.COMMON),
          axiosServices.get(SUPPLIER_API.COMMON),
          axiosServices.get(`${CODEDELTAIL_API.COMMON}?codeId=45`)
        ]);

        // Resolve current user id & name
        const me = meRes.data?.data || {};
        const allUsers = Array.isArray(usersRes.data?.data) ? usersRes.data.data : [usersRes.data?.data].filter(Boolean);
        const meId = Number(me?.id) || (authContext?.user?.id ? Number(authContext.user.id) : 0);
        const meName = (allUsers.find((u: any) => Number(u.id) === meId)?.name) || me?.name || authContext?.user?.name || 'Unknown';
        setCurrentUser({ id: meId, name: meName });

        setContractOptions(contractsRes.data.data.map((c: any) => ({ id: c.id, code: c.code })));
        setGoodOptions(
          goodsRes.data.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            description: g.description || ''
          }))
        );
        setSupplierOptions(suppliersRes.data.data.map((s: any) => ({ id: s.id, name: s.name })));
        setQualityRateOptions(
          codeDetailRes.data.data.map((d: any) => ({
            id: d.id,
            description: d.description || ''
          }))
        );
        setFetched(true);
      } catch (error: any) {
        openSnackbar({
          open: true,
          message: 'Lỗi khi tải dữ liệu',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    if (open && !fetched) {
      fetchOptions();
    }
  }, [open, fetched]);

  // Mặc định chọn hợp đồng đầu tiên khi có
  useEffect(() => {
    if (contractOptions.length > 0 && !formik.values.contractId) {
      formik.setFieldValue('contractId', contractOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractOptions]);

  const generateReportId = (code: string, checkDate: string, existingCodes: string[]) => {
    const dateStr = checkDate ? dayjs(checkDate).format('DDMM') : dayjs().format('DDMM');
    const baseCode = code || 'EVAL';
    const fullBaseCode = `${baseCode}${dateStr}`;
    let attempts = 0;
    const maxAttempts = 10;
    let newCode: string;
    do {
      const randomSuffix = Math.floor(Math.random() * 900) + 100;
      newCode = `${fullBaseCode}-${String(randomSuffix).padStart(3, '0')}`;
      attempts++;
    } while (existingCodes.includes(newCode) && attempts < maxAttempts);
    if (attempts >= maxAttempts) return `${fullBaseCode}-${String(Date.now()).slice(-3)}`;
    return newCode;
  };

  const formik = useFormik<QualityReportFormValues>({
    initialValues: {
      contractId: null,
      code: '',
      goodId: null,
      supplierId: null,
      lotCode: '',
      checkDate: new Date(),
      description: '',
      material: '',
      qualityRate: '',
      tonVien: 0,
      status: 0
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (reportId === undefined) throw new Error('Không có ID báo cáo từ danh sách');

        const userId = currentUser.id || (authContext?.user?.id ? Number(authContext.user.id) : 1);
        if (!userId) throw new Error('Không thể xác định người dùng hiện tại');

        if (!values.lotCode.trim()) throw new Error('Mã đơn hàng không được để trống để tạo mã báo cáo');
        if (!values.checkDate) throw new Error('Ngày kiểm tra không được để trống để tạo mã báo cáo');

        const formattedLotCode = `${reportId}_${values.lotCode.trim()}`;

        // Lấy danh sách code hiện có để tạo reportId mới, chỉ lấy 1 lần ở đây
        const evaluationsRes = await axiosServices.get(`${EVALUATE_API.COMMON}?status=-1`);
        const existingCodes = evaluationsRes.data?.data?.map((it: any) => it.code || '') || [];
        const generatedCode = generateReportId(formattedLotCode, values.checkDate as string, existingCodes);

        const reportData = {
          contractId: Number(values.contractId),
          code: generatedCode,
          goodId: Number(values.goodId),
          supplierId: Number(values.supplierId),
          lotCode: formattedLotCode,
          checkDate: values.checkDate ? dayjs(values.checkDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          description: String(values.description).trim(),
          material: String(values.material).trim(),
          qualityRate: String(values.qualityRate).trim(),
          tonVien: Number(values.tonVien) || 0,
          status: 1,
          createdBy: userId,
          userId: userId
        };

        // Tạo evaluate
        const res = await axiosServices.post(EVALUATE_API.COMMON, reportData);
        const newId = res.data?.data?.id;
        if (!newId) throw new Error('Không nhận được ID từ phản hồi API');

        // Upload ảnh (nếu có), trả về các url ảnh để hiển thị ngay mà không refetch
        const pelletImageUrls: string[] = [];
        const materialImageUrls: string[] = [];

        if (pelletQualityImages.length > 0) {
          for (const img of pelletQualityImages.filter((img) => img.status === 1 && img.file instanceof File)) {
            const formData = new FormData();
            formData.append('File', img.file);
            formData.append('referId', newId.toString());
            formData.append('referType', 'QUALITY-REPORT');
            const imageRes = await axiosServices.post(IMAGE_API.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newUrl = imageRes.data?.imagePath || '';
            if (newUrl) pelletImageUrls.push(newUrl);
          }
        }

        if (materialImages.length > 0) {
          for (const img of materialImages.filter((img) => img.status === 1 && img.file instanceof File)) {
            const formData = new FormData();
            formData.append('File', img.file);
            formData.append('referId', newId.toString());
            formData.append('referType', 'QUALITY-REPORT-MATERIAL');
            const imageRes = await axiosServices.post(IMAGE_API.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newUrl = imageRes.data?.imagePath || '';
            if (newUrl) materialImageUrls.push(newUrl);
          }
        }

        // Build object để push vào list ngay lập tức
        const productName =
          goodOptions.length > 0 ? goodOptions.find((g) => g.id === values.goodId)?.name || values.material || '' : values.material || '';
        const supplierName = supplierOptions.length > 0 ? supplierOptions.find((s) => s.id === values.supplierId)?.name || '' : '';

        const newReport = {
          id: newId,
          reportId: generatedCode,
          qcPersonName: currentUser.name || authContext?.user?.name || 'Unknown',
          qcPersonId: String(userId),
          title: values.material,
          content: values.description,
          productName,
          batchNumber: formattedLotCode,
          testDate: values.checkDate,
          createdAt: new Date().toISOString(),
          status: 'Chờ xử lý' as const,
          comments: [],
          imageUrl: [...pelletImageUrls, ...materialImageUrls],
          qualityRate: values.qualityRate,
          material: values.material,
          goodId: values.goodId,
          supplierName,
          tonVien: values.tonVien,
          description: values.description,
          pelletImageUrls: pelletImageUrls.map((p) => (p.startsWith('http') ? p : (import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/') + p)),
          materialImageUrls: materialImageUrls.map((p) => (p.startsWith('http') ? p : (import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/') + p))
        };

        openSnackbar({ open: true, message: 'Tạo báo cáo thành công', variant: 'alert', alert: { color: 'success' } } as SnackbarProps);

        // Cập nhật cục bộ cho danh sách (không refetch)
        onSubmit(newReport);

        handleClose();
      } catch (err: any) {
        openSnackbar({
          open: true,
          message: `Lỗi khi tạo báo cáo: ${err.response?.data?.message || err.message || 'Không xác định'}`,
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      }
    }
  });

  const handleClose = () => {
    formik.resetForm();
    setPelletQualityImages([]);
    setMaterialImages([]);
    setGoodOptions([]);
    setSupplierOptions([]);
    setIsLoadingOptions(true);
    onClose();
  };

  const handleSubmit = () => {
    formik.setTouched({
      contractId: true,
      goodId: true,
      supplierId: true,
      lotCode: true,
      checkDate: true,
      description: true,
      material: true,
      qualityRate: true,
      tonVien: true
    }, true); // The second param true validates after touch
    formik.submitForm();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} variant="h5">
        Tạo báo cáo chất lượng mới
        <IconButton onClick={handleClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {isLoadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Thông tin cơ bản
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="checkDate">
                      Ngày kiểm tra <span style={{ color: 'red' }}>(*)</span>
                    </InputLabel>
                    <DatePicker
                      value={formik.values.checkDate ? dayjs(formik.values.checkDate) : null}
                      onChange={(date) => formik.setFieldValue('checkDate', date ? date : null)}
                      slotProps={{
                        textField: {
                          error: formik.touched.checkDate && Boolean(formik.errors.checkDate),
                          helperText: formik.touched.checkDate && (formik.errors.checkDate as string),
                          onBlur: () => formik.setFieldTouched('checkDate', true)
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="goodId">
                      Tên sản phẩm <span style={{ color: 'red' }}>(*)</span>
                    </InputLabel>
                    <Autocomplete
                      id="goodId"
                      options={goodOptions}
                      getOptionLabel={(option) => option.name}
                      value={goodOptions.find((g) => g.id === formik.values.goodId) || null}
                      onChange={(_, newValue) => formik.setFieldValue('goodId', newValue ? newValue.id : null)}
                      onBlur={() => formik.setFieldTouched('goodId', true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn hoặc nhập tên sản phẩm"
                          error={formik.touched.goodId && Boolean(formik.errors.goodId)}
                          helperText={formik.touched.goodId && (formik.errors.goodId as string)}
                        />
                      )}
                      disabled={isLoadingOptions}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="lotCode">
                      Mã đơn hàng <span style={{ color: 'red' }}>(*)</span>
                    </InputLabel>
                    <TextField
                      id="lotCode"
                      name="lotCode"
                      placeholder={`Nhập mã đơn hàng`}
                      fullWidth
                      value={formik.values.lotCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lotCode && Boolean(formik.errors.lotCode)}
                      helperText={formik.touched.lotCode && (formik.errors.lotCode as string)}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="code">Mã báo cáo </InputLabel>
                    <TextField
                      id="code"
                      name="code"
                      placeholder="Tự động tạo từ mã lô hàng và ngày"
                      fullWidth
                      value={
                        reportId
                          ? `${reportId}_${formik.values.lotCode}${dayjs(formik.values.checkDate).format('DDMM')}`
                          : formik.values.lotCode + dayjs(formik.values.checkDate).format('DDMM')
                      }
                      disabled
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Thông tin chất lượng
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="supplierId">
                      Xưởng <span style={{ color: 'red' }}>(*)</span>
                    </InputLabel>
                    <Autocomplete
                      id="supplierId"
                      options={supplierOptions}
                      getOptionLabel={(option) => option.name}
                      value={supplierOptions.find((s) => s.id === formik.values.supplierId) || null}
                      onChange={(_, newValue) => formik.setFieldValue('supplierId', newValue ? newValue.id : null)}
                      onBlur={() => formik.setFieldTouched('supplierId', true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn hoặc nhập xưởng"
                          error={formik.touched.supplierId && Boolean(formik.errors.supplierId)}
                          helperText={formik.touched.supplierId && (formik.errors.supplierId as string)}
                        />
                      )}
                      disabled={isLoadingOptions}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="tonVien">
                      Tồn viên (tấn) <span style={{ color: 'red' }}>(*)</span>
                    </InputLabel>
                    <TextField
                      id="tonVien"
                      name="tonVien"
                      placeholder="Nhập số lượng tồn viên"
                      fullWidth
                      type="number"
                      value={formik.values.tonVien}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.tonVien && Boolean(formik.errors.tonVien)}
                      helperText={formik.touched.tonVien && (formik.errors.tonVien as string)}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="description">
                      Mô tả nội dung báo cáo <span style={{ color: 'red' }}>(*)</span>
                    </InputLabel>
                    <TextField
                      id="description"
                      name="description"
                      placeholder="Nhập nội dung chi tiết về kết quả kiểm tra chất lượng"
                      multiline
                      rows={4}
                      fullWidth
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && (formik.errors.description as string)}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Đánh giá chất lượng và hình ảnh
              </Typography>
              <Stack spacing={3}>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="qualityRate">
                          Chất lượng viên <span style={{ color: 'red' }}>(*)</span>
                        </InputLabel>
                        <Autocomplete
                          id="qualityRate"
                          options={qualityRateOptions}
                          getOptionLabel={(option) => option.description}
                          value={qualityRateOptions.find((q) => q.description === formik.values.qualityRate) || null}
                          onChange={(_, newValue) => formik.setFieldValue('qualityRate', newValue ? newValue.description : '')}
                          onBlur={() => formik.setFieldTouched('qualityRate', true)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Chọn chất lượng viên"
                              error={formik.touched.qualityRate && Boolean(formik.errors.qualityRate)}
                              helperText={formik.touched.qualityRate && (formik.errors.qualityRate as string)}
                            />
                          )}
                          disabled={isLoadingOptions}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Hình ảnh chất lượng viên
                      </Typography>
                      <SimpleDropzone files={pelletQualityImages} setFiles={setPelletQualityImages} label="chất lượng viên" />
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="material">
                          Nguyên liệu <span style={{ color: 'red' }}>(*)</span>
                        </InputLabel>
                        <Autocomplete
                          id="material"
                          options={goodOptions}
                          getOptionLabel={(option) => option.description}
                          value={goodOptions.find((m) => m.description === formik.values.material) || null}
                          onChange={(_, newValue) => formik.setFieldValue('material', newValue ? newValue.description : '')}
                          onBlur={() => formik.setFieldTouched('material', true)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Chọn nguyên liệu"
                              error={formik.touched.material && Boolean(formik.errors.material)}
                              helperText={formik.touched.material && (formik.errors.material as string)}
                            />
                          )}
                          disabled={isLoadingOptions}
                        />
                      </Stack>
                    </Grid>                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Hình ảnh nguyên liệu
                      </Typography>
                      <SimpleDropzone files={materialImages} setFiles={setMaterialImages} label="nguyên liệu" />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Paper>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={formik.isSubmitting || isLoadingOptions}>
          Tạo báo cáo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateReportModal;