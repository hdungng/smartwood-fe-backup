import { StepperInfoProps, Steps } from 'components/@extended/Steps';
import { BusinessPlanManageContext } from './provider';
import { BusinessPlanStep, ManageURLParams } from './types';
import { useEffect, useMemo, useState } from 'react';
import { CostStep, InitializeStep, SupplierStep } from './steps';
import { useParams } from 'react-router';
import MainCard from 'components/MainCard';
import { useBoolean, useScrollToTop } from 'hooks';
import { BusinessPlan, businessPlanService } from 'services/business-plan';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { routing } from 'routes/routing';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { BusinessPlanStatus } from 'redux/BusinessPLan/constant';

type Props = {
  mode: PageMode;
};

const BusinessPlanManage = ({ mode }: Props) => {
  const { id } = useParams<ManageURLParams>();
  const { scrollToTop } = useScrollToTop();

  const [currentStep, setCurrentStep] = useState<BusinessPlanStep>(BusinessPlanStep.Initialize);
  const [currentBusinessPlan, setCurrentBusinessPlan] = useState<BusinessPlan | undefined>(undefined);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const initializing = useBoolean(Number(id) > 0);

  const handleFetchDetailBusinessPlan = async (businessPlanId: number) => {
    const response = await businessPlanService.getDetailBusinessPlan(businessPlanId);
    setCurrentBusinessPlan(response?.data);
  };

  useEffect(() => {
    (async () => {
      if (Number(id) > 0) {
        try {
          initializing.onTrue();
          await handleFetchDetailBusinessPlan(Number(id));
        } finally {
          initializing.onFalse();
        }
      }
    })();
  }, [id]);

  const handleStepBack = () => {
    if (currentStep <= 0) {
      return;
    }

    setCurrentStep((state) => state - 1);
  };

  const handleNext = () => {
    setCurrentStep((state) => state + 1);
    scrollToTop();
  };

  const handleBack = () => {
    if (currentStep <= 0) {
      return;
    }
    setCurrentStep((state) => state - 1);
    scrollToTop();
  };

  const steps: StepperInfoProps[] = [
    {
      label: 'Thông tin giao dịch',
      key: BusinessPlanStep.Initialize,
      component: <InitializeStep onNext={handleNext} />
    },
    {
      label: 'Thông tin nhà cung cấp',
      key: BusinessPlanStep.Supplier,
      component: <SupplierStep onBack={handleBack} onNext={handleNext} />
    },
    {
      label: 'Chi phí',
      key: BusinessPlanStep.Cost,
      component: <CostStep onBack={handleStepBack} />
    }
  ];

  const fieldOnlyView = useMemo(
    () =>
      mode === 'view' ||
      (!!currentBusinessPlan &&
        [BusinessPlanStatus.APPROVED, BusinessPlanStatus.REQUESTAPPROVE, BusinessPlanStatus.INACTIVE].includes(
          currentBusinessPlan?.status
        )),
    [mode, currentBusinessPlan]
  );

  const titleBreadcrumb = useMemo(() => {
    if (mode === 'create') return 'Tạo mới';

    if (!currentBusinessPlan?.code) return 'Kế hoạch kinh doanh';

    if (mode === 'edit') return `Cập nhật - ${currentBusinessPlan?.code}`;

    return `Chi tiết - ${currentBusinessPlan?.code}`;
  }, [mode, currentBusinessPlan]);

  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    { title: '2. Phương án kinh doanh', to: routing.businessPlan.list },
    { title: titleBreadcrumb }
  ];

  return (
    <BusinessPlanManageContext.Provider
      value={{
        mode,
        currentStep,
        totalWeightSupplier: totalQuantity,
        setTotalWeightSupplier: setTotalQuantity,
        totalCostSupplier: totalValue,
        setTotalCostSupplier: setTotalValue,
        businessPlan: currentBusinessPlan,
        onRefetchDetail: handleFetchDetailBusinessPlan,
        fieldOnlyView
      }}
    >
      <Breadcrumbs custom heading={titleBreadcrumb} links={breadcrumbLinks} translate={false} />

      <MainCard title="Kế hoạch kinh doanh">
        {initializing.value ? (
          <Stack direction="row" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Stack>
        ) : (
          <Steps steps={steps} activeStep={currentStep} />
        )}
      </MainCard>
    </BusinessPlanManageContext.Provider>
  );
};

export default BusinessPlanManage;
