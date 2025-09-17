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

// hooks
import { useState } from 'react';

// ==============================|| DASHBOARD - REVENUE SUMMARY ||============================== //

export default function RevenueSummaryDashboard() {
  const [productType, setProductType] = useState('all');
  const [salesChannel, setSalesChannel] = useState('all');
  const [year, setYear] = useState(new Date());

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Dashboard Tổng hợp Doanh thu</Typography>
          <Typography variant="body2" color="textSecondary">
            Cập nhật cuối: {new Date().toLocaleString()}
          </Typography>
        </Stack>
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
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Kênh bán hàng</InputLabel>
              <Select value={salesChannel} label="Kênh bán hàng" onChange={(e) => setSalesChannel(e.target.value)}>
                <MenuItem value="all">Tất cả kênh</MenuItem>
                <MenuItem value="domestic">Nội địa</MenuItem>
                <MenuItem value="export">Xuất khẩu</MenuItem>
                <MenuItem value="online">Trực tuyến</MenuItem>
                <MenuItem value="retail">Bán lẻ</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MainCard>
      </Grid>

      {/* Revenue KPIs */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng doanh thu" count="$368.7M" percentage={24.3} color="primary">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Lợi nhuận gộp" count="$142.5M" percentage={31.8} color="success">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Biên lợi nhuận" count="38.7%" percentage={7.2} color="info">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="EBITDA" count="$96.8M" percentage={19.4} color="warning">
          <div></div>
        </AnalyticsDataCard>
      </Grid>

      {/* Revenue Trends */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Xu hướng Doanh thu & Lợi nhuận (12 tháng)">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân tích doanh thu, chi phí và lợi nhuận gộp hàng tháng
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Revenue by Product */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Doanh thu theo sản phẩm">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân tích đóng góp theo sản phẩm
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Monthly Performance */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Hiệu suất hàng tháng">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Tỷ lệ tăng trưởng theo tháng
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Sales Channel Performance */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Hiệu suất kênh bán hàng">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Doanh thu và biên lợi nhuận theo kênh bán hàng
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Quarterly Comparison */}
      <Grid size={12}>
        <MainCard title="So sánh doanh thu theo quý">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            So sánh hiệu suất theo quý năm-trên-năm
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>
    </Grid>
  );
}
