import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { formatNumber, parseFormattedNumber } from 'utils';

import _ from 'lodash';

import { enqueueSnackbar } from 'notistack';
import { Button, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  costInfoSelector,
  errorCostSelector,
  getCostByID,
  resetCostInfo,
  saveCostInfo,
  successCostSelector,
  updateCostField
} from 'redux/CostInfo';
import { useEffect } from 'react';
import { isObjectDifferent } from 'utils';
import { BUSSINESS_PLAN_COST } from 'api/CommonAPI/BusinessPlan';
import axiosServices from 'utils/axios';
import { useIntl } from 'react-intl';

const LIST_KEYS = [
  'businessPlanId',
  'totalFreightEbs',
  'factoryToPortCost',
  'warehouseRentalCost',
  'truckingCost',
  'localCharges',
  'earlyUnloadingFee',
  'thcFee',
  'sealFee',
  'infrastructureFee',
  'customsSupervisionFee',
  'fumigationPerContainer',
  'fumigationPerLot',
  'quarantineFee',
  'ttFee',
  'coFee',
  'doFee',
  'palletFee',
  'jumboBagFee',
  'amsFee',
  'customsTeamFee',
  'customsReceptionFee',
  'clearanceCost',
  'interestCost',
  'vatInterestCost',
  'exchangeRateCost',
  'dhlFee',
  'brokerageFee',
  'taxRefundCost',
  'qcCost',
  'generalManagementCost',
  'currency'
];

// Mock reference data for costs
const mockReferenceData = {
  logistic: {
    totalFreightEbs: '50000',
    factoryToPortCost: '2000',
    warehouseRentalCost: '1500',
    truckingCost: '3000',
    localCharges: '2500',
    earlyUnloadingFee: '500',
    thcFee: '1000',
    sealFee: '200',
    infrastructureFee: '800',
    customsSupervisionFee: '600',
    fumigationPerContainer: '400',
    fumigationPerLot: '300',
    quarantineFee: '250',
    ttFee: '150',
    coFee: '100',
    doFee: '300',
    palletFee: '500',
    jumboBagFee: '200',
    amsFee: '100'
  },
  customs: {
    customsTeamFee: '800',
    customsReceptionFee: '600',
    clearanceCost: '1200'
  },
  financial: {
    interestCost: '2000',
    vatInterestCost: '200',
    exchangeRateCost: '500',
    dhlFee: '100',
    brokerageFee: '800',
    taxRefundCost: '1500'
  },
  management: {
    qcCost: '1000',
    generalManagementCost: '2000'
  }
};

// Cost labels for each section
const costLabels = {
  logistic: [
    { key: 'totalFreightEbs', labelKey: 'total_sea_freight_ebs_ex_vat' },
    { key: 'factoryToPortCost', labelKey: 'factory_to_port_cost' },
    { key: 'warehouseRentalCost', labelKey: 'warehouse_rental_costs_at_the_port' },
    { key: 'truckingCost', labelKey: 'trucking_from_warehouse_to_port_ex_vat' },
    { key: 'localCharges', labelKey: 'local_costs_ex_vat' },
    { key: 'earlyUnloadingFee', labelKey: 'fees_lowered_early' },
    { key: 'thcFee', labelKey: 'terminal_handling_charge_thc' },
    { key: 'sealFee', labelKey: 'lead_feee' },
    { key: 'infrastructureFee', labelKey: 'infrastructure_fees' },
    { key: 'customsSupervisionFee', labelKey: 'customs_supervision_fee' },
    { key: 'fumigationPerContainer', labelKey: 'fumigation_fee_per_container' },
    { key: 'fumigationPerLot', labelKey: 'batch_fumigation_fee' },
    { key: 'quarantineFee', labelKey: 'quarantine_fee' },
    { key: 'ttFee', labelKey: 't_t_fee' },
    { key: 'coFee', labelKey: 'c_o_fee' },
    { key: 'doFee', labelKey: 'DO' },
    { key: 'palletFee', labelKey: 'pallet_fee' },
    { key: 'jumboBagFee', labelKey: 'jumbo_bag_fee' },
    { key: 'amsFee', labelKey: 'AMS' }
  ],
  customs: [
    { key: 'customsTeamFee', labelKey: 'customs_teams_fees' },
    { key: 'customsReceptionFee', labelKey: 'hq_reception_team_fee' },
    { key: 'clearanceCost', labelKey: 'customs_clearance_costs' }
  ],
  financial: [
    { key: 'interestCost', labelKey: 'loan_interest_expenses' },
    { key: 'vatInterestCost', labelKey: 'interest_expense_vat' },
    { key: 'exchangeRateCost', labelKey: 'exchange_rate_diffenece_cost' },
    { key: 'dhlFee', labelKey: 'bidv_collect_dhl_fees' },
    { key: 'brokerageFee', labelKey: 'brokerage_fees' },
    { key: 'taxRefundCost', labelKey: 'refund_fee_3_total_refund_value' }
  ],
  management: [
    { key: 'qcCost', labelKey: 'qc_costs' },
    { key: 'generalManagementCost', labelKey: 'general_management_costs' }
  ]
};

// ==============================|| BASIC ORDER - COSTS ||============================== //
interface CostRow {
  code: string;
  status: number;
  lastUpdatedProgram: string;
  businessPlanId: number;
  totalFreightEbs: number;
  factoryToPortCost: number;
  warehouseRentalCost: number;
  truckingCost: number;
  localCharges: number;
  earlyUnloadingFee: number;
  thcFee: number;
  sealFee: number;
  infrastructureFee: number;
  customsSupervisionFee: number;
  fumigationPerContainer: number;
  fumigationPerLot: number;
  quarantineFee: number;
  ttFee: number;
  coFee: number;
  doFee: number;
  palletFee: number;
  jumboBagFee: number;
  amsFee: number;
  customsTeamFee: number;
  customsReceptionFee: number;
  clearanceCost: number;
  interestCost: number;
  vatInterestCost: number;
  exchangeRateCost: number;
  dhlFee: number;
  brokerageFee: number;
  taxRefundCost: number;
  qcCost: number;
  generalManagementCost: number;
  currency: string;
}
type Child1Props = {
  id: any;
  isView: boolean;
  dataForm: any;
  businessPlanId: number;
  onCallParent: (data?: any) => void;
  onCallBack: () => void;
};
export default function Costs({ id, isView, dataForm, businessPlanId, onCallParent, onCallBack }: Child1Props) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const formCostInfo = useSelector(costInfoSelector);
  const successCostInfo = useSelector(successCostSelector);
  const failCostInfo = useSelector(errorCostSelector);

  useEffect(() => {
    if (isView && id) {
      if (dataForm && Object.keys(dataForm).length > 0) {
        LIST_KEYS.forEach((key) => {
          dispatch(updateCostField(key, dataForm[key]));
        });
      }
      dispatch(getCostByID(id));
    } else {
      dispatch(resetCostInfo());
    }
  }, [id]);

  // Tự động lưu data khi có thay đổi
  useEffect(() => {
    if (formCostInfo && Object.keys(formCostInfo).length > 0) {
      onCallParent(formCostInfo);
    }
  }, [formCostInfo, onCallParent]);

  // Lưu data khi component unmount
  useEffect(() => {
    return () => {
      if (formCostInfo && Object.keys(formCostInfo).length > 0) {
        onCallParent(formCostInfo);
      }
    };
  }, [formCostInfo, onCallParent]);

  const handleInputChange = (field: keyof CostRow, value: string | number) => {
    // Xử lý trường hợp input trống
    const processedValue = value === '' ? undefined : value;
    dispatch(updateCostField(field, processedValue));
  };

  // Render cost table
  const renderCostTable = (section: string, labels: any[], sectionData: any) => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>{intl.formatMessage({ id: 'cost_name' })}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>{intl.formatMessage({ id: 'reference_price' })}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>{intl.formatMessage({ id: 'actual_price' })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labels.map((item) => (
              <TableRow key={item.key}>
                <TableCell sx={{ width: '50%' }}>{intl.formatMessage({ id: item.labelKey })}</TableCell>
                <TableCell sx={{ width: '25%' }}>
                  <Typography variant="body1" color="text.secondary">
                    {sectionData[item.key] || '0'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: '25%' }}>
                  <TextField
                    type="number"
                    size="medium"
                    placeholder={intl.formatMessage({ id: 'enter_actual_price' })}
                    fullWidth
                    value={formCostInfo[item.key] ?? ''}
                    onChange={(e) => handleInputChange(item.key as keyof CostRow, Number(parseFormattedNumber(e.target.value)))}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          {intl.formatMessage({ id: 'cost' })}
        </Typography>

        {/* Chi phí logistic */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
          {intl.formatMessage({ id: 'logistic_costs' })}
        </Typography>
        <Grid container spacing={3}>
          <Grid size={12}>{renderCostTable('logistic', costLabels.logistic, mockReferenceData.logistic)}</Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Chi phí hải quan */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
          {intl.formatMessage({ id: 'customs_costs' })}
        </Typography>
        <Grid container spacing={3}>
          <Grid size={12}>{renderCostTable('customs', costLabels.customs, mockReferenceData.customs)}</Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Chi phí tài chính */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
          {intl.formatMessage({ id: 'financial_costs' })}
        </Typography>
        <Grid container spacing={3}>
          <Grid size={12}>{renderCostTable('financial', costLabels.financial, mockReferenceData.financial)}</Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Chi phí quản lý */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
          {intl.formatMessage({ id: 'management_costs' })}
        </Typography>
        <Grid container spacing={3}>
          <Grid size={12}>{renderCostTable('management', costLabels.management, mockReferenceData.management)}</Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Currency field */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
          {intl.formatMessage({ id: 'other_information' })}
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'currency' })}</InputLabel>
              <TextField
                required
                value={formCostInfo.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                id="currency"
                name="currency"
                placeholder={intl.formatMessage({ id: 'currency' })}
                fullWidth
              />
            </Stack>
          </Grid>
        </Grid>
      </>
    </>
  );
}
