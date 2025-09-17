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
import LogisticCostsChart from 'sections/dashboard/analytics/LogisticCostsChart';
import SelectableCostChart from 'sections/dashboard/analytics/SelectableCostChart';
import LogisticCostsTable from 'sections/dashboard/analytics/LogisticCostsTable';
import CostDecisionPieChart from 'sections/dashboard/analytics/CostDecisionPieChart';

// hooks
import { useState } from 'react';
import { Box } from '@mui/material';

// ==============================|| DASHBOARD - SUPPLIERS ||============================== //

export default function SuppliersDashboard() {
  const [region, setRegion] = useState('all');
  const [qualityGrade, setQualityGrade] = useState('all');
  const [supplierType, setSupplierType] = useState('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [period, setPeriod] = useState('12-months');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedCostType, setSelectedCostType] = useState('all');

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }

  // Function to get period display text
  const getPeriodText = () => {
    if (period === '12-months') {
      return `12 tháng ${year}`;
    } else {
      return `Tháng ${month}/${year}`;
    }
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard Nhà cung cấp
        </Typography>
      </Grid>

      {/* Supplier Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <MainCard content={false}>
          <Box sx={{ pr: 2.25, pl: 2.25, pt: 1.7, pb: 1.7 }}>
            <Stack sx={{}}>
              <Typography variant="h6" color="text.secondary">
                Bộ lọc năm
              </Typography>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  value={year}
                  label="Chọn năm"
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {years.map((yearOption) => (
                    <MenuItem key={yearOption} value={yearOption}>
                      {yearOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <AnalyticsDataCard title="Tổng số nhà cung cấp" count="623" percentage={18.4} color="primary">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <AnalyticsDataCard title="Nhà cung cấp hoạt động" count="587" percentage={15.8} color="success">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <AnalyticsDataCard title="Tổng khối lượng" count="156,780 MT" percentage={28.5} color="info">
          <div></div>
        </AnalyticsDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <AnalyticsDataCard title="Giá trung bình" count="$520/MT" percentage={12.3} color="warning">
          <div></div>
        </AnalyticsDataCard>
      </Grid>

      {/* Selectable Cost Analysis */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Quyết định quản lý chi phí">
          <CostDecisionPieChart year={year} />
        </MainCard>
      </Grid>

      {/* Logistic Costs Overview */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Tổng hợp chi phí logistic">
          <LogisticCostsChart year={year} />
        </MainCard>
      </Grid>

      {/* Detailed Cost Table */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Bảng chi tiết chi phí logistic theo nhà cung cấp" content={false}>
          {/* <Typography variant="body2" color="textSecondary" sx={{ p: 2, pb: 0 }}>
            Danh sách nhà cung cấp theo tổng chi phí từ cao xuống thấp - {getPeriodText()}
          </Typography> */}
          <LogisticCostsTable
            selectedSupplier={selectedSupplier}
            onSupplierSelect={setSelectedSupplier}
            selectedCostType={selectedCostType}
            onCostTypeSelect={setSelectedCostType}
            year={year}
          />
        </MainCard>
      </Grid>

      {/* Cost Decision Pie Chart */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Phân tích chi phí theo loại">
          <SelectableCostChart selectedSupplier={selectedSupplier} selectedCostType={selectedCostType} year={year} />
        </MainCard>
      </Grid>
    </Grid>
  );
}
