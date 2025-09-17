// material-ui
import { Grid } from '@mui/material';

// project imports

import ExportBatchStatusTableOrChart from 'sections/dashboard/logistics/ExportBatchStatusTableOrChart';

// ==============================|| DASHBOARD - LOGISTIC ||============================== //

export default function DashboardLogistic() {
  return (
    <Grid container spacing={3}>
      <Grid size={12}></Grid>
      <Grid size={12}>
        <ExportBatchStatusTableOrChart />
      </Grid>
    </Grid>
  );
}
