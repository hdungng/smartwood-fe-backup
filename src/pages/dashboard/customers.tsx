// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';
import IncomeOverviewCard from 'sections/dashboard/analytics/IncomeOverviewCard';
import ProductTypeChart from 'sections/dashboard/analytics/ProductTypeChart';
import OrdersList from 'sections/dashboard/analytics/OrdersList';

// hooks
import { useState } from 'react';

// ==============================|| DASHBOARD - CUSTOMERS ||============================== //

export default function CustomersDashboard() {
  const [customerType, setCustomerType] = useState('all');
  const [region, setRegion] = useState('all');
  const [year, setYear] = useState(new Date());

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard Khách hàng
        </Typography>
      </Grid>

      {/* Filters */}
      <Grid size={12}>
        <MainCard title="Bộ lọc">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Loại khách hàng</InputLabel>
              <Select value={customerType} label="Loại khách hàng" onChange={(e) => setCustomerType(e.target.value)}>
                <MenuItem value="all">Tất cả khách hàng</MenuItem>
                <MenuItem value="domestic">Trong nước</MenuItem>
                <MenuItem value="international">Quốc tế</MenuItem>
                <MenuItem value="vip">Khách hàng VIP</MenuItem>
                <MenuItem value="biomass">Nhà máy Biomass</MenuItem>
                <MenuItem value="energy">Công ty Năng lượng</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Khu vực</InputLabel>
              <Select value={region} label="Khu vực" onChange={(e) => setRegion(e.target.value)}>
                <MenuItem value="all">Tất cả khu vực</MenuItem>
                <MenuItem value="north">Miền Bắc</MenuItem>
                <MenuItem value="central">Miền Trung</MenuItem>
                <MenuItem value="south">Miền Nam</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MainCard>
      </Grid>

      {/* Customer Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng số khách hàng" count="1,567" percentage={16.8} color="primary">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Khách hàng hoạt động" count="1,298" percentage={14.5} color="success">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng số đơn hàng" count="4,832" percentage={22.3} color="info">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Giá trị đơn hàng" count="$187.4M" percentage={26.7} color="warning">
          <div></div>
        </AnalyticsDataCard>
      </Grid>

      {/* Customer Purchase Trends */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Xu hướng mua hàng của khách hàng (12 tháng)">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Xu hướng khối lượng và giá trị đơn mua
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Top Customers by Revenue */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Top khách hàng theo giá trị">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Xếp hạng theo tổng giá trị mua hàng
          </Typography>
          <ProductTypeChart dataType="revenue" title="Doanh thu theo sản phẩm" />
        </MainCard>
      </Grid>

      {/* Customer Acquisition */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Thu hút khách hàng">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Khách hàng mới so với khách hàng cũ
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Customer Orders by Product */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Đơn hàng theo loại sản phẩm">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân tích đơn hàng khách hàng theo sản phẩm
          </Typography>
          <ProductTypeChart dataType="orders" title="Số lượng đơn hàng" />
        </MainCard>
      </Grid>

      {/* Recent Customer Orders */}
      <Grid size={12}>
        <MainCard title="Đơn hàng khách hàng gần đây" content={false}>
          <OrdersList />
        </MainCard>
      </Grid>
    </Grid>
  );
}
