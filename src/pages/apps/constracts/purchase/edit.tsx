import { PURCHASE_CONTRACT_API } from 'api/constants';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useTheme } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import useMediaQuery from '@mui/material/useMediaQuery';
import axiosServices from 'utils/axios';

// @components
import MainCard from 'components/MainCard';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import ContractsForm from 'sections/constracts/purchase/steps-forms/constract/ConstractForm';
import LogisticForm from 'sections/constracts/purchase/steps-forms/logistic/LogisticForm';
import WeightSlipForm from 'sections/constracts/purchase/steps-forms/weight-slip/WeightSlipForm';
import AnimateButton from 'components/@extended/AnimateButton';
import { TPOBuy } from 'types/contracts/purchase/po_buy';

const steps = ['order_payment_information', 'logistics_information', 'weighing_card_and_actual_weight'];

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

export const EditPurchaseStepsForm = () => {
  const { id } = useParams();
  const theme = useTheme();
  const intl = useIntl();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [detailContract, setDetailContract] = useState<TPOBuy>();
  // const [contractData, setContractData] =
  //   useState<ContractFormValues>(defaultContractData);
  // const [logisticData, setLogisticData] =
  //   useState<LogisticFormValues>(defaultLogisticData);
  // const [paymentData, setPaymentData] =
  //   useState<PaymentFormValues>(defaultPaymentData);
  // const [weightSlipData, setWeightSlipData] = useState<WeightSlipFormValues>(
  //   defaultWeightSlipData
  // );

  const contractFormRef = useRef<any>(null);
  const logisticFormRef = useRef<any>(null);
  const weightSlipFormRef = useRef<any>(null);

  useEffect(() => {
    fetchPurchaseContractById();
  }, []);

  const fetchPurchaseContractById = async () => {
    if (!id) return;
    try {
      const { data, status } = await axiosServices.get(PURCHASE_CONTRACT_API.GET_BY_ID + `/${id}`);
      if (status === 200 || status === 201) {
        setDetailContract(data.data);
      }
    } catch (error) {
      console.log('FETCH FAIL!');
    }
  };
  // console.log("detailContract___", detailContract)
  // Return the appropriate step content component
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ContractsForm
            ref={contractFormRef}
            onMoveToNewStep={() => setActiveStep(activeStep + 1)}
            detailContract={detailContract}
            onRefreshData={() => fetchPurchaseContractById()}
            // initialValues={contractData}
          />
        );
      case 1:
        return (
          <LogisticForm
            ref={logisticFormRef}
            // initialValues={logisticData}
          />
        );
      // case 2:
      //   return <PaymentForm
      //            ref={paymentFormRef}
      //            initialValues={paymentData}
      //          />;
      case 2:
        return <WeightSlipForm ref={weightSlipFormRef} />;
      default:
        throw new Error('Unknown step');
    }
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
    scrollToTop();
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    scrollToTop();
  };

  return (
    <MainCard title="" sx={{ width: '100%' }} style={{ fontSize: '20px' }}>
      {isMobile ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              sx={{
                pt: 3,
                pb: 5,
                '& .MuiStepLabel-root': {
                  cursor: 'pointer'
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label} /* onClick={() => setActiveStep(index)} */>
                  <StepLabel>{intl.formatMessage({ id: label })}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            {getStepContent(activeStep)}
            <Stack
              direction="row"
              sx={{
                justifyContent: activeStep !== 0 ? 'space-between' : 'flex-end'
              }}
            >
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ my: 3, ml: 1 }}>
                  {intl.formatMessage({ id: 'common_goback' })}
                </Button>
              )}
              <AnimateButton>
                <Button variant="contained" onClick={handleNext} sx={{ my: 3, ml: 1 }}>
                  {activeStep === steps.length - 1
                    ? intl.formatMessage({ id: 'common_button_completed' })
                    : intl.formatMessage({ id: 'common_button_continue' })}
                </Button>
              </AnimateButton>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label, index) => (
              <Step
                style={{ cursor: 'pointer' }}
                key={label}
                // onClick={() => setActiveStep(index)}
              >
                <StepLabel>{intl.formatMessage({ id: label })}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
          {activeStep !== 0 && (
            <Stack
              direction="row"
              sx={{
                justifyContent: activeStep !== 0 ? 'space-between' : 'flex-end'
              }}
            >
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ my: 3, ml: 1 }}>
                  {intl.formatMessage({ id: 'common_goback' })}
                </Button>
              )}
              <AnimateButton>
                <Button variant="contained" onClick={handleNext} sx={{ my: 3, ml: 1 }}>
                  {activeStep === steps.length - 1
                    ? intl.formatMessage({ id: 'common_button_completed' })
                    : intl.formatMessage({ id: 'common_button_continue' })}
                </Button>
              </AnimateButton>
            </Stack>
          )}
        </>
      )}
    </MainCard>
  );
};
