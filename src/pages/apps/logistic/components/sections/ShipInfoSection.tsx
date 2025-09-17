import { CircularProgress, Autocomplete, TextField, Grid, Stack, InputLabel, Typography, Paper, Box, Divider } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useIntl } from 'react-intl';
import { FormikProps } from 'formik';
import { LogisticFormValues } from '../../types';
import { SelectionOption } from 'types/common';
import dateHelper from 'utils/dateHelper';

interface ShipInfoSectionProps {
  formik: FormikProps<LogisticFormValues>;
  forwarders: SelectionOption[];
  shippingLines: SelectionOption[];
  exportPortOptions: SelectionOption[];
  importPortOptions: SelectionOption[];
  regionOptions: SelectionOption[];
  calculatedRestrictedExportPortOptions: SelectionOption[];
  forwardersLoading: boolean;
  shippingLinesLoading: boolean;
  selectedSaleContract: any;
  currentEditingId: string | null;
  onExportPortChange: (newValue: any) => void;
}

export const ShipInfoSection = ({
  formik,
  forwarders,
  shippingLines,
  exportPortOptions,
  importPortOptions,
  regionOptions,
  calculatedRestrictedExportPortOptions,
  forwardersLoading,
  shippingLinesLoading,
  selectedSaleContract,
  currentEditingId,
  onExportPortChange
}: ShipInfoSectionProps) => {
  const intl = useIntl();

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, flexGrow: 1 }}>
          {intl.formatMessage({ id: 'ship_information' }) || 'Thông tin tàu'}
        </Typography>
        <Divider sx={{ flexGrow: 1, ml: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Basic Ship Info */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'shipName' })}</InputLabel>
            <TextField
              id="shipName"
              name="shipName"
              size="medium"
              placeholder={intl.formatMessage({ id: 'shipName' })}
              fullWidth
              value={formik.values.shipName}
              onChange={formik.handleChange}
              error={formik.touched.shipName && Boolean(formik.errors.shipName)}
              helperText={formik.touched.shipName && formik.errors.shipName}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'forwarderName' })}</InputLabel>
            <Autocomplete
              id="forwarderName"
              options={forwarders}
              size="medium"
              getOptionLabel={(option) => option.label || ''}
              value={forwarders.find((f) => f.value === formik.values.forwarderName) || null}
              onChange={(_, newValue) => formik.setFieldValue('forwarderName', newValue ? newValue.value : '')}
              loading={forwardersLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={intl.formatMessage({ id: 'forwarderName' })}
                  error={formik.touched.forwarderName && Boolean(formik.errors.forwarderName)}
                  helperText={formik.touched.forwarderName && formik.errors.forwarderName}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {forwardersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'shippingLine' })}</InputLabel>
            <Autocomplete
              id="shippingLineName"
              options={shippingLines}
              size="medium"
              getOptionLabel={(option) => option.label || ''}
              value={shippingLines.find((f) => f.value === formik.values.shippingLine) || null}
              onChange={(_, newValue) => formik.setFieldValue('shippingLine', newValue ? newValue.value : '')}
              loading={shippingLinesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="shippingLine"
                  placeholder={intl.formatMessage({ id: 'shippingLine' })}
                  error={formik.touched.shippingLine && Boolean(formik.errors.shippingLine)}
                  helperText={formik.touched.shippingLine && formik.errors.shippingLine}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {shippingLinesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </Stack>
        </Grid>

        {/* Location Info */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'export_port' })}</InputLabel>
            <Autocomplete
              size="medium"
              options={selectedSaleContract?.transportInfo?.length ? calculatedRestrictedExportPortOptions : exportPortOptions}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
              value={exportPortOptions.find((opt) => opt.value === formik.values.exportPort) || null}
              onChange={(_, newValue) => onExportPortChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={formik.touched.exportPort && Boolean(formik.errors.exportPort)}
                  helperText={formik.touched.exportPort && formik.errors.exportPort}
                  placeholder={intl.formatMessage({ id: 'export_port' })}
                />
              )}
              componentsProps={{
                popupIndicator: { title: intl.formatMessage({ id: 'open_dropdown_text' }) },
                clearIndicator: { title: intl.formatMessage({ id: 'clear_text' }) }
              }}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'region_logistic' })}</InputLabel>
            <Autocomplete
              id="region"
              size="medium"
              options={regionOptions}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
              value={regionOptions.find((opt) => opt.value === formik.values.region) || null}
              onChange={(_, newValue) => formik.setFieldValue('region', newValue ? newValue.value : '')}
              readOnly={true}
              popupIcon={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={intl.formatMessage({ id: 'region_logistic' })}
                  error={formik.touched.region && Boolean(formik.errors.region)}
                  helperText={formik.touched.region && formik.errors.region}
                />
              )}
              isOptionEqualToValue={(option, value) => (option as any).value === (value as any).value}
            />
          </Stack>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'import_port' }) || 'Import Port'}</InputLabel>
            <Autocomplete
              size="medium"
              options={importPortOptions}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
              value={importPortOptions.find((opt) => opt.value === formik.values.importPort) || null}
              onChange={(_, newValue) => formik.setFieldValue('importPort', newValue ? newValue.value : '')}
              readOnly={true}
              popupIcon={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={formik.touched.importPort && Boolean(formik.errors.importPort)}
                  helperText={formik.touched.importPort && formik.errors.importPort}
                  placeholder={intl.formatMessage({ id: 'import_port' }) || 'Import Port'}
                />
              )}
              componentsProps={{
                popupIndicator: { title: intl.formatMessage({ id: 'open_dropdown_text' }) },
                clearIndicator: { title: intl.formatMessage({ id: 'clear_text' }) }
              }}
            />
          </Stack>
        </Grid>

        {/* Date Fields */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'etd_shipping_date' })}</InputLabel>
            <DateTimePicker
              value={formik.values.etdDate ? dateHelper.from(formik.values.etdDate) : null}
              format="DD/MM/YYYY HH:mm"
              onChange={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('etdDate', date || null);
              }}
              onAccept={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('etdDate', date || null);
                formik.setFieldTouched('etdDate', true);
              }}
              minDate={!currentEditingId ? dateHelper.tomorrow() : undefined}
              maxDate={!currentEditingId && selectedSaleContract?.maxDateToBuy ? dateHelper.from(selectedSaleContract.maxDateToBuy) : undefined}
              slotProps={{
                textField: {
                  id: 'etdDate',
                  name: 'etdDate',
                  size: 'medium',
                  fullWidth: true,
                  error: formik.touched.etdDate && Boolean(formik.errors.etdDate),
                  helperText: formik.touched.etdDate && formik.errors.etdDate ? String(formik.errors.etdDate) : undefined,
                  placeholder: intl.formatMessage({ id: 'etd_shipping_date' })
                }
              }}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'eta_shipping_date' })}</InputLabel>
            <DateTimePicker
              value={formik.values.etaDate ? dateHelper.from(formik.values.etaDate) : null}
              format="DD/MM/YYYY HH:mm"
              onChange={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('etaDate', date || null);
              }}
              onAccept={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('etaDate', date || null);
                formik.setFieldTouched('etaDate', true);
              }}
              minDate={!currentEditingId ? dateHelper.tomorrow() : undefined}
              maxDate={!currentEditingId && selectedSaleContract?.maxDateToBuy ? dateHelper.from(selectedSaleContract.maxDateToBuy) : undefined}
              slotProps={{
                textField: {
                  id: 'etaDate',
                  name: 'etaDate',
                  size: 'medium',
                  fullWidth: true,
                  error: formik.touched.etaDate && Boolean(formik.errors.etaDate),
                  helperText: formik.touched.etaDate && formik.errors.etaDate ? String(formik.errors.etaDate) : undefined,
                  placeholder: intl.formatMessage({ id: 'eta_shipping_date' })
                }
              }}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'firstContainerDropDate' })}</InputLabel>
            <DateTimePicker
              value={formik.values.firstContainerDropDate ? dateHelper.from(formik.values.firstContainerDropDate) : null}
              format="DD/MM/YYYY HH:mm"
              onChange={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('firstContainerDropDate', date || null);
              }}
              onAccept={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('firstContainerDropDate', date || null);
                formik.setFieldTouched('firstContainerDropDate', true);
              }}
              minDate={!currentEditingId ? dateHelper.tomorrow() : undefined}
              maxDate={!currentEditingId && selectedSaleContract?.maxDateToBuy ? dateHelper.from(selectedSaleContract.maxDateToBuy) : undefined}
              slotProps={{
                textField: {
                  id: 'firstContainerDropDate',
                  name: 'firstContainerDropDate',
                  size: 'medium',
                  fullWidth: true,
                  error: formik.touched.firstContainerDropDate && Boolean(formik.errors.firstContainerDropDate),
                  helperText: formik.touched.firstContainerDropDate && formik.errors.firstContainerDropDate ? String(formik.errors.firstContainerDropDate) : undefined,
                  placeholder: intl.formatMessage({ id: 'firstContainerDropDate' })
                }
              }}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'cutoffDate' })}</InputLabel>
            <DateTimePicker
              value={formik.values.cutoffDate ? dateHelper.from(formik.values.cutoffDate) : null}
              format="DD/MM/YYYY HH:mm"
              onChange={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('cutoffDate', date || null);
              }}
              onAccept={(newValue) => {
                const date = newValue instanceof Date ? newValue : newValue?.toDate();
                formik.setFieldValue('cutoffDate', date || null);
                formik.setFieldTouched('cutoffDate', true);
              }}
              minDate={!currentEditingId ? dateHelper.tomorrow() : undefined}
              maxDate={!currentEditingId && selectedSaleContract?.maxDateToBuy ? dateHelper.from(selectedSaleContract.maxDateToBuy) : undefined}
              slotProps={{
                textField: {
                  id: 'cutoffDate',
                  name: 'cutoffDate',
                  size: 'medium',
                  fullWidth: true,
                  error: formik.touched.cutoffDate && Boolean(formik.errors.cutoffDate),
                  helperText: formik.touched.cutoffDate && formik.errors.cutoffDate ? String(formik.errors.cutoffDate) : undefined,
                  placeholder: intl.formatMessage({ id: 'cutoffDate' })
                }
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};