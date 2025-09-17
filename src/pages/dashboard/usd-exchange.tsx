// material-ui
import { Grid, Typography, Box } from '@mui/material';

// project import
import ComponentSkeleton from 'sections/components-overview/ComponentSkeleton';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';
import USDExchangeChart from 'sections/dashboard/analytics/USDExchangeChart';

// assets
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import SwapOutlined from '@ant-design/icons/SwapOutlined';

// ==============================|| USD EXCHANGE DASHBOARD ||============================== //

export default function USDExchangeDashboard() {
  return (
    <ComponentSkeleton>
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        {/* Header */}
        <Grid size={12}>
          <Typography variant="h5">Tỷ giá USD/VND</Typography>
        </Grid>

        {/* Key Metrics */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsDataCard title="Tỷ giá hiện tại" count="24,580 VND" percentage={0.14} isLoss={false}>
            <DollarOutlined style={{ fontSize: '1.15rem', color: 'inherit' }} />
          </AnalyticsDataCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsDataCard title="Tỷ giá cao nhất" count="24,820 VND" percentage={2.1} isLoss={false}>
            <RiseOutlined style={{ fontSize: '1.15rem', color: 'inherit' }} />
          </AnalyticsDataCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsDataCard title="Tỷ giá thấp nhất" count="24,385 VND" percentage={-1.2} isLoss={true}>
            <FallOutlined style={{ fontSize: '1.15rem', color: 'inherit' }} />
          </AnalyticsDataCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsDataCard title="Biến động trung bình" count="±195 VND" percentage={0.8} isLoss={false}>
            <SwapOutlined style={{ fontSize: '1.15rem', color: 'inherit' }} />
          </AnalyticsDataCard>
        </Grid>

        {/* USD Exchange Rate Chart */}
        <Grid size={12}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 3
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Biểu đồ tỷ giá USD/VND (30 ngày gần nhất)
            </Typography>
            <USDExchangeChart />
          </Box>
        </Grid>
      </Grid>
    </ComponentSkeleton>
  );
}
