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
  FormHelperText,
  Chip
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// third-party
import { useFormik } from 'formik';
import { Formik } from 'formik';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import * as yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import MultiFileUpload from 'components/third-party/dropzone/MultiFile';

// ==============================|| EXPORT CONTROL ||============================== //

// Define the form values interface
interface ExportControlFormValues {
  factory: string;
  material: string;
  materialStock: string;
  pelletQuality: string;
  pelletStock: string;
  containerNumber: string; // Số công
  sealNumber: string; // Số chì
  truckNumber: string; // Số xe
  exportDate: Date | null;
  customerName: string;
  destination: string;
  exportQuantity: string;
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
  ],
  customers: [
    { value: 'customer1', label: 'Công ty TNHH ABC' },
    { value: 'customer2', label: 'Tập đoàn XYZ' },
    { value: 'customer3', label: 'Công ty Cổ phần DEF' },
    { value: 'customer4', label: 'DN Tư nhân GHI' },
    { value: 'customer5', label: 'Công ty TNHH JKL' }
  ],
  destinations: [
    { value: 'dest1', label: 'Cảng Hải Phòng' },
    { value: 'dest2', label: 'Cảng Đà Nẵng' },
    { value: 'dest3', label: 'Cảng Sài Gòn' },
    { value: 'dest4', label: 'Cảng Cái Mép' },
    { value: 'dest5', label: 'Cảng Vũng Tàu' }
  ]
};

// Add interface for export record
interface ExportRecord {
  id: string;
  factory: string;
  material: string;
  materialStock: string;
  pelletQuality: string;
  pelletStock: string;
  containerNumber: string;
  sealNumber: string;
  truckNumber: string;
  exportDate: Date | null;
  customerName: string;
  destination: string;
  exportQuantity: string;
  note: string;
  images: any[];
  createdAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// Add mock data for export records
const mockExportRecords: ExportRecord[] = [
  {
    id: '1',
    factory: 'factory1',
    material: 'material1',
    materialStock: '500',
    pelletQuality: 'excellent',
    pelletStock: '300',
    containerNumber: 'TCLU1234567',
    sealNumber: 'SL001234',
    truckNumber: '29C-12345',
    exportDate: new Date('2024-03-15T08:30:00'),
    customerName: 'customer1',
    destination: 'dest1',
    exportQuantity: '25',
    note: 'Xuất hàng đúng lịch, chất lượng tốt',
    images: [],
    createdAt: new Date('2024-03-15'),
    status: 'completed'
  },
  {
    id: '2',
    factory: 'factory2',
    material: 'material2',
    materialStock: '750',
    pelletQuality: 'good',
    pelletStock: '450',
    containerNumber: 'MSKU9876543',
    sealNumber: 'SL005678',
    truckNumber: '30A-67890',
    exportDate: new Date('2024-03-16T10:00:00'),
    customerName: 'customer2',
    destination: 'dest2',
    exportQuantity: '20',
    note: 'Kiểm tra kỹ trước khi xuất',
    images: [],
    createdAt: new Date('2024-03-14'),
    status: 'in_progress'
  }
];

const validationSchema = yup.object({
  factory: yup.string().required('Xưởng là bắt buộc'),
  material: yup.string().required('Nguyên liệu là bắt buộc'),
  materialStock: yup.string().required('Tồn nguyên liệu là bắt buộc'),
  pelletQuality: yup.string().required('Chất lượng viên là bắt buộc'),
  pelletStock: yup.string().required('Tồn viên là bắt buộc'),
  containerNumber: yup.string().required('Số công là bắt buộc'),
  sealNumber: yup.string().required('Số chì là bắt buộc'),
  truckNumber: yup.string().required('Số xe là bắt buộc'),
  exportDate: yup.date().required('Ngày xuất hàng là bắt buộc'),
  customerName: yup.string().required('Tên khách hàng là bắt buộc'),
  destination: yup.string().required('Điểm đến là bắt buộc'),
  exportQuantity: yup.string().required('Số lượng xuất là bắt buộc')
});

// Props interface
interface ExportControlFormProps {
  initialValues?: ExportControlFormValues;
}

export const ExportControl = forwardRef(({ initialValues }: ExportControlFormProps, ref) => {
  const [exportRecords, setExportRecords] = useState<ExportRecord[]>(mockExportRecords);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [list, setList] = useState<boolean>(false);

  const formik = useFormik<ExportControlFormValues>({
    initialValues: {
      factory: '',
      material: '',
      materialStock: '',
      pelletQuality: '',
      pelletStock: '',
      containerNumber: '',
      sealNumber: '',
      truckNumber: '',
      exportDate: new Date(),
      customerName: '',
      destination: '',
      exportQuantity: '',
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
    setValues: (values: ExportControlFormValues) => {
      formik.setValues(values);
    },
    isValid: () => {
      return formik.isValid;
    }
  }));

  const handleAddExportRecord = () => {
    const newRecord: ExportRecord = {
      id: Date.now().toString(),
      factory: formik.values.factory,
      material: formik.values.material,
      materialStock: formik.values.materialStock,
      pelletQuality: formik.values.pelletQuality,
      pelletStock: formik.values.pelletStock,
      containerNumber: formik.values.containerNumber,
      sealNumber: formik.values.sealNumber,
      truckNumber: formik.values.truckNumber,
      exportDate: formik.values.exportDate,
      customerName: formik.values.customerName,
      destination: formik.values.destination,
      exportQuantity: formik.values.exportQuantity,
      note: formik.values.note,
      images: [],
      createdAt: new Date(),
      status: 'pending'
    };

    setExportRecords([...exportRecords, newRecord]);

    // Reset form values
    formik.resetForm();
  };

  const handleEditExportRecord = (record: ExportRecord) => {
    setEditingId(record.id);
    formik.setValues({
      factory: record.factory,
      material: record.material,
      materialStock: record.materialStock,
      pelletQuality: record.pelletQuality,
      pelletStock: record.pelletStock,
      containerNumber: record.containerNumber,
      sealNumber: record.sealNumber,
      truckNumber: record.truckNumber,
      exportDate: record.exportDate,
      customerName: record.customerName,
      destination: record.destination,
      exportQuantity: record.exportQuantity,
      note: record.note
    });
  };

  const handleDeleteExportRecord = (id: string) => {
    setExportRecords(exportRecords.filter((record) => record.id !== id));
  };

  const handleUpdateExportRecord = () => {
    if (!editingId) return;

    const updatedRecords = exportRecords.map((record) => {
      if (record.id === editingId) {
        return {
          ...record,
          factory: formik.values.factory,
          material: formik.values.material,
          materialStock: formik.values.materialStock,
          pelletQuality: formik.values.pelletQuality,
          pelletStock: formik.values.pelletStock,
          containerNumber: formik.values.containerNumber,
          sealNumber: formik.values.sealNumber,
          truckNumber: formik.values.truckNumber,
          exportDate: formik.values.exportDate,
          customerName: formik.values.customerName,
          destination: formik.values.destination,
          exportQuantity: formik.values.exportQuantity,
          note: formik.values.note
        };
      }
      return record;
    });

    setExportRecords(updatedRecords);
    setEditingId(null);
    formik.resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang xuất';
      case 'pending':
        return 'Chờ xuất';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Kiểm soát số lượng xuất hàng
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Thông tin xuất hàng
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

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Số công (Container) *</InputLabel>
                <TextField
                  id="containerNumber"
                  name="containerNumber"
                  placeholder="Nhập số công container"
                  fullWidth
                  value={formik.values.containerNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.containerNumber && Boolean(formik.errors.containerNumber)}
                  helperText={formik.touched.containerNumber && formik.errors.containerNumber}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Số chì (Seal) *</InputLabel>
                <TextField
                  id="sealNumber"
                  name="sealNumber"
                  placeholder="Nhập số chì"
                  fullWidth
                  value={formik.values.sealNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.sealNumber && Boolean(formik.errors.sealNumber)}
                  helperText={formik.touched.sealNumber && formik.errors.sealNumber}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Số xe *</InputLabel>
                <TextField
                  id="truckNumber"
                  name="truckNumber"
                  placeholder="Nhập biển số xe"
                  fullWidth
                  value={formik.values.truckNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.truckNumber && Boolean(formik.errors.truckNumber)}
                  helperText={formik.touched.truckNumber && formik.errors.truckNumber}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              {/*<Stack sx={{ gap: 1 }}>*/}
              {/*  <InputLabel>Ngày xuất hàng *</InputLabel>*/}
              {/*  <DateTimePicker*/}
              {/*    value={formik.values.exportDate}*/}
              {/*    format="dd/MM/yyyy HH:mm"*/}
              {/*    onChange={(newValue) => {*/}
              {/*      formik.setFieldValue('exportDate', newValue);*/}
              {/*    }}*/}
              {/*    onAccept={(newValue) => {*/}
              {/*      formik.setFieldValue('exportDate', newValue);*/}
              {/*      formik.setFieldTouched('exportDate', true);*/}
              {/*    }}*/}
              {/*    slotProps={{*/}
              {/*      textField: {*/}
              {/*        id: 'exportDate',*/}
              {/*        name: 'exportDate',*/}
              {/*        size: 'small',*/}
              {/*        fullWidth: true,*/}
              {/*        error: formik.touched.exportDate && Boolean(formik.errors.exportDate),*/}
              {/*        helperText: formik.touched.exportDate && formik.errors.exportDate ? String(formik.errors.exportDate) : undefined,*/}
              {/*        placeholder: 'Chọn ngày giờ xuất hàng'*/}
              {/*      }*/}
              {/*    }}*/}
              {/*  />*/}
              {/*</Stack>*/}
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Khách hàng *</InputLabel>
                <Autocomplete
                  id="customerName"
                  freeSolo
                  options={mockData.customers}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={mockData.customers.find((c) => c.value === formik.values.customerName) || formik.values.customerName || null}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      formik.setFieldValue('customerName', newValue);
                    } else if (newValue && typeof newValue === 'object') {
                      formik.setFieldValue('customerName', newValue.value);
                    } else {
                      formik.setFieldValue('customerName', '');
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    formik.setFieldValue('customerName', newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn hoặc nhập khách hàng"
                      error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                      helperText={formik.touched.customerName && formik.errors.customerName}
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
                <InputLabel>Điểm đến *</InputLabel>
                <Autocomplete
                  id="destination"
                  freeSolo
                  options={mockData.destinations}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={mockData.destinations.find((d) => d.value === formik.values.destination) || formik.values.destination || null}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      formik.setFieldValue('destination', newValue);
                    } else if (newValue && typeof newValue === 'object') {
                      formik.setFieldValue('destination', newValue.value);
                    } else {
                      formik.setFieldValue('destination', '');
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    formik.setFieldValue('destination', newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn hoặc nhập điểm đến"
                      error={formik.touched.destination && Boolean(formik.errors.destination)}
                      helperText={formik.touched.destination && formik.errors.destination}
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
                <InputLabel>Số lượng xuất (tấn) *</InputLabel>
                <TextField
                  id="exportQuantity"
                  name="exportQuantity"
                  placeholder="Nhập số lượng xuất"
                  fullWidth
                  type="number"
                  value={formik.values.exportQuantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.exportQuantity && Boolean(formik.errors.exportQuantity)}
                  helperText={formik.touched.exportQuantity && formik.errors.exportQuantity}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Ghi chú</InputLabel>
                <TextField
                  id="note"
                  name="note"
                  placeholder="Nhập ghi chú về xuất hàng"
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
              title="Hình ảnh xuất hàng"
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
                  files: yup.mixed().nullable()
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={editingId ? handleUpdateExportRecord : handleAddExportRecord}>
              {editingId ? 'Cập nhật' : 'Thêm xuất hàng'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Danh sách xuất hàng
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Xưởng</TableCell>
                  <TableCell>Nguyên liệu</TableCell>
                  <TableCell>Số công</TableCell>
                  <TableCell>Số chì</TableCell>
                  <TableCell>Số xe</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Điểm đến</TableCell>
                  <TableCell>SL xuất (tấn)</TableCell>
                  <TableCell>Ngày xuất</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exportRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{mockData.factories.find((f) => f.value === record.factory)?.label}</TableCell>
                    <TableCell>{mockData.materials.find((m) => m.value === record.material)?.label}</TableCell>
                    <TableCell>{record.containerNumber}</TableCell>
                    <TableCell>{record.sealNumber}</TableCell>
                    <TableCell>{record.truckNumber}</TableCell>
                    <TableCell>{mockData.customers.find((c) => c.value === record.customerName)?.label}</TableCell>
                    <TableCell>{mockData.destinations.find((d) => d.value === record.destination)?.label}</TableCell>
                    <TableCell>{record.exportQuantity}</TableCell>
                    <TableCell>
                      {record.exportDate?.toLocaleDateString('vi-VN')}{' '}
                      {record.exportDate?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(record.status)}
                        color={getStatusColor(record.status) as any}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{record.note}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton color="primary" size="small" onClick={() => handleEditExportRecord(record)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton color="error" size="small" onClick={() => handleDeleteExportRecord(record.id)}>
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

export default ExportControl;
