// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// project imports
import MainCard from 'components/MainCard';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';
import IncomeOverviewCard from 'sections/dashboard/analytics/IncomeOverviewCard';
import ProductTypeChart from 'sections/dashboard/analytics/ProductTypeChart';
import OrdersList from 'sections/dashboard/analytics/OrdersList';

// hooks
import { useState } from 'react';

// ==============================|| DASHBOARD - RECEIVABLES ||============================== //

export default function ReceivablesDashboard() {
  const [productType, setProductType] = useState('all');
  const [collectionStatus, setCollectionStatus] = useState('all');
  const [customer, setCustomer] = useState('all');

  // Sample collection status data
  const collectionStatusData = [
    { status: 'Hiện tại', amount: '$76.2M', percentage: 84.9, color: 'success', description: 'Trong hạn thanh toán' },
    { status: 'Quá hạn', amount: '$3.8M', percentage: 4.2, color: 'warning', description: 'Quá hạn 1-30 ngày' },
    { status: 'Đang thu hồi', amount: '$6.4M', percentage: 7.1, color: 'error', description: 'Quá hạn > 30 ngày' },
    { status: 'Đã thu hồi', amount: '$3.3M', percentage: 3.7, color: 'primary', description: 'Thu hồi trong tháng' }
  ];

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard Công nợ phải thu
        </Typography>
      </Grid>

      {/* Filters */}
      <Grid size={12}>
        <MainCard title="Bộ lọc">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Loại sản phẩm</InputLabel>
              <Select value={productType} label="Loại sản phẩm" onChange={(e) => setProductType(e.target.value)}>
                <MenuItem value="all">Tất cả sản phẩm</MenuItem>
                <MenuItem value="sawdust">Mùn cưa</MenuItem>
                <MenuItem value="woodchip">Dăm gỗ</MenuItem>
                <MenuItem value="pellet">Viên nén gỗ</MenuItem>
                <MenuItem value="biomass">Nhiên liệu sinh học khác</MenuItem>
                <MenuItem value="equipment">Thiết bị chế biến</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Trạng thái thu hồi</InputLabel>
              <Select value={collectionStatus} label="Trạng thái thu hồi" onChange={(e) => setCollectionStatus(e.target.value)}>
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value="current">Hiện tại</MenuItem>
                <MenuItem value="overdue">Quá hạn</MenuItem>
                <MenuItem value="collection">Đang thu hồi</MenuItem>
                <MenuItem value="collected">Đã thu hồi</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Khách hàng</InputLabel>
              <Select value={customer} label="Khách hàng" onChange={(e) => setCustomer(e.target.value)}>
                <MenuItem value="all">Tất cả khách hàng</MenuItem>
                <MenuItem value="customer1">Khách hàng A</MenuItem>
                <MenuItem value="customer2">Khách hàng B</MenuItem>
                <MenuItem value="customer3">Khách hàng C</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MainCard>
      </Grid>

      {/* Receivables Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng công nợ phải thu" count="$89.7M" percentage={18.2} color="primary">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Số tiền quá hạn" count="$3.8M" percentage={24.5} color="success">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tỷ lệ thu hồi" count="95.7%" percentage={8.3} color="info">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Ngày thanh toán bình quân" count="23 ngày" percentage={15.6} color="warning">
          <div></div>
        </AnalyticsDataCard>
      </Grid>

      {/* Collection Status Overview with detailed data */}
      <Grid size={12}>
        <MainCard title="Tổng quan trạng thái thu hồi">
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip label="Hiện tại" color="success" size="small" />
            <Chip label="Quá hạn" color="warning" size="small" />
            <Chip label="Đang thu hồi" color="error" size="small" />
            <Chip label="Đã thu hồi" color="primary" size="small" />
          </Stack>

          {/* Detailed Status Breakdown */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chi tiết trạng thái thu hồi
            </Typography>
            <Stack spacing={2}>
              {collectionStatusData.map((item, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip label={item.status} color={item.color as any} size="small" variant="outlined" />
                      <Typography variant="body2" fontWeight="bold">
                        {item.amount}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ({item.description})
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="textSecondary">
                      {item.percentage.toFixed(1)}% tổng số
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    color={item.color as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Tổng hợp số tiền phải thu theo lịch thu hồi
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Receivables by Product Type */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Công nợ phải thu theo loại sản phẩm (12 tháng)">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Số tiền dư nợ được nhóm theo danh mục sản phẩm
          </Typography>
          <ProductTypeChart dataType="revenue" title="Công nợ theo sản phẩm" />
        </MainCard>
      </Grid>

      {/* Aging Analysis */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Phân tích tài khoản quá hạn">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân tích công nợ phải thu theo độ tuổi
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Customer Payment Performance */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Hiệu suất thanh toán khách hàng">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Hành vi thanh toán và phân tích rủi ro tín dụng
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Collection Efficiency */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Hiệu quả thu hồi">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Tỷ lệ thu hồi và hiệu suất phục hồi
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Outstanding Receivables List */}
      <Grid size={12}>
        <MainCard title="Danh sách công nợ chưa thu" content={false}>
          <OrdersList />
        </MainCard>
      </Grid>
    </Grid>
  );
}
