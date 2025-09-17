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

// ==============================|| DASHBOARD - COST SUMMARY ||============================== //

export default function CostSummaryDashboard() {
  const [costType, setCostType] = useState('all');
  const [department, setDepartment] = useState('all');
  const [year, setYear] = useState(new Date());

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard Tổng hợp Chi phí
        </Typography>
      </Grid>

      {/* Filters */}
      <Grid size={12}>
        <MainCard title="Bộ lọc">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Loại chi phí</InputLabel>
              <Select value={costType} label="Loại chi phí" onChange={(e) => setCostType(e.target.value)}>
                <MenuItem value="all">Tất cả chi phí</MenuItem>
                <MenuItem value="operating">Chi phí vận hành</MenuItem>
                <MenuItem value="logistics">Chi phí logistics</MenuItem>
                <MenuItem value="procurement">Chi phí mua sắm</MenuItem>
                <MenuItem value="admin">Chi phí hành chính</MenuItem>
                <MenuItem value="marketing">Chi phí marketing</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Phòng ban</InputLabel>
              <Select value={department} label="Phòng ban" onChange={(e) => setDepartment(e.target.value)}>
                <MenuItem value="all">Tất cả phòng ban</MenuItem>
                <MenuItem value="sales">Kinh doanh</MenuItem>
                <MenuItem value="operations">Vận hành</MenuItem>
                <MenuItem value="logistics">Logistics</MenuItem>
                <MenuItem value="finance">Tài chính</MenuItem>
                <MenuItem value="hr">Nhân sự</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MainCard>
      </Grid>

      {/* Cost Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng chi phí" count="$189.5M" percentage={15.8} color="primary">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Chi phí vận hành" count="$124.7M" percentage={12.3} color="success">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Chi phí logistics" count="$42.1M" percentage={18.4} color="info">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Chi phí trên đơn vị" count="$198" percentage={22.7} color="warning">
          <div></div>
        </AnalyticsDataCard>
      </Grid>

      {/* Cost Trends */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Phân tích xu hướng chi phí (12 tháng)">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân tích chi phí hàng tháng và xu hướng chi tiết
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Cost Distribution */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Phân bố chi phí">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân chia chi phí theo danh mục
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Department Cost Analysis */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Phân tích chi phí theo phòng ban">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân bổ chi phí theo phòng ban
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Cost Efficiency Metrics */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Chỉ số hiệu quả chi phí">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Chi phí trên đơn vị và tỷ lệ hiệu quả
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Variable vs Fixed Costs */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Chi phí biến đổi so với chi phí cố định">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân chia các thành phần chi phí biến đổi và cố định
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Budget Variance Analysis */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Phân tích chênh lệch ngân sách">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            So sánh chi phí thực tế với ngân sách dự kiến
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Cost Optimization Opportunities */}
      <Grid size={12}>
        <MainCard title="Cơ hội tối ưu hóa chi phí">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Các khu vực được xác định có tiềm năng tiết kiệm chi phí
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>
    </Grid>
  );
}
