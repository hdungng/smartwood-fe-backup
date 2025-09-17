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
import CountryImportChart from 'sections/dashboard/analytics/CountryImportChart';
import SupplierChart from 'sections/dashboard/analytics/SupplierChart';

// hooks
import { useState } from 'react';

// ==============================|| DASHBOARD - MARKET OVERVIEW ||============================== //

export default function MarketOverviewDashboard() {
  const [country, setCountry] = useState('all');
  const [importer, setImporter] = useState('all');
  const [exporter, setExporter] = useState('all');
  const [year, setYear] = useState(new Date());

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Typography variant="h4" gutterBottom>
          Tổng hợp thị trường
        </Typography>
      </Grid>

      {/* Filters */}
      <Grid size={12}>
        <MainCard title="Bộ lọc">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Nước nhập khẩu</InputLabel>
              <Select value={country} label="Nước nhập khẩu" onChange={(e) => setCountry(e.target.value)}>
                <MenuItem value="all">Tất cả quốc gia</MenuItem>
                <MenuItem value="vn">Việt Nam</MenuItem>
                <MenuItem value="us">Hoa Kỳ</MenuItem>
                <MenuItem value="jp">Nhật Bản</MenuItem>
                <MenuItem value="kr">Hàn Quốc</MenuItem>
                <MenuItem value="de">Đức</MenuItem>
                <MenuItem value="uk">Anh</MenuItem>
                <MenuItem value="cn">Trung Quốc</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Nhà nhập khẩu</InputLabel>
              <Select value={importer} label="Nhà nhập khẩu" onChange={(e) => setImporter(e.target.value)}>
                <MenuItem value="all">Tất cả nhà nhập khẩu</MenuItem>
                <MenuItem value="imp1">Công ty Biomass EU</MenuItem>
                <MenuItem value="imp2">Green Energy Corp</MenuItem>
                <MenuItem value="imp3">EcoFuel Trading</MenuItem>
                <MenuItem value="imp4">Renewable Resources Ltd</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Nhà xuất khẩu</InputLabel>
              <Select value={exporter} label="Nhà xuất khẩu" onChange={(e) => setExporter(e.target.value)}>
                <MenuItem value="all">Tất cả nhà xuất khẩu</MenuItem>
                <MenuItem value="exp1">VN Wood Pellet Co.</MenuItem>
                <MenuItem value="exp2">Mekong Biomass Export</MenuItem>
                <MenuItem value="exp3">Saigon Wood Chips</MenuItem>
                <MenuItem value="exp4">Delta Sawdust Trading</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MainCard>
      </Grid>

      {/* Statistics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng khối lượng nhập khẩu" count="89,450 MT" percentage={24.8} color="primary">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Tổng khối lượng xuất khẩu" count="156,780 MT" percentage={32.1} color="success">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Giá trị nhập khẩu" count="$52.8M" percentage={18.7} color="info">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticsDataCard title="Giá trị xuất khẩu" count="$78.3M" percentage={28.5} color="warning">
          <div></div>
        </AnalyticsDataCard>
      </Grid>

      {/* Import/Export Trends Chart */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Xu hướng Nhập/Xuất khẩu (12 tháng)">
          <IncomeOverviewCard />
        </MainCard>
      </Grid>

      {/* Top Countries Chart */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Top các nước nhập khẩu">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Phân tích khối lượng theo quốc gia
          </Typography>
          <CountryImportChart />
        </MainCard>
      </Grid>

      {/* Import by Importer */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Khối lượng nhập khẩu theo nhà nhập khẩu">
          <SupplierChart type="export" />
        </MainCard>
      </Grid>

      {/* Export by Exporter */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Khối lượng xuất khẩu theo nhà xuất khẩu">
          <SupplierChart type="import" />
        </MainCard>
      </Grid>

      {/* Customs Data Summary */}
      <Grid size={12}>
        <MainCard title="Tổng hợp dữ liệu hải quan">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Dữ liệu được nhập từ hệ thống hải quan - Cập nhật hàng ngày
          </Typography>
          <IncomeOverviewCard />
        </MainCard>
      </Grid>
    </Grid>
  );
}
