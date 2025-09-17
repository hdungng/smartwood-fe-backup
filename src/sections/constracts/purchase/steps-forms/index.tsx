import { useRef, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import ContractsForm from '../../../constracts/purchase/steps-forms/constract/ConstractForm';
import LogisticForm from '../../../constracts/purchase/steps-forms/logistic/LogisticForm';
import WeightSlipForm from '../../../constracts/purchase/steps-forms/weight-slip/WeightSlipForm';
import { useDispatch, useSelector } from 'react-redux';
import { actionUpdatePurchaseContractByID, TWeightSlipState, weightTicketSelector } from 'redux/WeightSlip';
import { logisticSelector, TLogisticState } from 'redux/Logistic';
import { ContractStatus } from 'redux/Contract/constant';
import { useIntl } from 'react-intl';
// step options
const steps = ['order_payment_information', 'logistics_information', 'weighing_card_and_actual_weight'];

// Define types for form values to ensure type safety
interface ContractFormValues {
  contractNumber: string;
  taxCode: string;
  sellerName: string;
  sellerAddress: string;
  sellerRepresentative: string;
  sellerPhone: string;
  buyerName: string;
  buyerTaxCode: string;
  buyerAddress: string;
  buyerRepresentative: string;
  buyerPhone: string;
  contractDate: Date;
  goodsType: string;
  goodsDescription: string;
  paymentTerms: string;
  deliveryTerms: string;
  contractDetails: string;
  allowableError: string;
  powerPlantName: string;
  containerVolume: string;
  deliveryPort: string;
  receiptPort: string;
  currency: string;
  price: string;
  unit: string;
  totalVolume: string;
  saveContract: boolean;
  // Bank information
  sellerBeneficiary: string;
  sellerBankName: string;
  sellerBankAddress: string;
  sellerBankAccount: string;
  sellerSwiftCode: string;
  buyerBeneficiary: string;
  buyerBankName: string;
  buyerBankAddress: string;
  buyerBankAccount: string;
  buyerSwiftCode: string;
  // LC information
  lcNumber: string;
  lcDate: Date;
  // Additional fields
  saveSellerBank: boolean;
  saveBuyerBank: boolean;
  existingContractNumber: string;
  goodsItems: any[];
}

interface FactoryType {
  factoryName: string;
  quantity: string;
  price: string;
  qualityType: string;
  shipName: string;
  loadingTimeFrom: Date | null;
  loadingTimeTo: Date | null;
}

interface ProductType {
  goodsName: string;
  factories: FactoryType[];
}

interface LogisticFormValues {
  bookingNumber: string;
  bookingCode: string;
  containerQuantity: string;
  etaDate: Date | null;
  etdDate: Date | null;
  shipName: string;
  forwarderName: string;
  shippingLineName: string;
  yardDate: Date | null;
  cutoffDate: Date | null;
  region: string;
  portName: string;
  cargoType: string;
  shippingNote: string;
  selectedBookingCode: string;
  products: ProductType[];
  totalQuantity: string;
  totalPrice: string;
  averagePrice: string;
  contractNumber: string;
  qualityType: string;
}

interface FactoryPaymentType {
  factoryName: string;
  quantity: string;
  price: string;
  amount: string;
  remainingAmount?: string;
  advanceDays?: string;
  note?: string;
}

interface PaymentFormValues {
  contractNumber: string;
  bookingNumber: string;
  advanceDate: Date;
  paymentPurpose: string;
  factoryPayments: FactoryPaymentType[];
  totalQuantity: string;
  totalAmount: string;
  notes: string;
}

interface WeightSlipRowType {
  booking: any;
  goodsType: any;
  loadingDate: Date | null;
  factory: any;
  weight: string;
  goodsPrice: string;
  transporter: any;
  transportPrice: string;
  yard: string;
  carPlate: string;
  containerNo: string;
  sealNo: string;
  priceWarning: boolean;
}

interface WeightSlipFormValues {
  contract: any;
  rows: WeightSlipRowType[];
  bookingCode: string;
  goodsType: string;
  loadingDate: Date | null;
  factory: string;
  weight: string;
  goodsPrice: string;
  transporter: string;
  transportPrice: string;
  yard: string;
  carPlate: string;
  containerNo: string;
  sealNo: string;
  coverBookingCode: string;
  coveredFactory: string;
  supplyingFactory: string;
  coverQualityType: string;
  coverQuantity: string;
  totalWeight: string;
  avgGoodsPrice: string;
  closingBookingCode: string;
  closingCarPlate: string;
  closingContainerNo: string;
  closingSealNo: string;
  closingWeight: string;
  closingAdjustedWeight: string;
  invoice: string;
  packingList: string;
  cq: string;
  si: string;
  vgm: string;
  woodList: string;
  customsDoc1: string;
  customsDoc2: string;
  customsDoc3: string;
  coDoc1: string;
  coDoc2: string;
  paymentBookingCode: string;
  paymentFactory: string;
  paymentQuantity: string;
  paymentUnitPrice: string;
  advancePaymentDate: Date | null;
  serviceProvider: string;
  serviceType: string;
  serviceUnitPrice: string;
  serviceTotalAmount: string;
}

// ==============================|| FORMS WIZARD - BASIC ||============================== //

export default function ContractPurchaseStepsForm() {
  const theme = useTheme();
  const intl = useIntl();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const logistic: TLogisticState = useSelector(logisticSelector);
  // Refs for each form to access their methods
  const contractFormRef = useRef<any>(null);
  const logisticFormRef = useRef<any>(null);
  const paymentFormRef = useRef<any>(null);
  const weightSlipFormRef = useRef<any>(null);

  // Default initial values for each form
  const defaultContractData: ContractFormValues = {
    contractNumber: '',
    taxCode: '',
    sellerName: '',
    sellerAddress: '',
    sellerRepresentative: '',
    sellerPhone: '',
    buyerName: '',
    buyerTaxCode: '',
    buyerAddress: '',
    buyerRepresentative: '',
    buyerPhone: '',
    contractDate: new Date(),
    goodsType: '',
    goodsDescription: '',
    paymentTerms: '',
    deliveryTerms: '',
    contractDetails: '',
    allowableError: '',
    powerPlantName: '',
    containerVolume: '',
    deliveryPort: '',
    receiptPort: '',
    currency: '',
    price: '',
    unit: '',
    totalVolume: '',
    saveContract: false,
    sellerBeneficiary: '',
    sellerBankName: '',
    sellerBankAddress: '',
    sellerBankAccount: '',
    sellerSwiftCode: '',
    buyerBeneficiary: '',
    buyerBankName: '',
    buyerBankAddress: '',
    buyerBankAccount: '',
    buyerSwiftCode: '',
    lcNumber: '',
    lcDate: new Date(),
    saveSellerBank: false,
    saveBuyerBank: false,
    existingContractNumber: '',
    goodsItems: []
  };

  const defaultLogisticData: LogisticFormValues = {
    bookingNumber: '',
    bookingCode: '',
    containerQuantity: '',
    etaDate: null,
    etdDate: null,
    shipName: '',
    forwarderName: '',
    shippingLineName: '',
    yardDate: null,
    cutoffDate: null,
    region: '',
    portName: '',
    cargoType: '',
    shippingNote: '',
    selectedBookingCode: '',
    products: [
      {
        goodsName: '',
        factories: [
          {
            factoryName: '',
            quantity: '',
            price: '',
            loadingTimeFrom: null,
            loadingTimeTo: null,
            qualityType: '',
            shipName: ''
          }
        ]
      }
    ],
    totalQuantity: '',
    totalPrice: '',
    averagePrice: '',
    contractNumber: '',
    qualityType: ''
  };

  const defaultPaymentData: PaymentFormValues = {
    contractNumber: '',
    bookingNumber: '',
    advanceDate: new Date(),
    paymentPurpose: '',
    factoryPayments: [
      {
        factoryName: '',
        quantity: '',
        price: '',
        amount: '0',
        remainingAmount: '0'
      }
    ],
    totalQuantity: '0',
    totalAmount: '0',
    notes: ''
  };

  const defaultWeightSlipData: WeightSlipFormValues = {
    contract: null,
    rows: [],
    bookingCode: '',
    goodsType: '',
    loadingDate: null,
    factory: '',
    weight: '',
    goodsPrice: '',
    transporter: '',
    transportPrice: '',
    yard: '',
    carPlate: '',
    containerNo: '',
    sealNo: '',
    coverBookingCode: '',
    coveredFactory: '',
    supplyingFactory: '',
    coverQualityType: '',
    coverQuantity: '',
    totalWeight: '',
    avgGoodsPrice: '',
    closingBookingCode: '',
    closingCarPlate: '',
    closingContainerNo: '',
    closingSealNo: '',
    closingWeight: '',
    closingAdjustedWeight: '',
    invoice: '',
    packingList: '',
    cq: '',
    si: '',
    vgm: '',
    woodList: '',
    customsDoc1: '',
    customsDoc2: '',
    customsDoc3: '',
    coDoc1: '',
    coDoc2: '',
    paymentBookingCode: '',
    paymentFactory: '',
    paymentQuantity: '',
    paymentUnitPrice: '',
    advancePaymentDate: null,
    serviceProvider: '',
    serviceType: '',
    serviceUnitPrice: '',
    serviceTotalAmount: ''
  };

  // State to store form values
  const [contractData, setContractData] = useState<ContractFormValues>(defaultContractData);
  const [logisticData, setLogisticData] = useState<LogisticFormValues>(defaultLogisticData);
  const [paymentData, setPaymentData] = useState<PaymentFormValues>(defaultPaymentData);
  const [weightSlipData, setWeightSlipData] = useState<WeightSlipFormValues>(defaultWeightSlipData);

  const handleNext = () => {
    // Validate and collect data from the current step before proceeding
    if (activeStep === 0 && contractFormRef.current) {
      contractFormRef.current.submitForm().then((errors: any) => {
        if (Object.keys(errors).length === 0) {
          setContractData(contractFormRef.current.getValues());
          setActiveStep(activeStep + 1);
        }
      });
    } else if (activeStep === 1 && logisticFormRef.current) {
      logisticFormRef.current.submitForm().then((errors: any) => {
        if (Object.keys(errors).length === 0) {
          setLogisticData(logisticFormRef.current.getValues());
          setActiveStep(activeStep + 1);
        }
      });
    } else if (activeStep === 2) {
      // paymentFormRef.current.submitForm().then((errors: any) => {
      //   if (Object.keys(errors).length === 0) {
      //     setPaymentData(paymentFormRef.current.getValues());
      //     setActiveStep(activeStep + 1);
      //   }
      // });
      handleFinishChange();
      setActiveStep(activeStep + 1);
    } else if (activeStep === 3) {
      // Submit data to API
      handleSubmitToAPI();
      setActiveStep(activeStep + 1);
    } else {
      setActiveStep(activeStep + 1);
    }

    scrollToTop();
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    scrollToTop();
  };

  // Function to handle submitting all data to API
  const handleSubmitToAPI = () => {
    // Combine all form data
    const completeFormData = {
      contractData,
      logisticData,
      paymentData
    };

    // In a real implementation, you would add something like:
    // api.postContract(completeFormData)
    //   .then(response => console.log('Success:', response))
    //   .catch(error => console.error('Error:', error));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Return the appropriate step content component
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ContractsForm
            ref={contractFormRef}
            onMoveToNewStep={() => setActiveStep(activeStep + 1)}
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

  const handleFinishChange = () => {
    if (activeStep === steps.length - 1) {
      dispatch(
        actionUpdatePurchaseContractByID({
          id: logistic.purchaseContract.id,
          data: {
            status: ContractStatus.APPROVED
          }
        })
      );
    }
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
}
