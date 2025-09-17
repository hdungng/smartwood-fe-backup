// material-ui
import { SearchOutlined, EyeOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
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
  Chip,
  Card,
  CardContent,
  Collapse,
  ImageList,
  ImageListItem
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

// third-party
import { useState, useMemo } from 'react';

// ==============================|| INQUIRY CONTROL ||============================== //

// Mock data for search options and records
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
  ],
  statuses: [
    { value: 'pending', label: 'Chờ xuất' },
    { value: 'in_progress', label: 'Đang xuất' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ]
};

// Interface for image file
interface ImageFile {
  id: string;
  name: string;
  url: string;
  type: 'quality' | 'export';
  uploadedAt: Date;
}

// Interface for inquiry record (combining both quality and export data)
interface InquiryRecord {
  id: string;
  orderCode: string;
  bookingCode: string;
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
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  qualityReportDate: Date | null;
  exportReportDate: Date | null;
  createdAt: Date;
  images: ImageFile[];
}

// Mock images data
const mockImages: ImageFile[] = [
  {
    id: 'img1',
    name: 'quality_check_1.jpg',
    url: 'https://picsum.photos/300/200?random=1',
    type: 'quality',
    uploadedAt: new Date('2024-03-14T14:00:00')
  },
  {
    id: 'img2',
    name: 'quality_check_2.jpg',
    url: 'https://picsum.photos/300/200?random=2',
    type: 'quality',
    uploadedAt: new Date('2024-03-14T14:15:00')
  },
  {
    id: 'img3',
    name: 'export_loading_1.jpg',
    url: 'https://picsum.photos/300/200?random=3',
    type: 'export',
    uploadedAt: new Date('2024-03-15T08:30:00')
  },
  {
    id: 'img4',
    name: 'export_loading_2.jpg',
    url: 'https://picsum.photos/300/200?random=4',
    type: 'export',
    uploadedAt: new Date('2024-03-15T08:45:00')
  }
];

// Mock inquiry records (simulating data from both quality control and export control)
const mockInquiryRecords: InquiryRecord[] = [
  {
    id: '1',
    orderCode: 'ORD2024001',
    bookingCode: 'BK2024001',
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
    status: 'completed',
    qualityReportDate: new Date('2024-03-14T14:00:00'),
    exportReportDate: new Date('2024-03-15T08:30:00'),
    createdAt: new Date('2024-03-15'),
    images: mockImages
  },
  {
    id: '2',
    orderCode: 'ORD2024002',
    bookingCode: 'BK2024002',
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
    status: 'in_progress',
    qualityReportDate: new Date('2024-03-15T09:00:00'),
    exportReportDate: new Date('2024-03-16T10:00:00'),
    createdAt: new Date('2024-03-14'),
    images: mockImages.slice(0, 2) // Only quality images
  },
  {
    id: '3',
    orderCode: 'ORD2024003',
    bookingCode: 'BK2024003',
    factory: 'factory3',
    material: 'material3',
    materialStock: '600',
    pelletQuality: 'average',
    pelletStock: '250',
    containerNumber: 'COSU5555555',
    sealNumber: 'SL009999',
    truckNumber: '51G-99999',
    exportDate: new Date('2024-03-17T14:30:00'),
    customerName: 'customer3',
    destination: 'dest3',
    exportQuantity: '18',
    note: 'Cần kiểm tra thêm về chất lượng',
    status: 'pending',
    qualityReportDate: new Date('2024-03-16T11:30:00'),
    exportReportDate: null,
    createdAt: new Date('2024-03-16'),
    images: mockImages.slice(0, 1) // Only one quality image
  },
  {
    id: '4',
    orderCode: 'ORD2024004',
    bookingCode: 'BK2024004',
    factory: 'factory1',
    material: 'material4',
    materialStock: '450',
    pelletQuality: 'good',
    pelletStock: '280',
    containerNumber: 'EMCU7777777',
    sealNumber: 'SL007777',
    truckNumber: '29A-77777',
    exportDate: new Date('2024-03-18T09:15:00'),
    customerName: 'customer4',
    destination: 'dest4',
    exportQuantity: '22',
    note: 'Đặc biệt chú ý đóng gói',
    status: 'completed',
    qualityReportDate: new Date('2024-03-17T13:45:00'),
    exportReportDate: new Date('2024-03-18T09:15:00'),
    createdAt: new Date('2024-03-17'),
    images: []
  }
];

// Generate search options from mock data
const searchOptions = mockInquiryRecords.map((record) => ({
  value: record.id,
  label: `${record.orderCode} - ${record.bookingCode}`,
  orderCode: record.orderCode,
  bookingCode: record.bookingCode
}));

interface SearchFilters {
  searchValue: string;
  factory: string;
  status: string;
  fromDate: Date | null;
  toDate: Date | null;
}

export default function InquiryControl() {
  const [filters, setFilters] = useState<SearchFilters>({
    searchValue: '',
    factory: '',
    status: '',
    fromDate: null,
    toDate: null
  });

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filter records based on search criteria
  const filteredRecords = useMemo(() => {
    return mockInquiryRecords.filter((record) => {
      // Search by order code or booking code
      if (filters.searchValue) {
        const searchLower = filters.searchValue.toLowerCase();
        const matchesOrderCode = record.orderCode.toLowerCase().includes(searchLower);
        const matchesBookingCode = record.bookingCode.toLowerCase().includes(searchLower);
        if (!matchesOrderCode && !matchesBookingCode) return false;
      }

      // Filter by factory
      if (filters.factory && record.factory !== filters.factory) return false;

      // Filter by status
      if (filters.status && record.status !== filters.status) return false;

      // Filter by date range
      if (filters.fromDate && record.exportDate && record.exportDate < filters.fromDate) return false;
      if (filters.toDate && record.exportDate && record.exportDate > filters.toDate) return false;

      return true;
    });
  }, [filters]);

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
    return mockData.statuses.find((s) => s.value === status)?.label || status;
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchValue: value }));
  };

  const handleRowClick = (recordId: string) => {
    setExpandedRow(expandedRow === recordId ? null : recordId);
  };

  const getQualityStatusBadge = (record: InquiryRecord) => {
    if (record.qualityReportDate && record.exportReportDate) {
      return <Chip label="QC Hoàn tất" color="success" size="small" variant="filled" />;
    } else if (record.qualityReportDate) {
      return <Chip label="QC Chờ xuất" color="warning" size="small" variant="filled" />;
    } else {
      return <Chip label="Chưa QC" color="error" size="small" variant="filled" />;
    }
  };

  const renderImageGallery = (images: ImageFile[]) => {
    if (images.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có hình ảnh
          </Typography>
        </Box>
      );
    }

    const qualityImages = images.filter((img) => img.type === 'quality');
    const exportImages = images.filter((img) => img.type === 'export');

    return (
      <Box>
        {qualityImages.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Hình ảnh kiểm tra chất lượng ({qualityImages.length})
            </Typography>
            <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={150}>
              {qualityImages.map((image) => (
                <ImageListItem key={image.id}>
                  <img
                    src={image.url}
                    alt={image.name}
                    loading="lazy"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 4,
                      objectFit: 'cover'
                    }}
                    onClick={() => window.open(image.url, '_blank')}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}

        {exportImages.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Hình ảnh xuất hàng ({exportImages.length})
            </Typography>
            <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={150}>
              {exportImages.map((image) => (
                <ImageListItem key={image.id}>
                  <img
                    src={image.url}
                    alt={image.name}
                    loading="lazy"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 4,
                      objectFit: 'cover'
                    }}
                    onClick={() => window.open(image.url, '_blank')}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Tra cứu hàng hóa
      </Typography>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Tìm kiếm và lọc
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Tìm kiếm</InputLabel>
              <TextField
                placeholder="Nhập mã đơn hàng hoặc code booking"
                fullWidth
                value={filters.searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: <SearchOutlined style={{ marginRight: 8, color: '#999' }} />
                }}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Xưởng</InputLabel>
              <Autocomplete
                options={mockData.factories}
                getOptionLabel={(option) => option.label}
                value={mockData.factories.find((f) => f.value === filters.factory) || null}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, factory: newValue ? newValue.value : '' }));
                }}
                renderInput={(params) => <TextField {...params} placeholder="Chọn xưởng" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Autocomplete
                options={mockData.statuses}
                getOptionLabel={(option) => option.label}
                value={mockData.statuses.find((s) => s.value === filters.status) || null}
                onChange={(_, newValue) => {
                  setFilters((prev) => ({ ...prev, status: newValue ? newValue.value : '' }));
                }}
                renderInput={(params) => <TextField {...params} placeholder="Chọn trạng thái" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Stack>
          </Grid>

          {/*<Grid size={{ xs: 12, sm: 6, lg: 4 }}>*/}
          {/*  <Stack sx={{ gap: 1 }}>*/}
          {/*    <InputLabel>Từ ngày</InputLabel>*/}
          {/*    <DatePicker*/}
          {/*      value={filters.fromDate}*/}
          {/*      format="dd/MM/yyyy"*/}
          {/*      onChange={(newValue) => {*/}
          {/*        setFilters((prev) => ({ ...prev, fromDate: newValue }));*/}
          {/*      }}*/}
          {/*      slotProps={{*/}
          {/*        textField: {*/}
          {/*          size: 'small',*/}
          {/*          fullWidth: true,*/}
          {/*          placeholder: 'Chọn từ ngày'*/}
          {/*        }*/}
          {/*      }}*/}
          {/*    />*/}
          {/*  </Stack>*/}
          {/*</Grid>*/}

          {/*<Grid size={{ xs: 12, sm: 6, lg: 4 }}>*/}
          {/*  <Stack sx={{ gap: 1 }}>*/}
          {/*    <InputLabel>Đến ngày</InputLabel>*/}
          {/*    <DatePicker*/}
          {/*      value={filters.toDate}*/}
          {/*      format="dd/MM/yyyy"*/}
          {/*      onChange={(newValue) => {*/}
          {/*        setFilters((prev) => ({ ...prev, toDate: newValue }));*/}
          {/*      }}*/}
          {/*      slotProps={{*/}
          {/*        textField: {*/}
          {/*          size: 'small',*/}
          {/*          fullWidth: true,*/}
          {/*          placeholder: 'Chọn đến ngày'*/}
          {/*        }*/}
          {/*      }}*/}
          {/*    />*/}
          {/*  </Stack>*/}
          {/*</Grid>*/}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1, justifyContent: 'flex-end', height: '100%' }}>
              <Button
                variant="outlined"
                onClick={() =>
                  setFilters({
                    searchValue: '',
                    factory: '',
                    status: '',
                    fromDate: null,
                    toDate: null
                  })
                }
              >
                Xóa bộ lọc
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Kết quả tìm kiếm: {filteredRecords.length} bản ghi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredRecords.length > 0
              ? `Hiển thị ${filteredRecords.length} kết quả phù hợp với tiêu chí tìm kiếm`
              : 'Không tìm thấy kết quả nào phù hợp với tiêu chí tìm kiếm'}
          </Typography>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Danh sách hàng hóa
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Code Booking</TableCell>
                <TableCell>Xưởng</TableCell>
                <TableCell>Nguyên liệu</TableCell>
                <TableCell>Số công</TableCell>
                <TableCell>Số chì</TableCell>
                <TableCell>Số xe</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>SL xuất (tấn)</TableCell>
                <TableCell>Ngày xuất</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>QC Status</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <>
                  <TableRow
                    key={record.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      backgroundColor: expandedRow === record.id ? '#e3f2fd' : 'inherit'
                    }}
                    onClick={() => handleRowClick(record.id)}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" color="primary">
                        {record.orderCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {record.bookingCode}
                      </Typography>
                    </TableCell>
                    <TableCell>{mockData.factories.find((f) => f.value === record.factory)?.label}</TableCell>
                    <TableCell>{mockData.materials.find((m) => m.value === record.material)?.label}</TableCell>
                    <TableCell>{record.containerNumber}</TableCell>
                    <TableCell>{record.sealNumber}</TableCell>
                    <TableCell>{record.truckNumber}</TableCell>
                    <TableCell>{mockData.customers.find((c) => c.value === record.customerName)?.label}</TableCell>
                    <TableCell>{record.exportQuantity}</TableCell>
                    <TableCell>
                      {record.exportDate?.toLocaleDateString('vi-VN')} <br />
                      <Typography variant="caption" color="text.secondary">
                        {record.exportDate?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(record.status)}
                        color={getStatusColor(record.status) as any}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{getQualityStatusBadge(record)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title={expandedRow === record.id ? 'Thu gọn' : 'Xem chi tiết'}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(record.id);
                          }}
                        >
                          {expandedRow === record.id ? <UpOutlined /> : <DownOutlined />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail Row */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={13}>
                      <Collapse in={expandedRow === record.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 3, backgroundColor: '#fafafa', borderRadius: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Chi tiết đơn hàng: {record.orderCode}
                          </Typography>

                          <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Thông tin cơ bản
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography>
                                  <strong>Code Booking:</strong> {record.bookingCode}
                                </Typography>
                                <Typography>
                                  <strong>Xưởng:</strong> {mockData.factories.find((f) => f.value === record.factory)?.label}
                                </Typography>
                                <Typography>
                                  <strong>Nguyên liệu:</strong> {mockData.materials.find((m) => m.value === record.material)?.label}
                                </Typography>
                                <Typography>
                                  <strong>Chất lượng viên:</strong>{' '}
                                  {mockData.qualityTypes.find((q) => q.value === record.pelletQuality)?.label}
                                </Typography>
                                <Typography>
                                  <strong>Khách hàng:</strong> {mockData.customers.find((c) => c.value === record.customerName)?.label}
                                </Typography>
                                <Typography>
                                  <strong>Tồn nguyên liệu:</strong> {record.materialStock} tấn
                                </Typography>
                                <Typography>
                                  <strong>Tồn viên:</strong> {record.pelletStock} tấn
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Thông tin xuất hàng
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography>
                                  <strong>Số công:</strong> {record.containerNumber}
                                </Typography>
                                <Typography>
                                  <strong>Số chì:</strong> {record.sealNumber}
                                </Typography>
                                <Typography>
                                  <strong>Số xe:</strong> {record.truckNumber}
                                </Typography>
                                <Typography>
                                  <strong>Số lượng xuất:</strong> {record.exportQuantity} tấn
                                </Typography>
                                <Typography>
                                  <strong>Điểm đến:</strong> {mockData.destinations.find((d) => d.value === record.destination)?.label}
                                </Typography>
                                <Typography>
                                  <strong>Ngày xuất:</strong> {record.exportDate?.toLocaleString('vi-VN')}
                                </Typography>
                                <Typography>
                                  <strong>Ngày QC:</strong> {record.qualityReportDate?.toLocaleString('vi-VN') || 'Chưa có'}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={12}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Ghi chú
                              </Typography>
                              <Typography sx={{ mt: 1 }}>{record.note || 'Không có ghi chú'}</Typography>
                            </Grid>

                            <Grid size={12}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                Hình ảnh QC
                              </Typography>
                              {renderImageGallery(record.images)}
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRecords.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy dữ liệu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thử thay đổi tiêu chí tìm kiếm hoặc xóa bộ lọc
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
