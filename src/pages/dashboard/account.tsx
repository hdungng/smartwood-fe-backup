// material-ui
import { Grid } from '@mui/material';
import PaymentStatusTable from 'sections/dashboard/accounts/PaymentStatusTable';

export default function DashboardAccount() {
  return (
    <Grid container spacing={3}>
      <Grid size={12}></Grid>
      <Grid size={12}>
        <PaymentStatusTable />
      </Grid>
    </Grid>
  );
}
