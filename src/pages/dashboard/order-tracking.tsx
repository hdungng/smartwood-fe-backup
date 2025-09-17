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
import OrdersList from 'sections/dashboard/analytics/OrdersList';

// hooks
import { useState } from 'react';

// ==============================|| DASHBOARD - ORDER TRACKING ||============================== //

export default function OrderTrackingDashboard() {
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');
  const [orderType, setOrderType] = useState('all');
  const [year, setYear] = useState(new Date());

  // Sample order status data
  const orderStatusData = [
    { status: 'Chờ xử lý', count: 145, percentage: 15.2, color: 'warning' },
    { status: 'Đã xác nhận', count: 867, percentage: 72.4, color: 'info' },
    { status: 'Đang xử lý', count: 289, percentage: 24.1, color: 'primary' },
    { status: 'Đã giao hàng', count: 156, percentage: 13.0, color: 'secondary' },
    { status: 'Đã nhận hàng', count: 4543, percentage: 378.6, color: 'success' }
  ];

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard Theo dõi đơn hàng
        </Typography>
      </Grid>

      {/* Filters */}
      <Grid size={12}>
        <MainCard title="Bộ lọc">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Khu vực</InputLabel>
              <Select value={region} label="Khu vực" onChange={(e) => setRegion(e.target.value)}>
                <MenuItem value="all">Tất cả khu vực</MenuItem>
                <MenuItem value="north">Miền Bắc</MenuItem>
                <MenuItem value="central">Miền Trung</MenuItem>
                <MenuItem value="south">Miền Nam</MenuItem>
                <MenuItem value="mekong">Đồng bằng sông Cửu Long</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Trạng thái đơn hàng</InputLabel>
              <Select value={status} label="Trạng thái đơn hàng" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value="pending">Chờ xử lý</MenuItem>
                <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                <MenuItem value="processing">Đang xử lý</MenuItem>
                <MenuItem value="shipped">Đã giao hàng</MenuItem>
                <MenuItem value="delivered">Đã nhận hàng</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Loại đơn hàng</InputLabel>
              <Select value={orderType} label="Loại đơn hàng" onChange={(e) => setOrderType(e.target.value)}>
                <MenuItem value="all">Tất cả loại</MenuItem>
                <MenuItem value="domestic">Nội địa</MenuItem>
                <MenuItem value="export">Xuất khẩu</MenuItem>
                <MenuItem value="import">Nhập khẩu</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MainCard>
      </Grid>

      {/* Order Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng số đơn hàng" count="4,832" percentage={25.8} color="primary">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Đang xử lý" count="289" percentage={12.4} color="info">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Đã hoàn thành" count="4,543" percentage={28.7} color="success">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Giao hàng đúng hạn" count="97.8%" percentage={5.6} color="warning">
          <div></div>
        </AnalyticsDataCard>
      </Grid>

      {/* Order Status Overview with detailed data */}
      <Grid size={12}>
        <MainCard title="Tổng quan trạng thái đơn hàng">
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip label="Chờ xử lý" color="warning" size="small" />
            <Chip label="Đã xác nhận" color="info" size="small" />
            <Chip label="Đang xử lý" color="primary" size="small" />
            <Chip label="Đã giao hàng" color="secondary" size="small" />
            <Chip label="Đã nhận hàng" color="success" size="small" />
          </Stack>

          {/* Detailed Status Breakdown */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chi tiết trạng thái đơn hàng
            </Typography>
            <Stack spacing={2}>
              {orderStatusData.map((item, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip label={item.status} color={item.color as any} size="small" variant="outlined" />
                      <Typography variant="body2">{item.count} đơn hàng</Typography>
                    </Stack>
                    <Typography variant="body2" color="textSecondary">
                      {((item.count / 4832) * 100).toFixed(1)}% tổng số
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(item.count / 4832) * 100}
                    color={item.color as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Order Trends by Region */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Xu hướng đơn hàng theo khu vực (12 tháng)">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Khối lượng đơn hàng và tỷ lệ hoàn thành theo khu vực
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Delivery Performance */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Hiệu suất giao hàng">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Tỷ lệ giao hàng đúng hạn
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Recent Orders */}
      <Grid size={12}>
        <MainCard title="Đơn hàng gần đây" content={false}>
          <OrdersList />
        </MainCard>
      </Grid>
    </Grid>
  );
}
