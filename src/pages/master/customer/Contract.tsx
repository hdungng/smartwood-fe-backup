import { useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  Alert,
  IconButton
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

// assets
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import { dateHelper } from '../../../utils';
import { APP_DEFAULT_PATH } from 'config';
import { useParams, useLocation } from 'react-router-dom';

// types
interface CompanyCode {
  id: string;
  name: string;
  code: string;
}

// Mock data
const companyCodes: CompanyCode[] = [
  { id: '1', name: 'Công ty TNHH ABC', code: 'ABC001' },
  { id: '2', name: 'Công ty TNHH XYZ', code: 'XYZ002' },
  { id: '3', name: 'Công ty CP DEF', code: 'DEF003' }
];

// ==============================|| CUSTOMER CONTRACT PAGE ||============================== //

export default function CustomerContract() {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');
  const pageTitle = isView ? 'Chi tiết hợp đồng nguyên tắc' : isEdit ? 'Chỉnh sửa hợp đồng nguyên tắc' : 'Tạo hợp đồng nguyên tắc';

  const handleCompanyChange = (event: SelectChangeEvent) => {
    setSelectedCompany(event.target.value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);

      // Create URL for the uploaded file
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    } else {
      alert('Vui lòng chọn file PDF');
    }
  };

  const handleRemoveUploadedFile = () => {
    if (pdfUrl && uploadedFile) {
      URL.revokeObjectURL(pdfUrl);
    }
    setUploadedFile(null);
    setPdfUrl('');
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return { days: 0, months: 0 };

    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    const monthsDiff = Math.floor(daysDiff / 30);
    const remainingDays = daysDiff % 30;

    return { days: daysDiff, months: monthsDiff, remainingDays };
  };

  const handleCreateContract = () => {
    if (!selectedCompany || !startDate || !endDate || !uploadedFile) {
      alert('Vui lòng chọn đầy đủ thông tin và tải lên file hợp đồng');
      return;
    }

    const company = companyCodes.find((c) => c.id === selectedCompany);
    const duration = calculateDuration();

    console.log('Tạo hợp đồng:', {
      company,
      startDate: startDate.toLocaleDateString('vi-VN'),
      endDate: endDate.toLocaleDateString('vi-VN'),
      duration: `${duration.days} ngày`,
      file: { name: uploadedFile.name, size: uploadedFile.size }
    });

    alert('Hợp đồng đã được tạo thành công!');
  };

  // Cleanup URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl && uploadedFile) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl, uploadedFile]);

  const duration = calculateDuration();

// const  
const breadcrumbLinks = [
    { title: 'Trang chủ', to: APP_DEFAULT_PATH },
    { title: 'Quản lý khách hàng', to: '/master/customer-contract' },
    { title: 'Hợp đồng nguyên tắc' ,to: '/master/customer-contract'},
    { title: pageTitle }
  ];
  return (
    <>
        <Breadcrumbs custom heading={pageTitle} links={breadcrumbLinks} />
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <MainCard>
          <Grid container spacing={3}>
            {/* Form controls */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Stack spacing={3}>
                {/* Company Code Dropdown */}
                <FormControl fullWidth>
                  <InputLabel id="company-select-label">Mã Công Ty</InputLabel>
                  <Select
                    labelId="company-select-label"
                    id="company-select"
                    value={selectedCompany}
                    label="Mã Công Ty"
                    onChange={handleCompanyChange}
                  >
                    {companyCodes.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.code} - {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Contract Start Date */}
                {/*<DatePicker*/}
                {/*  label="Thời hạn từ"*/}
                {/*  value={startDate}*/}
                {/*  onChange={handleStartDateChange}*/}
                {/*  format="dd/MM/yyyy"*/}
                {/*  minDate={new Date()}*/}
                {/*  slotProps={{*/}
                {/*    textField: {*/}
                {/*      fullWidth: true,*/}
                {/*      variant: 'outlined'*/}
                {/*    }*/}
                {/*  }}*/}
                {/*/>*/}

                {/* Contract End Date */}
                {/*<DatePicker*/}
                {/*  label="Thời hạn đến"*/}
                {/*  value={endDate}*/}
                {/*  onChange={handleEndDateChange}*/}
                {/*  format="dd/MM/yyyy"*/}
                {/*  minDate={startDate || new Date()}*/}
                {/*  disabled={!startDate}*/}
                {/*  slotProps={{*/}
                {/*    textField: {*/}
                {/*      fullWidth: true,*/}
                {/*      variant: 'outlined'*/}
                {/*    }*/}
                {/*  }}*/}
                {/*/>*/}

                {/* Duration Display */}
                {startDate && endDate && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      Thời hạn hợp đồng: {duration.days} ngày
                      <br />({duration.months} tháng {duration.remainingDays} ngày)
                    </Typography>
                  </Alert>
                )}

                {/* File Upload */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tải lên file hợp đồng PDF:
                  </Typography>
                  {!uploadedFile ? (
                    <Button component="label" variant="outlined" startIcon={<UploadOutlined />} fullWidth size="large">
                      Tải lên file PDF
                      <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </Button>
                  ) : (
                    <Card variant="outlined">
                      <CardContent sx={{ py: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {uploadedFile.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                          <IconButton size="small" color="error" onClick={handleRemoveUploadedFile}>
                            <DeleteOutlined />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Box>

                {/* Create Button */}
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCreateContract}
                  disabled={!selectedCompany || !startDate || !endDate || !uploadedFile}
                >
                  Tạo Hợp Đồng
                </Button>
              </Stack>
            </Grid>

            {/* PDF Viewer */}
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Xem Trước Nội Dung Hợp Đồng
                  </Typography>

                  {pdfUrl ? (
                    <Box
                      sx={{
                        width: '100%',
                        height: '600px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} title="PDF Viewer" />
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ height: '600px', display: 'flex', alignItems: 'center' }}>
                      <Typography>Vui lòng tải lên file PDF để xem trước nội dung hợp đồng</Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
    </>
    
  );
}
