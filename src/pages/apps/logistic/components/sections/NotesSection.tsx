import { CircularProgress, TextField, Grid, Stack, Typography, Paper, Box, Divider } from '@mui/material';
import { useIntl } from 'react-intl';
import { FormikProps } from 'formik';
import { LogisticFormValues } from '../../types';       

interface NotesSectionProps {
  formik: FormikProps<LogisticFormValues>;
  isLoadingCustomer: boolean;
}

export const NotesSection = ({ formik, isLoadingCustomer }: NotesSectionProps) => {
  const intl = useIntl();

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, flexGrow: 1 }}>
          {intl.formatMessage({ id: 'notes' }) || 'Ghi chú'}
        </Typography>
        <Divider sx={{ flexGrow: 1, ml: 2 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Stack spacing={1}>
            <TextField
              id="notes"
              name="notes"
              placeholder={intl.formatMessage({ id: 'notes' })}
              multiline
              rows={3}
              fullWidth
              value={formik.values.notes}
              disabled={isLoadingCustomer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
              InputProps={{
                endAdornment: isLoadingCustomer && <CircularProgress size={20} />,
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};