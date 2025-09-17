import Grid from '@mui/material/Grid';
import { LogisticSummary, LogisticTable } from '../../components';

const LogisticSection = () => {
  return (
    <Grid container spacing={3}>
      <LogisticTable />

      <LogisticSummary />
    </Grid>
  );
};

export default LogisticSection;
