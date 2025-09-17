// material-ui
import { Grid } from '@mui/material';
import PurchaseCostBySupplierChart from 'sections/dashboard/domestics/PurchaseCostBySupplierChart';
import QcInspectionStatusTableOrBar from 'sections/dashboard/domestics/QcInspectionStatusTableOrBar';
import QcRateDonutChart from 'sections/dashboard/domestics/QcRateDonutChart';

export default function DashboardDomestic() {
  return (
    <Grid container spacing={3}>
      <Grid size={12}></Grid>
      <Grid size={12}>
        <QcRateDonutChart />
      </Grid>
      <Grid size={12}>
        <QcInspectionStatusTableOrBar />
      </Grid>
      <Grid size={12}>
        <PurchaseCostBySupplierChart />
      </Grid>
    </Grid>
  );
}
