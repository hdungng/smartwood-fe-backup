// material-ui
import {
  PlusOutlined as AddIcon,
  DeleteOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  UnorderedListOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  FormHelperText
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

// third-party
import { useFormik } from 'formik';
import { Formik } from 'formik';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import * as yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import MultiFileUpload from 'components/third-party/dropzone/MultiFile';

// ==============================|| QUALITY CONTROL ||============================== //

// Define the form values interface
interface QualityControlFormValues {
  factory: string;
  material: string;
  materialStock: string;
  pelletQuality: string;
  pelletStock: string;
  note: string;
}

// Mock data for dropdowns
const mockData = {
  factories: [
    { value: 'factory1', label: 'Xưởng A - Hà Nội' },
    { value: 'factory2', label: 'Xưởng B - Đà Nẵng' },
    { value: 'factory3', label: 'Xưởng C - TP.HCM' },
    { value: 'factory4', label: 'Xưởng D - Cần Thơ' },
    { value: 'factory5', label: 'Xưởng E - Hải Phòng' }
  ],
  materials: [
    { value: 'material1', label: 'Mùn cưa thông' },
    { value: 'material2', label: 'Mùn cưa cao su' },
    { value: 'material3', label: 'Dăm gỗ thông' },
    { value: 'material4', label: 'Dăm gỗ keo' },
    { value: 'material5', label: 'Gỗ phế liệu' }
  ],
  qualityTypes: [
    { value: 'excellent', label: 'Xuất sắc (A+)' },
    { value: 'good', label: 'Tốt (A)' },
    { value: 'average', label: 'Trung bình (B)' },
    { value: 'poor', label: 'Kém (C)' },
    { value: 'failed', label: 'Không đạt (D)' }
  ]
};

// Add interface for quality record
interface QualityRecord {
  id: string;
  factory: string;
  material: string;
  materialStock: string;
  pelletQuality: string;
  pelletStock: string;
  note: string;
  createdAt: Date;
}

// Add mock data for quality records
const mockQualityRecords: QualityRecord[] = [
  {
    id: '1',
    factory: 'factory1',
    material: 'material1',
    materialStock: '500',
    pelletQuality: 'excellent',
    pelletStock: '300',
    note: 'Chất lượng rất tốt, độ ẩm đạt tiêu chuẩn',
    createdAt: new Date('2024-03-15')
  },
  {
    id: '2',
    factory: 'factory2',
    material: 'material2',
    materialStock: '750',
    pelletQuality: 'good',
    pelletStock: '450',
    note: 'Chất lượng tốt, cần kiểm tra độ cứng',
    createdAt: new Date('2024-03-14')
  },
  {
    id: '3',
    factory: 'factory3',
    material: 'material3',
    materialStock: '600',
    pelletQuality: 'average',
    pelletStock: '250',
    note: 'Chất lượng trung bình, cần cải thiện quy trình',
    createdAt: new Date('2024-03-13')
  }
];

const validationSchema = yup.object({
  factory: yup.string().required('Xưởng là bắt buộc'),
  material: yup.string().required('Nguyên liệu là bắt buộc'),
  materialStock: yup.string().required('Tồn nguyên liệu là bắt buộc'),
  pelletQuality: yup.string().required('Chất lượng viên là bắt buộc'),
  pelletStock: yup.string().required('Tồn viên là bắt buộc')
});

// Props interface
interface QualityControlFormProps {
  initialValues?: QualityControlFormValues;
}

export const QualityControl = forwardRef(({ initialValues }: QualityControlFormProps, ref) => {
  const [qualityRecords, setQualityRecords] = useState<QualityRecord[]>(mockQualityRecords);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [list, setList] = useState<boolean>(false);

  const formik = useFormik<QualityControlFormValues>({
    initialValues: {
      factory: '',
      material: '',
      materialStock: '',
      pelletQuality: '',
      pelletStock: '',
      note: ''
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    }
  });

  // Update form values when initialValues prop changes
  useEffect(() => {
    if (initialValues) {
      formik.setValues(initialValues);
    }
  }, [initialValues]);

  // Expose formik methods to parent component through ref
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      formik.handleSubmit();
      return formik.validateForm();
    },
    getValues: () => {
      return formik.values;
    },
    setValues: (values: QualityControlFormValues) => {
      formik.setValues(values);
    },
    isValid: () => {
      return formik.isValid;
    }
  }));

  const handleAddQualityRecord = () => {
    const newRecord: QualityRecord = {
      id: Date.now().toString(),
      factory: formik.values.factory,
      material: formik.values.material,
      materialStock: formik.values.materialStock,
      pelletQuality: formik.values.pelletQuality,
      pelletStock: formik.values.pelletStock,
      note: formik.values.note,
      createdAt: new Date()
    };

    setQualityRecords([...qualityRecords, newRecord]);

    // Reset form values
    formik.resetForm();
  };

  const handleEditQualityRecord = (record: QualityRecord) => {
    setEditingId(record.id);
    formik.setValues({
      factory: record.factory,
      material: record.material,
      materialStock: record.materialStock,
      pelletQuality: record.pelletQuality,
      pelletStock: record.pelletStock,
      note: record.note
    });
  };

  const handleDeleteQualityRecord = (id: string) => {
    setQualityRecords(qualityRecords.filter((record) => record.id !== id));
  };

  const handleUpdateQualityRecord = () => {
    if (!editingId) return;

    const updatedRecords = qualityRecords.map((record) => {
      if (record.id === editingId) {
        return {
          ...record,
          factory: formik.values.factory,
          material: formik.values.material,
          materialStock: formik.values.materialStock,
          pelletQuality: formik.values.pelletQuality,
          pelletStock: formik.values.pelletStock,
          note: formik.values.note
        };
      }
      return record;
    });

    setQualityRecords(updatedRecords);
    setEditingId(null);
    formik.resetForm();
  };

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Báo cáo chất lượng
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Thông tin chất lượng
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Xưởng *</InputLabel>
                <Autocomplete
                  id="factory"
                  freeSolo
                  options={mockData.factories}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={mockData.factories.find((f) => f.value === formik.values.factory) || formik.values.factory || null}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      formik.setFieldValue('factory', newValue);
                    } else if (newValue && typeof newValue === 'object') {
                      formik.setFieldValue('factory', newValue.value);
                    } else {
                      formik.setFieldValue('factory', '');
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    formik.setFieldValue('factory', newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn hoặc nhập xưởng"
                      error={formik.touched.factory && Boolean(formik.errors.factory)}
                      helperText={formik.touched.factory && formik.errors.factory}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string' && typeof value === 'string') {
                      return option === value;
                    }
                    if (typeof option === 'object' && typeof value === 'object') {
                      return option.value === value.value;
                    }
                    return false;
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Nguyên liệu *</InputLabel>
                <Autocomplete
                  id="material"
                  freeSolo
                  options={mockData.materials}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={mockData.materials.find((m) => m.value === formik.values.material) || formik.values.material || null}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      formik.setFieldValue('material', newValue);
                    } else if (newValue && typeof newValue === 'object') {
                      formik.setFieldValue('material', newValue.value);
                    } else {
                      formik.setFieldValue('material', '');
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    formik.setFieldValue('material', newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn hoặc nhập nguyên liệu"
                      error={formik.touched.material && Boolean(formik.errors.material)}
                      helperText={formik.touched.material && formik.errors.material}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string' && typeof value === 'string') {
                      return option === value;
                    }
                    if (typeof option === 'object' && typeof value === 'object') {
                      return option.value === value.value;
                    }
                    return false;
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Tồn nguyên liệu (tấn) *</InputLabel>
                <TextField
                  id="materialStock"
                  name="materialStock"
                  placeholder="Nhập số lượng tồn nguyên liệu"
                  fullWidth
                  type="number"
                  value={formik.values.materialStock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.materialStock && Boolean(formik.errors.materialStock)}
                  helperText={formik.touched.materialStock && formik.errors.materialStock}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Chất lượng viên *</InputLabel>
                <Autocomplete
                  id="pelletQuality"
                  freeSolo
                  options={mockData.qualityTypes}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={mockData.qualityTypes.find((q) => q.value === formik.values.pelletQuality) || formik.values.pelletQuality || null}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      formik.setFieldValue('pelletQuality', newValue);
                    } else if (newValue && typeof newValue === 'object') {
                      formik.setFieldValue('pelletQuality', newValue.value);
                    } else {
                      formik.setFieldValue('pelletQuality', '');
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    formik.setFieldValue('pelletQuality', newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn hoặc nhập chất lượng viên"
                      error={formik.touched.pelletQuality && Boolean(formik.errors.pelletQuality)}
                      helperText={formik.touched.pelletQuality && formik.errors.pelletQuality}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string' && typeof value === 'string') {
                      return option === value;
                    }
                    if (typeof option === 'object' && typeof value === 'object') {
                      return option.value === value.value;
                    }
                    return false;
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Tồn viên (tấn) *</InputLabel>
                <TextField
                  id="pelletStock"
                  name="pelletStock"
                  placeholder="Nhập số lượng tồn viên"
                  fullWidth
                  type="number"
                  value={formik.values.pelletStock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pelletStock && Boolean(formik.errors.pelletStock)}
                  helperText={formik.touched.pelletStock && formik.errors.pelletStock}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Ghi chú</InputLabel>
                <TextField
                  id="note"
                  name="note"
                  placeholder="Nhập ghi chú về chất lượng"
                  multiline
                  rows={3}
                  fullWidth
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.note && Boolean(formik.errors.note)}
                  helperText={formik.touched.note && formik.errors.note}
                />
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, mb: 3 }}>
            <MainCard
              title="Upload Multiple File"
              secondary={
                <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
                  <IconButton color={list ? 'secondary' : 'primary'} size="small" onClick={() => setList(false)}>
                    <UnorderedListOutlined style={{ fontSize: '1.15rem' }} />
                  </IconButton>
                  <IconButton color={list ? 'primary' : 'secondary'} size="small" onClick={() => setList(true)}>
                    <AppstoreOutlined style={{ fontSize: '1.15rem' }} />
                  </IconButton>
                </Stack>
              }
            >
              <Formik
                initialValues={{ files: null }}
                onSubmit={() => {
                  // submit form
                }}
                validationSchema={yup.object().shape({
                  files: yup.mixed().required('Avatar is a required.')
                })}
              >
                {({ values, handleSubmit, setFieldValue, touched, errors }: any) => (
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid size={12}>
                        <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
                          <MultiFileUpload
                            showList={list}
                            setFieldValue={setFieldValue}
                            files={values.files}
                            error={touched.files && !!errors.files}
                          />
                        </Stack>
                        {touched.files && errors.files && (
                          <FormHelperText error id="standard-weight-helper-text-password-login">
                            {errors.files as string}
                          </FormHelperText>
                        )}
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            </MainCard>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={editingId ? handleUpdateQualityRecord : handleAddQualityRecord}>
              {editingId ? 'Cập nhật' : 'Thêm báo cáo'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Danh sách báo cáo chất lượng
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Xưởng</TableCell>
                  <TableCell>Nguyên liệu</TableCell>
                  <TableCell>Tồn nguyên liệu (tấn)</TableCell>
                  <TableCell>Chất lượng viên</TableCell>
                  <TableCell>Tồn viên (tấn)</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualityRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{mockData.factories.find((f) => f.value === record.factory)?.label}</TableCell>
                    <TableCell>{mockData.materials.find((m) => m.value === record.material)?.label}</TableCell>
                    <TableCell>{record.materialStock}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          padding: '4px 8px',
                          borderRadius: 1,
                          backgroundColor:
                            record.pelletQuality === 'excellent'
                              ? '#e8f5e8'
                              : record.pelletQuality === 'good'
                                ? '#e3f2fd'
                                : record.pelletQuality === 'average'
                                  ? '#fff3e0'
                                  : record.pelletQuality === 'poor'
                                    ? '#fce4ec'
                                    : '#ffebee',
                          color:
                            record.pelletQuality === 'excellent'
                              ? '#2e7d32'
                              : record.pelletQuality === 'good'
                                ? '#1976d2'
                                : record.pelletQuality === 'average'
                                  ? '#f57c00'
                                  : record.pelletQuality === 'poor'
                                    ? '#c2185b'
                                    : '#d32f2f',
                          fontWeight: 'medium',
                          display: 'inline-block'
                        }}
                      >
                        {mockData.qualityTypes.find((q) => q.value === record.pelletQuality)?.label}
                      </Box>
                    </TableCell>
                    <TableCell>{record.pelletStock}</TableCell>
                    <TableCell>{record.createdAt.toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{record.note}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton color="primary" size="small" onClick={() => handleEditQualityRecord(record)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton color="error" size="small" onClick={() => handleDeleteQualityRecord(record.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </form>
    </Box>
  );
});

export default QualityControl;
