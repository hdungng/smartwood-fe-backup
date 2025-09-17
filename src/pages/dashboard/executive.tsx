// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

// assets
import { EyeOutlined } from '@ant-design/icons';
import Tooltip from '@mui/material/Tooltip';
import { Divider } from '@mui/material';

// ==============================|| DASHBOARD - EXECUTIVE ||============================== //

export default function DashboardExecutive() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Ban lãnh đạo</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Lợi nhuận" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Số lượng nhà cung cấp" count="7,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Đơn hàng mua" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title="Đơn hàng bán" count="35,078" percentage={27.4} isLoss={false} extra="20,395" />
      </Grid>
      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid container alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Danh sách công việc</Typography>
            <Tooltip title="xem thêm">
              <Button size="small" color="primary">
                <EyeOutlined />
              </Button>
            </Tooltip>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}></MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid container alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Quản lý phương án kinh doanh</Typography>
            <Tooltip title="xem thêm">
              <Button size="small" color="primary">
                <EyeOutlined />
              </Button>
            </Tooltip>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}></MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid container alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Lợi nhuận gộp theo đơn hàng</Typography>
            <Tooltip title="xem thêm">
              <Button size="small" color="primary">
                <EyeOutlined />
              </Button>
            </Tooltip>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}></MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center">
          <Typography variant="h5">Danh sách văn phòng phẩm</Typography>
          <Tooltip title="xem thêm">
            <Button size="small" color="primary">
              <EyeOutlined />
            </Button>
          </Tooltip>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}></MainCard>
      </Grid>

      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}></Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Tổng giá trị bán hàng (Tuần)</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                This Week Statistics
              </Typography>
              <Typography variant="h3">$7,650</Typography>
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}></Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}></Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}></Grid>

      {/* row 3 */}
    </Grid>
  );
}
