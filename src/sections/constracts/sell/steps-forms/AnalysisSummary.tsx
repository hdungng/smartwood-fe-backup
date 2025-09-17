import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useIntl } from 'react-intl';
import { enqueueSnackbar } from 'notistack';

// @components
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Button, CircularProgress } from '@mui/material';

// @utils
import axiosServices from 'utils/axios';
import { BUSINESS_PLAN_API } from 'api/constants';

export default function AnalysisSummary({
  isView,
  dataForm,
  businessPlanId = 0,
  draftPoId = 0,
  contractId = 0
}: {
  isView: boolean;
  dataForm: any;
  businessPlanId: number;
  draftPoId: number;
  contractId: number;
}) {
  const intl = useIntl();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBtn, setLoadingBtn] = useState<boolean>(false);
  const [totalRevenueExcludingVAT, setTotalRevenueExcludingVAT] = useState<number>(0);
  const [actualBusinessProfit, setActualBusinessProfit] = useState<number>(0);

  const [profitMarginPercentage, setProfitMarginPercentage] = useState<number>(0);
  const [breakEvenPrice, setBreakEvenPrice] = useState<number>(0);

  useEffect(() => {
    // if (isView) {
    //   setTotalRevenueExcludingVAT(dataForm?.totalRevenueExcludingVAT)
    //   setActualBusinessProfit(dataForm?.actualBusinessProfit)
    //   setProfitMarginPercentage(dataForm?.profitMarginPercentage)
    //   setBreakEvenPrice(dataForm?.breakEvenPrice)
    // } else {
    //   getAnalysisBusinessPlanId(businessPlanId)
    // }
    getAnalysisBusinessPlanId(businessPlanId);
  }, []);

  const getAnalysisBusinessPlanId = async (id: number = 0) => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, status } = await axiosServices.get(BUSINESS_PLAN_API.ANALYSIS_BUSINESS_PLAN + `/${id}`);
      // console.log("getAnalysisBusinessPlanId___", data, status)
      if (status === 200 || status === 201) {
        setTotalRevenueExcludingVAT(data.data.totalRevenueExcludingVAT ?? 0);
        setActualBusinessProfit(data.data.actualBusinessProfit ?? 0);
        setProfitMarginPercentage(data.data.profitMarginPercentage ?? 0);
        setBreakEvenPrice(data.data.breakEvenPrice ?? 0);
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!draftPoId || !contractId || !businessPlanId) {
      enqueueSnackbar(intl.formatMessage({ id: 'order_error' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }
    try {
      setLoadingBtn(true);
      const payload = {
        // "code": "string",
        // "status": 0,
        // "lastUpdatedProgram": "string",
        // "contractId": 0,
        // "codeBooking": 0,
        // "totalQuantity": 0,
        // "expectedPrice": 0,
        // "currency": "string",
        // "isApprove": 0,
        draftPoId: draftPoId,
        contractId: contractId,
        totalRevenueExcludingVat: totalRevenueExcludingVAT,
        breakEvenPrice: breakEvenPrice,
        actualBusinessProfit: actualBusinessProfit,
        profitMarginPercentage: profitMarginPercentage
      };
      const { data, status } = await axiosServices.put(BUSINESS_PLAN_API.BUSINESS_PLAN + `/${businessPlanId}`, payload);
      // console.log("handleSubmit__getAnalysisBusinessPlanId___", data, status)
      if (status === 201 || status === 200) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        setTimeout(() => navigate('/business-plan/approve'), 1000);
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      setLoadingBtn(false);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setLoadingBtn(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 170
        }}
      >
        <CircularProgress size={50} />
      </div>
    );
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        {intl.formatMessage({ id: 'summary_of_analysis' })}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'total_contract_revenue_ex_vat' })}</InputLabel>
            <TextField
              type="number"
              value={totalRevenueExcludingVAT}
              required
              id="totalRevenueExcludingVAT"
              name="totalRevenueExcludingVAT"
              placeholder={intl.formatMessage({
                id: 'total_contract_revenue_ex_vat'
              })}
              fullWidth
              onChange={(v) => setTotalRevenueExcludingVAT(Number(v.target?.value ?? 0))}
              // slotProps={{
              //   input: { readOnly: true }
              // }}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>
              {intl.formatMessage({
                id: 'break_even_point_min_selling_price_ex_vat'
              })}
            </InputLabel>
            <TextField
              // slotProps={{
              //   input: { readOnly: true }
              // }}
              type="number"
              value={breakEvenPrice}
              required
              id="breakEvenPrice"
              name="breakEvenPrice"
              placeholder={intl.formatMessage({
                id: 'break_even_point_min_selling_price_ex_vat'
              })}
              fullWidth
              onChange={(v) => setBreakEvenPrice(Number(v.target?.value ?? 0))}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'actual_operating_profit' })}</InputLabel>
            <TextField
              // slotProps={{
              //   input: { readOnly: true }
              // }}
              type="number"
              value={actualBusinessProfit}
              required
              id="actualBusinessProfit"
              name="actualBusinessProfit"
              placeholder={intl.formatMessage({
                id: 'actual_operating_profit'
              })}
              fullWidth
              onChange={(v) => setActualBusinessProfit(Number(v?.target?.value ?? 0))}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'profit_rate' })}</InputLabel>
            <TextField
              // slotProps={{
              //   input: { readOnly: true }
              // }}
              type="number"
              value={profitMarginPercentage}
              required
              id="profitMarginPercentage"
              name="profitMarginPercentage"
              placeholder={intl.formatMessage({ id: 'profit_rate' })}
              fullWidth
              onChange={(v) => setProfitMarginPercentage(Number(v.target?.value ?? 0))}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
