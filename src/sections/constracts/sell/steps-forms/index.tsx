import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

// material-ui
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';

// project imports
import TransactionInformation from './TransactionInformation';
import SupplierInformation from './SupplierInformation';
import Costs from './Costs';
import AnalysisSummary from './AnalysisSummary';
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';

// types
import { BusinessPlan } from 'types/business-plan';
import axiosServices from 'utils/axios';
import { BUSINESS_PLAN_API } from 'api/constants';
import { useDispatch, useSelector } from 'react-redux';
import { resetSupplierInfoForm } from 'redux/SupplierInfo';
import { errorTransactionSelector, resetTransactionInfo, saveTransactionInfo, transactionInfoSelector } from 'redux/TransactionForm';
import { resetCostInfo } from 'redux/CostInfo';
import * as _ from 'lodash';
import { useIntl } from 'react-intl';
import { isObjectDifferent } from 'utils';
import useBusinessPlanTransactionInfo from 'api/businessPlanTransactionInfo';
import { BUSSINESS_PLAN_SUPLIER } from 'api/CommonAPI/BusinessPlan';
import moment from 'moment';

//redux
import { costInfoSelector, errorCostSelector, saveCostInfo, successCostSelector, updateCostField } from 'redux/CostInfo';

// step options
const steps = ['transaction_information', 'supplier_information', 'cost', 'summary_of_analysis'];

export default function SellStepsForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { id } = useParams();
  const intl = useIntl();
  const failCostInfo = useSelector(errorCostSelector);

  const formTransactionInfo = useSelector(transactionInfoSelector);
  const failTransactionInfo = useSelector(errorTransactionSelector);

  // Use business plan transaction info hook
  const { create: createTransactionInfo, update: updateTransactionInfo } = useBusinessPlanTransactionInfo();

  const [activeStep, setActiveStep] = useState(0);
  const [detailBusinessPlan, setDetailBusinessPlan] = useState<BusinessPlan>();

  const [errors, setErrors] = useState<{
    [key in keyof {
      exchangeRateBuy: number;
      exchangeRateSell: number;
      shippingMethod: string;
      packingMethod: string;
      weightPerContainer: number;
      estimatedTotalContainers: number;
      estimatedTotalBookings: number;
    }]?: string;
  }>({});

  const formTransactionInfoTemp = useRef({});

  // Lưu trữ data của SupplierInformation để không bị mất khi chuyển step
  const [supplierData, setSupplierData] = useState<any>([]);

  // Lưu trữ data của TransactionInformation để không bị mất khi chuyển step
  const [transactionData, setTransactionData] = useState<any>(null);
  // Lưu trữ data của Costs để không bị mất khi chuyển step
  const [costData, setCostData] = useState<any>(null);
  console.log('costData', costData);

  // Initial setup - only run once when component mounts
  useEffect(() => {
    if (id && state?.isView) {
      getBusinessPlanDetail(Number(id));
    } else {
      // Reset data when creating new
      dispatch(resetSupplierInfoForm(), resetTransactionInfo(), resetCostInfo());
    }
  }, [id, state?.isView]); // Only run when id or isView changes, not on every step change

  // Handle step changes - don't reset data unnecessarily
  useEffect(() => {
    // Only reset if we're creating new and switching steps (optional logic)
    if (!state?.isView && !id) {
      // Could add specific logic here if needed
    }
  }, [activeStep]);

  const getBusinessPlanDetail = async (business_plan_id: number) => {
    if (!business_plan_id) return;
    try {
      const { data, status } = await axiosServices.get(BUSINESS_PLAN_API.BUSINESS_PLAN + `/${business_plan_id}`);
      if (status === 200 || status === 201) {
        setDetailBusinessPlan(data?.data);
        formTransactionInfoTemp.current = {
          estimatedTotalBookings: data?.data?.businessPlanTransactionInfoItem?.estimatedTotalBookings,
          estimatedTotalContainers: data?.data?.businessPlanTransactionInfoItem?.estimatedTotalContainers,
          exchangeRateBuy: data?.data?.businessPlanTransactionInfoItem?.exchangeRateBuy,
          exchangeRateSell: data?.data?.businessPlanTransactionInfoItem?.exchangeRateSell,
          packingMethod: data?.data?.businessPlanTransactionInfoItem?.packingMethod,
          shippingMethod: data?.data?.businessPlanTransactionInfoItem?.shippingMethod,
          weightPerContainer: data?.data?.businessPlanTransactionInfoItem?.weightPerContainer
        };
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };
  const getStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return (
            <TransactionInformation
              id={detailBusinessPlan?.id}
              isView={state?.isView}
              dataForm={detailBusinessPlan?.businessPlanTransactionInfoItem}
              errors={errors}
              currency={state?.currency ? state.currency.toLowerCase() : ''}
              unitOfMeasure={state?.unitOfMeasure ? state.unitOfMeasure.toLowerCase() : ''}
              onCallParent={(data) => {
                setTransactionData(data);
              }}
            />
          );
        case 1:
          return (
            <SupplierInformation
              id={detailBusinessPlan?.id}
              isView={state?.isView}
              dataForm={detailBusinessPlan?.businessPlanSupplierItems}
              businessPlanId={id || state?.businessPlanId}
              onCallParent={(data) => {
                setSupplierData(data);
                // Không tự động gọi handleNext, để người dùng điều khiển
              }}
              onCallBack={handleBack}
            />
          );
        case 2:
          return (
            <Costs
              id={detailBusinessPlan?.businessPlanCostItem?.id}
              isView={state?.isView}
              dataForm={costData || detailBusinessPlan?.businessPlanCostItem}
              businessPlanId={id || state?.businessPlanId}
              onCallParent={(data) => {
                setCostData(data);
                // Không tự động gọi handleNext, để người dùng điều khiển
              }}
              onCallBack={handleBack}
            />
          );
        case 3:
          return (
            <AnalysisSummary
              isView={state?.isView}
              dataForm={{
                totalRevenueExcludingVat: detailBusinessPlan?.totalRevenueExcludingVat,
                breakEvenPrice: detailBusinessPlan?.breakEvenPrice,
                actualBusinessProfit: detailBusinessPlan?.actualBusinessProfit,
                profitMarginPercentage: detailBusinessPlan?.profitMarginPercentage
              }}
              contractId={state?.isView ? detailBusinessPlan?.contractId : state?.contractId}
              businessPlanId={id || state?.businessPlanId}
              draftPoId={state?.isView ? detailBusinessPlan?.draftPoId : state?.draftPO}
            />
          );
        default:
          throw new Error('Unknown step');
      }
    },
    [activeStep, detailBusinessPlan?.id, errors, transactionData, supplierData, costData]
  );

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        if (state?.isView) {
          // Trong chế độ view, chỉ chuyển step mà không gọi API
          setActiveStep(activeStep + 1);
        } else {
          callCreateTransactionInfo();
        }
        break;
      case 1:
        // Step 1: Supplier Information - lưu data và chuyển step
        // Đảm bảo rằng supplier data được lưu trước khi chuyển step
        if (state?.isView) {
          setActiveStep(activeStep + 1);
        } else {
          if (supplierData) {
            for (let i = 0; i < supplierData.length; i++) {
              createSingleSuppllier(supplierData[i]);
            }

            setActiveStep(activeStep + 1);
          } else {
            enqueueSnackbar(intl.formatMessage({ id: 'common_require_fill' }), {
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: { horizontal: 'right', vertical: 'top' }
            });
          }
        }
        break;
      case 2:
        // Step 2: Costs - lưu data và chuyển step
        // Đảm bảo rằng cost data được lưu trước khi chuyển step
        if (state?.isView) {
          setActiveStep(activeStep + 1);
        } else {
          if (costData) {
            // createSingleSuppllier(supplierData);
            submitCost();
            setActiveStep(activeStep + 1);
          } else {
            enqueueSnackbar(intl.formatMessage({ id: 'common_require_fill' }), {
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: { horizontal: 'right', vertical: 'top' }
            });
          }
        }
        break;
      case 3:
        // Step 3: Analysis Summary - cho phép cập nhật trong view mode
        if (state?.isView) {
          console.log('View mode - updating business plan');
          handleUpdateFormData();
        } else {
          console.log('Completing form at Analysis Summary step');
          console.log('State:', state);
          console.log('DetailBusinessPlan:', detailBusinessPlan);
          console.log('ID:', id);
          // Gọi API để hoàn thành business plan
          handleCompleteBusinessPlan();
        }
        break;
      default:
        setActiveStep(activeStep + 1);
        return;
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => {
      return prevStep - 1;
    });
    // Force re-render
    setTimeout(() => {}, 0);
  };

  const validateCustomerInfo = (data: {
    exchangeRateBuy: number;
    exchangeRateSell: number;
    shippingMethod: string;
    packingMethod: string;
    weightPerContainer: number;
    estimatedTotalContainers: number;
    estimatedTotalBookings: number;
  }) => {
    const newErrors: { [key in keyof any]?: string } = {};
    if (!data.exchangeRateBuy)
      newErrors.exchangeRateBuy = intl.formatMessage({
        id: 'exchangeRateBuy_required'
      });
    if (!data.exchangeRateSell)
      newErrors.exchangeRateSell = intl.formatMessage({
        id: 'exchangeRateSell_required'
      });
    if (!data.shippingMethod)
      newErrors.shippingMethod = intl.formatMessage({
        id: 'shippingMethod_required'
      });
    if (!data.packingMethod)
      newErrors.packingMethod = intl.formatMessage({
        id: 'packingMethod_required'
      });
    if (!data.weightPerContainer)
      newErrors.weightPerContainer = intl.formatMessage({
        id: 'weightPerContainer_required'
      });
    if (!data.estimatedTotalContainers)
      newErrors.estimatedTotalContainers = intl.formatMessage({
        id: 'estimatedTotalContainers_required'
      });
    if (!data.estimatedTotalBookings)
      newErrors.estimatedTotalBookings = intl.formatMessage({
        id: 'estimatedTotalBookings_required'
      });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const callCreateTransactionInfo = async () => {
    // Use transactionData if available, otherwise use formTransactionInfo from Redux
    const dataToValidate = transactionData || formTransactionInfo;

    if (!validateCustomerInfo(dataToValidate)) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_require_fill' }), {
        autoHideDuration: 3000,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    // HANDLE FOR UPDATE - PUT
    if (state?.isView && id) {
      if (!isObjectDifferent(formTransactionInfoTemp.current, dataToValidate)) {
        // Data không thay đổi, chỉ chuyển step
        setActiveStep(activeStep + 1);
        return;
      } else {
        // If no existing transaction info ID, create new one
        if (!detailBusinessPlan?.businessPlanTransactionInfoItem?.id) {
          try {
            const createdTransactionInfo = await createTransactionInfo({
              ...formTransactionInfo,
              businessPlanId: Number(id)
            });

            // Update detail business plan with newly created transaction info
            setDetailBusinessPlan((prev) => ({
              ...prev!,
              businessPlanTransactionInfoItem: createdTransactionInfo
            }));

            setActiveStep(activeStep + 1);
            enqueueSnackbar(intl.formatMessage({ id: 'create_tracsaction_infor_success' }), {
              variant: 'success',
              autoHideDuration: 3000,
              anchorOrigin: { horizontal: 'right', vertical: 'top' }
            });
          } catch (error) {
            console.log('CREATE TRANSACTION INFO FAIL!', error);
            enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
              autoHideDuration: 2500,
              variant: 'error',
              anchorOrigin: { horizontal: 'right', vertical: 'top' }
            });
          }
          return;
        }

        // Update existing transaction info
        try {
          const updatedTransactionInfo = await updateTransactionInfo(
            detailBusinessPlan.businessPlanTransactionInfoItem.id,
            formTransactionInfo
          );

          // Update detail business plan with updated transaction info
          setDetailBusinessPlan((prev) => ({
            ...prev!,
            businessPlanTransactionInfoItem: updatedTransactionInfo
          }));

          setActiveStep(activeStep + 1);
          enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        } catch (error) {
          console.log('UPDATE TRANSACTION INFO FAIL!', error);
          enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
            autoHideDuration: 2500,
            variant: 'error',
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }
      }
      return;
    }
    // HANDLE FOR CREATE - POST
    dispatch(
      saveTransactionInfo({
        ...dataToValidate,
        businessPlanId: id || state?.businessPlanId
      })
    );
    if (!_.isEmpty(failTransactionInfo)) {
      enqueueSnackbar(failTransactionInfo, {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
      return;
    }
    // if (successTransactionInfo) {
    enqueueSnackbar(intl.formatMessage({ id: 'create_tracsaction_infor_success' }), {
      autoHideDuration: 3000,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
      variant: 'success'
    });
    setActiveStep(activeStep + 1);
    return;
    // }
  };

  const createSingleSuppllier = async (payload: any, func = (v: number) => {}) => {
    try {
      const { data, status } = await axiosServices.post(BUSSINESS_PLAN_SUPLIER.INSERT, {
        ...payload,
        expectedDeliveryDate: moment(payload.expectedDeliveryDate).format('YYYY-MM-DD'),
        businessPlanId: Number(id || state?.businessPlanId)
      });
      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'create_tracsaction_infor_success' }), {
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
          variant: 'success'
        });
        func(Number(data.data.id));
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
    }
  };

  const submitCost = () => {
    dispatch(
      saveCostInfo({
        ...costData,
        businessPlanId: Number(id || state?.businessPlanId)
      })
    );

    if (!_.isEmpty(failCostInfo)) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
      return;
    }

    // if (successCostInfo) {
    enqueueSnackbar(intl.formatMessage({ id: 'create_cost_success' }), {
      autoHideDuration: 3000,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
      variant: 'success'
    });
  };

  const handleUpdateFormData = async () => {
    // Cập nhật data form trong chế độ view
    if (!detailBusinessPlan?.id) {
      enqueueSnackbar(intl.formatMessage({ id: 'order_error' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    try {
      // Lấy data từ tất cả các step
      const transactionDataToSubmit = transactionData || detailBusinessPlan?.businessPlanTransactionInfoItem;
      const supplierDataToSubmit = supplierData || detailBusinessPlan?.businessPlanSupplierItems;
      const costDataToSubmit = costData || detailBusinessPlan?.businessPlanCostItem;

      const payload = {
        draftPoId: detailBusinessPlan?.draftPoId,
        contractId: detailBusinessPlan?.contractId,
        totalRevenueExcludingVat: detailBusinessPlan?.totalRevenueExcludingVat || 0,
        breakEvenPrice: detailBusinessPlan?.breakEvenPrice || 0,
        actualBusinessProfit: detailBusinessPlan?.actualBusinessProfit || 0,
        profitMarginPercentage: detailBusinessPlan?.profitMarginPercentage || 0,
        // Thêm data từ các step
        transactionData: transactionDataToSubmit,
        supplierData: supplierDataToSubmit,
        costData: costDataToSubmit
      };

      const { status } = await axiosServices.put(BUSINESS_PLAN_API.BUSINESS_PLAN + `/${detailBusinessPlan.id}`, payload);

      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        // Chuyển về trang danh sách sau khi cập nhật thành công
        setTimeout(() => navigate('/business-plan/approve'), 1000);
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const handleCompleteBusinessPlan = async () => {
    // Kiểm tra xem có phải đang ở chế độ view hay create
    const businessPlanId = state?.isView ? detailBusinessPlan?.id : id || state?.businessPlanId;

    if (!businessPlanId) {
      enqueueSnackbar(intl.formatMessage({ id: 'order_error' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    try {
      // Lấy data từ tất cả các step
      const transactionDataToSubmit = transactionData || detailBusinessPlan?.businessPlanTransactionInfoItem;
      const supplierDataToSubmit = supplierData || detailBusinessPlan?.businessPlanSupplierItems;
      const costDataToSubmit = costData || detailBusinessPlan?.businessPlanCostItem;

      const payload = {
        draftPoId: state?.isView ? detailBusinessPlan?.draftPoId : state?.draftPO,
        contractId: state?.isView ? detailBusinessPlan?.contractId : state?.contractId,
        totalRevenueExcludingVat: detailBusinessPlan?.totalRevenueExcludingVat || 0,
        breakEvenPrice: detailBusinessPlan?.breakEvenPrice || 0,
        actualBusinessProfit: detailBusinessPlan?.actualBusinessProfit || 0,
        profitMarginPercentage: detailBusinessPlan?.profitMarginPercentage || 0,
        // Thêm data từ các step
        transactionData: transactionDataToSubmit,
        supplierData: supplierDataToSubmit,
        costData: costDataToSubmit
      };

      const { status } = await axiosServices.put(BUSINESS_PLAN_API.BUSINESS_PLAN + `/${businessPlanId}`, payload);

      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        // Chuyển về trang danh sách sau khi hoàn thành
        setTimeout(() => navigate('/business-plan/approve'), 1000);
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  return (
    <MainCard title={intl.formatMessage({ id: 'business_plan_title' })}>
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label} /* onClick={() => setActiveStep(index)} */>
            <StepLabel>{intl.formatMessage({ id: label })}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {getStepContent(activeStep)}

      {/* Navigation buttons */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="contained" onClick={handleBack} disabled={activeStep === 0} sx={{ m: 3 }}>
          {intl.formatMessage({ id: 'common_goback' })}
        </Button>

        <AnimateButton>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext} sx={{ m: 3 }}>
              {state?.isView ? intl.formatMessage({ id: 'common_button_update' }) : intl.formatMessage({ id: 'approve' })}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                console.log('Button clicked! Active step:', activeStep);
                if (activeStep === steps.length - 1 && state?.isView) {
                  // Trong chế độ view ở step cuối, gọi hàm cập nhật data
                  handleUpdateFormData();
                } else {
                  handleNext();
                }
              }}
              sx={{ m: 3 }}
            >
              {intl.formatMessage({ id: 'common_button_continue' })}
            </Button>
          )}
        </AnimateButton>
      </Box>
    </MainCard>
  );
}
