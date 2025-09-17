import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { EVALUATE_API, GOOD_API, SUPPLIER_API, IMAGE_API, CODEDELTAIL_API } from 'api/constants';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { CloudUploadOutlined } from '@ant-design/icons';

const editSchema = yup.object({
  goodId: yup.number().required('Tên sản phẩm là bắt buộc'),
  supplierId: yup.number().required('Xưởng là bắt buộc'),
  lotCode: yup.string().required('Mã đơn hàng là bắt buộc'),
  checkDate: yup
    .date()
    .required('Ngày kiểm tra là bắt buộc')
    .test('is-valid-date', 'Ngày không hợp lệ', (value) => value && dayjs(value).isValid()),
  description: yup.string().required('Nội dung báo cáo là bắt buộc'),
  material: yup.string().required('Nguyên liệu là bắt buộc'),
  qualityRate: yup.string().required('Chất lượng viên là bắt buộc'),
  tonVien: yup.number().required('Tồn viên là bắt buộc').min(0, 'Tồn viên phải là số không âm')
});

interface ImageData {
  file: File | string;
  status: number;
  id?: number;
}

const SimpleDropzone = ({ files, setFiles, label }: { files: ImageData[]; setFiles: (files: ImageData[]) => void; label: string }) => {
  const baseurl = import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/';
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
        onClick={() => document.getElementById(`file-input-${label}`)?.click()}
      >
        <CloudUploadOutlined style={{ fontSize: '2rem', color: '#1976d2' }} />
        <Typography variant="body2">Kéo thả hoặc nhấp để tải lên {label}</Typography>
        <input id={`file-input-${label}`} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
      </Box>
      {files.length > 0 && files.some((f) => f.status === 1) ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {files.filter((f) => f.status === 1).length} hình ảnh đã chọn:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: 100, overflowY: 'auto' }}>
            {files.map((item, index) => {
              if (item.status === 0) return null;
              const imageUrl = typeof item.file === 'string' ? `${baseurl}${item.file}` : URL.createObjectURL(item.file);
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
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.png';
                    }}
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
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Chưa có hình ảnh {label} được chọn
        </Typography>
      )}
    </Box>
  );
};

const EditReportForm = ({
  open,
  onClose,
  report,
  onUpdate,
  initialField
}: {
  open: boolean;
  onClose: () => void;
  report: any;
  onUpdate: (updatedReport: any) => void;
  initialField?: string | null;
}) => {
  const [pelletQualityImages, setPelletQualityImages] = useState<ImageData[]>([]);
  const [materialImages, setMaterialImages] = useState<ImageData[]>([]);
  const [goodOptions, setGoodOptions] = useState<{ id: number; name: string; description: string }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qualityRateOptions, setQualityRateOptions] = useState<{ id: number; description: string }[]>([]);

  useEffect(() => {
    const fetchQualityRateOptions = async () => {
      try {
        const res = await axiosServices.get(`${CODEDELTAIL_API.COMMON}?codeId=45`);
        const qualityRates = res.data.data.map((d: any) => ({
          id: d.id,
          description: d.description || ''
        }));
        setQualityRateOptions(qualityRates);
      } catch (error: any) {
        openSnackbar({
          open: true,
          message: 'Lỗi khi tải danh sách chất lượng viên',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [goodsRes, suppliersRes, pelletImagesRes, materialImagesRes] = await Promise.all([
          axiosServices.get(GOOD_API.COMMON),
          axiosServices.get(SUPPLIER_API.COMMON),
          axiosServices.get(IMAGE_API.COMMON, { params: { referId: report.id, referType: 'QUALITY-REPORT' } }),
          axiosServices.get(IMAGE_API.COMMON, { params: { referId: report.id, referType: 'QUALITY-REPORT-MATERIAL' } })
        ]);

        setGoodOptions(goodsRes.data.data.map((g: any) => ({ id: g.id, name: g.name, description: g.description || '' })));
        setSupplierOptions(suppliersRes.data.data.map((s: any) => ({ id: s.id, name: s.name })));

        const pelletImagesData = pelletImagesRes.data.data || [];
        const materialImagesData = materialImagesRes.data.data || [];

        const pelletImages: ImageData[] = pelletImagesData
          .filter((img: any) => img.status === 1 && img.referType === 'QUALITY-REPORT')
          .map((img: any) => ({
            file: img.imagePath,
            status: 1,
            id: img.id
          }));
        const materialImages: ImageData[] = materialImagesData
          .filter((img: any) => img.status === 1 && img.referType === 'QUALITY-REPORT-MATERIAL')
          .map((img: any) => ({
            file: img.imagePath,
            status: 1,
            id: img.id
          }));

        if (pelletImages.length > 0 || materialImages.length > 0) {
          setPelletQualityImages(pelletImages);
          setMaterialImages(materialImages);
        } else {
          const pelletImagesFallback: ImageData[] = report.pelletImageUrls
            ? report.pelletImageUrls.map((url: string) => ({
                file: url.replace(import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/', ''),
                status: 1
              }))
            : [];
          const materialImagesFallback: ImageData[] = report.materialImageUrls
            ? report.materialImageUrls.map((url: string) => ({
                file: url.replace(import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/', ''),
                status: 1
              }))
            : [];
          setPelletQualityImages(pelletImagesFallback);
          setMaterialImages(materialImagesFallback);
        }

        await fetchQualityRateOptions();
      } catch (error: any) {
        const pelletImagesFallback: ImageData[] = report.pelletImageUrls
          ? report.pelletImageUrls.map((url: string) => ({
              file: url.replace(import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/', ''),
              status: 1
            }))
          : [];
        const materialImagesFallback: ImageData[] = report.materialImageUrls
          ? report.materialImageUrls.map((url: string) => ({
              file: url.replace(import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:7000/', ''),
              status: 1
            }))
          : [];
        setPelletQualityImages(pelletImagesFallback);
        setMaterialImages(materialImagesFallback);
        openSnackbar({
          open: true,
          message: 'Lỗi khi tải dữ liệu cho form',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, report.id, report.pelletImageUrls, report.materialImageUrls]);

  const formik = useFormik({
    initialValues: {
      goodId: report.goodId || null,
      supplierId: report.supplierId || null,
      lotCode: report.batchNumber || '',
      checkDate: report.testDate ? dayjs(report.testDate).toDate() : null,
      description: report.content || '',
      material: report.material || '',
      qualityRate: report.qualityRate || '',
      tonVien: report.tonVien || 0,
      reportId: report.reportId || ''
    },
    validationSchema: editSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          goodId: Number(values.goodId),
          supplierId: Number(values.supplierId),
          lotCode: String(values.lotCode).trim(),
          checkDate: values.checkDate ? dayjs(values.checkDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          description: String(values.description).trim(),
          material: String(values.material).trim(),
          qualityRate: String(values.qualityRate).trim(),
          tonVien: Number(values.tonVien) || 0
        };

        const response = await axiosServices.put(`${EVALUATE_API.COMMON}/${report.id}`, payload);

        // Handle pellet images
        const pelletImagesToUpload = pelletQualityImages.filter((img) => img.status === 1 && img.file instanceof File);
        const pelletImagesToDelete = pelletQualityImages.filter((img) => img.status === 0 && img.id).map((img) => img.id);
        const pelletImageUrls: string[] = [];

        if (pelletImagesToUpload.length > 0) {
          for (const img of pelletImagesToUpload) {
            const formData = new FormData();
            formData.append('File', img.file);
            formData.append('referId', String(report.id));
            formData.append('referType', 'QUALITY-REPORT');
            const imageRes = await axiosServices.post(IMAGE_API.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newImageUrl = imageRes.data?.imagePath;
            if (newImageUrl) pelletImageUrls.push(newImageUrl);
          }
        }

        if (pelletImagesToDelete.length > 0) {
          await Promise.all(pelletImagesToDelete.map((id) => axiosServices.put(IMAGE_API.update(id!), { status: 0 })));
        }

        // Handle material images
        const materialImagesToUpload = materialImages.filter((img) => img.status === 1 && img.file instanceof File);
        const materialImagesToDelete = materialImages.filter((img) => img.status === 0 && img.id).map((img) => img.id);
        const materialImageUrls: string[] = [];

        if (materialImagesToUpload.length > 0) {
          for (const img of materialImagesToUpload) {
            const formData = new FormData();
            formData.append('File', img.file);
            formData.append('referId', String(report.id));
            formData.append('referType', 'QUALITY-REPORT-MATERIAL');
            const imageRes = await axiosServices.post(IMAGE_API.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newImageUrl = imageRes.data?.imagePath;
            if (newImageUrl) materialImageUrls.push(newImageUrl);
          }
        }

        if (materialImagesToDelete.length > 0) {
          await Promise.all(materialImagesToDelete.map((id) => axiosServices.put(IMAGE_API.update(id!), { status: 0 })));
        }

        // Update local image states
        setPelletQualityImages((prev) => [
          ...prev.filter((p) => p.status === 1 && typeof p.file === 'string'),
          ...pelletImageUrls.map((url) => ({ file: url, status: 1 }))
        ]);
        setMaterialImages((prev) => [
          ...prev.filter((p) => p.status === 1 && typeof p.file === 'string'),
          ...materialImageUrls.map((url) => ({ file: url, status: 1 }))
        ]);

        const updatedReport = {
          id: report.id,
          goodId: values.goodId,
          supplierId: values.supplierId,
          productName: goodOptions.find((g) => g.id === values.goodId)?.name || values.material || '',
          supplierName: supplierOptions.find((s) => s.id === values.supplierId)?.name || report.supplierName || '',
          batchNumber: values.lotCode,
          testDate: values.checkDate,
          content: values.description,
          material: values.material,
          qualityRate: values.qualityRate,
          tonVien: values.tonVien,
          pelletImageUrls,
          materialImageUrls
        };

        openSnackbar({
          open: true,
          message: 'Cập nhật báo cáo thành công',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        // Cập nhật cục bộ, không refetch danh sách
        onUpdate(updatedReport);

        handleClose();
      } catch (err: any) {
        openSnackbar({
          open: true,
          message: `Lỗi khi cập nhật báo cáo: ${err.response?.data?.message || err.message || 'Không xác định'}`,
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      }
    }
  });

  useEffect(() => {
    if (!isLoading && open) {
      formik.setValues({
        goodId: report.goodId || null,
        supplierId: report.supplierId || null,
        lotCode: report.batchNumber || '',
        checkDate: report.testDate ? dayjs(report.testDate).toDate() : null,
        description: report.content || '',
        material: report.material || '',
        qualityRate: report.qualityRate || '',
        tonVien: report.tonVien || 0,
        reportId: report.reportId || ''
      });
    }
  }, [isLoading, open, report]);

  const handleClose = () => {
    formik.resetForm();
    setPelletQualityImages([]);
    setMaterialImages([]);
    onClose();
  };

  useEffect(() => {
    if (open && initialField) {
      const fieldToFocus = document.querySelector(`input[name="${initialField}"]`) as HTMLInputElement | null;
      if (fieldToFocus) fieldToFocus.focus();
    }
  }, [open, initialField]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} variant="h5">
        Chỉnh sửa báo cáo chất lượng
        <IconButton onClick={handleClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
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
                    <InputLabel htmlFor="checkDate">Ngày kiểm tra <span style={{ color: 'red' }}>(*)</span></InputLabel>
                    <DatePicker
                      value={formik.values.checkDate ? dayjs(formik.values.checkDate) : null}
                      onChange={(date) => formik.setFieldValue('checkDate', date ? date : null)}
                      slotProps={{
                        textField: {
                          error: formik.touched.checkDate && Boolean(formik.errors.checkDate),
                          helperText: formik.touched.checkDate && (formik.errors.checkDate as string)
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="goodId">Tên sản phẩm <span style={{ color: 'red' }}>(*)</span></InputLabel>
                    <Autocomplete
                      id="goodId"
                      options={goodOptions}
                      getOptionLabel={(option) => option.name}
                      value={goodOptions.find((p) => p.id === formik.values.goodId) || null}
                      onChange={(_, newValue) => formik.setFieldValue('goodId', newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn hoặc nhập tên sản phẩm"
                          error={formik.touched.goodId && Boolean(formik.errors.goodId)}
                          helperText={
                            (formik.touched.goodId && (formik.errors.goodId as string)) ||
                            (report.productName && !formik.values.goodId ? 'Sản phẩm không có trong danh sách' : '')
                          }
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="lotCode">Mã đơn hàng <span style={{ color: 'red' }}>(*)</span></InputLabel>
                    <TextField
                      id="lotCode"
                      name="lotCode"
                      placeholder="Nhập mã đơn hàng"
                      fullWidth
                      value={formik.values.lotCode}
                      disabled
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lotCode && Boolean(formik.errors.lotCode)}
                      helperText={formik.touched.lotCode && (formik.errors.lotCode as string)}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="reportId">Mã báo cáo </InputLabel>
                    <TextField id="reportId" name="reportId" placeholder="" fullWidth value={formik.values.reportId} disabled />
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
                    <InputLabel htmlFor="supplierId">Xưởng <span style={{ color: 'red' }}>(*)</span></InputLabel>
                    <Autocomplete
                      id="supplierId"
                      options={supplierOptions}
                      getOptionLabel={(option) => option.name}
                      value={supplierOptions.find((s) => s.id === formik.values.supplierId) || (report.supplierName ? { id: 0, name: report.supplierName } : null)}
                      onChange={(_, newValue) => formik.setFieldValue('supplierId', newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn hoặc nhập xưởng"
                          error={formik.touched.supplierId && Boolean(formik.errors.supplierId)}
                          helperText={
                            (formik.touched.supplierId && (formik.errors.supplierId as string)) ||
                            (report.supplierName && !formik.values.supplierId ? 'Nhà cung cấp không có trong danh sách' : '')
                          }
                        />
                      )}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="tonVien">Tồn viên (tấn) <span style={{ color: 'red' }}>(*)</span></InputLabel>
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
                    <InputLabel htmlFor="description">Mô tả nội dung báo cáo <span style={{ color: 'red' }}>(*)</span></InputLabel>
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
                        <InputLabel htmlFor="qualityRate">Chất lượng viên <span style={{ color: 'red' }}>(*)</span></InputLabel>
                        <Autocomplete
                          id="qualityRate"
                          options={qualityRateOptions}
                          getOptionLabel={(option) => option.description}
                          value={qualityRateOptions.find((q) => q.description === formik.values.qualityRate) || null}
                          onChange={(_, newValue) => formik.setFieldValue('qualityRate', newValue ? newValue.description : '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Chọn chất lượng viên"
                              error={formik.touched.qualityRate && Boolean(formik.errors.qualityRate)}
                              helperText={formik.touched.qualityRate && (formik.errors.qualityRate as string)}
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InputLabel sx={{ mb: 1 }}>Hình ảnh chất lượng viên</InputLabel>
                      <SimpleDropzone files={pelletQualityImages} setFiles={setPelletQualityImages} label="chất lượng viên" />
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel>Nguyên liệu <span style={{ color: 'red' }}>(*)</span></InputLabel>
                        <Autocomplete
                          id="material"
                          options={goodOptions}
                          getOptionLabel={(option) => option.description}
                          value={
                            goodOptions.find((m) => m.description === formik.values.material) ||
                            (report.material ? { id: 0, name: report.material, description: report.material } : null)
                          }
                          onChange={(_, newValue) => formik.setFieldValue('material', newValue ? newValue.description : '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Chọn nguyên liệu"
                              error={formik.touched.material && Boolean(formik.errors.material)}
                              helperText={
                                (formik.touched.material && (formik.errors.material as string)) ||
                                (report.material && !goodOptions.find((m) => m.description === formik.values.material)
                                  ? 'Nguyên liệu không có trong danh sách'
                                  : '')
                              }
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InputLabel sx={{ mb: 1 }}>Hình ảnh nguyên liệu</InputLabel>
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
        <Button onClick={formik.submitForm} variant="contained" disabled={formik.isSubmitting || isLoading}>
          Cập nhật báo cáo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditReportForm;