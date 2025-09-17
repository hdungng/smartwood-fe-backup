import { StepperInfoProps, Steps } from 'components/@extended/Steps';
import { ContractPurchaseManageContext } from './providers';
import { CodeBookingMetaData, ContractPurchaseStep, ManageURLParams } from './types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import MainCard from 'components/MainCard';
import { useBoolean } from 'hooks';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { routing } from 'routes/routing';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { ListSaleContractResponse, PurchaseContractDetailResponse, purchaseContractService, saleContractService } from 'services/contract';
import { LogisticStep, WeighingSlipStep } from './steps';
import { CommonStatus, dateHelper } from 'utils';
import { SelectionOption } from 'types/common';
import { FormProps, LogisticItemFormProps } from './schema';
import { BusinessPlan, businessPlanService } from 'services/business-plan';
import { useGlobal } from 'contexts';

type Props = {
  mode: PageMode;
};

const ContractPurchaseManage = ({ mode }: Props) => {
  const { id } = useParams<ManageURLParams>();
  const { goodMap, supplierMap } = useGlobal();

  const [currentStep, setCurrentStep] = useState<ContractPurchaseStep>(ContractPurchaseStep.Logistics);
  const [purchaseContract, setPurchaseContract] = useState<PurchaseContractDetailResponse | undefined>(undefined);
  const [saleContract, setSaleContract] = useState<ListSaleContractResponse | undefined>(undefined);
  const [globalForm, setGlobalForm] = useState<FormProps | undefined>(undefined);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | undefined>(undefined);
  const [saleContracts, setSaleContracts] = useState<ListSaleContractResponse[]>([]);

  const redirectedToStepWeight = useRef<boolean>(false);

  const initializing = useBoolean(Number(id) > 0);

  const handleFetchDetailPurchaseContract = async (contractId: number) => {
    const response = await purchaseContractService.getDetailPurchaseContract(contractId);
    setPurchaseContract(response.data || undefined);
  };

  useEffect(() => {
    (async () => {
      if (!purchaseContract?.contractId) return;

      const response = await saleContractService.listSaleContractAvailable({
        mode: 'po',
        contractId: purchaseContract?.contractId
      });
      setSaleContracts(response?.data || []);
    })();
  }, [purchaseContract?.contractId]);

  useEffect(() => {
    (async () => {
      if(!!id || Number(id) > 0)
        return;

      const response = await saleContractService.listSaleContractAvailable({
        mode: 'po'
      });
      setSaleContracts(response?.data || []);
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!id || Number(id) === 0) {
        initializing.onFalse();
        setCurrentStep(ContractPurchaseStep.Logistics);
        return;
      }

      await handleFetchDetailPurchaseContract(Number(id));
    })();
  }, [id]);

  useEffect(() => {
    if (
      redirectedToStepWeight.current ||
      !purchaseContract ||
      purchaseContract?.status !== CommonStatus.Approved ||
      saleContracts.length === 0
    ) {
      return;
    }

    const currentSaleContract = saleContracts.find((item) => item.id === purchaseContract?.saleContractId);
    setSaleContract(currentSaleContract);

    const packingPlan = purchaseContract.purchaseContractPackingPlan;
    if (!packingPlan) return;

    const suppliers = packingPlan.purchaseContractPackingPlanGoodSuppliers || [];

    const logistics = suppliers.map((item) => ({
      id: item.id,
      region: item.region,
      good: goodMap.get(item.goodId),
      supplier: supplierMap.get(item.supplierId),
      goodType: item.goodType || '',
      quantity: item.quantity + suppliers.filter((x) => x.parentId === item.id).reduce((acc, cur) => acc + cur.quantity, 0),
      remainingQuantity: item.remainingWeight,
      actualQuantity: item.actualWeight,
      unitPrice: item.unitPrice,
      startDate: dateHelper.from(item.startTime),
      endDate: dateHelper.from(item.endTime),
      hasConflict: false,
      initialized: false,
      parentId: item.parentId,
      hasWeightSlip: item.actualWeight > 0,
      isFilled: item.remainingWeight === 0,
      baseQuantity: item.quantity + suppliers.filter((x) => x.parentId === item.id).reduce((acc, cur) => acc + cur.quantity, 0),
      defaultValue: {
        supplier: item.supplierId,
        goodType: item.goodType,
        originalStartDate: dateHelper.from(item.startTime)
      }
    })) as LogisticItemFormProps[];

    if (logistics.length === 0) return;

    setGlobalForm({
      logistic: {
        logistics
      }
    });

    redirectedToStepWeight.current = true;

    setCurrentStep(ContractPurchaseStep.Weight);

    initializing.onFalse();
  }, [purchaseContract, saleContracts]);

  const handleFetchDetailBusinessPlan = async (businessPlanId: number) => {
    const response = await businessPlanService.getDetailBusinessPlan(businessPlanId);
    return response.data || undefined;
  };

  useEffect(() => {
    if (!saleContract?.businessPlanId) return;

    (async () => {
      const businessPlanDetail = await handleFetchDetailBusinessPlan(saleContract.businessPlanId);
      if (!businessPlanDetail) return;

      setBusinessPlan(businessPlanDetail);
    })();
  }, [saleContract?.businessPlanId]);

  const handleStepBack = async () => {
    if (currentStep <= 0) {
      return;
    }

    const previousStep = currentStep - 1;
    setCurrentStep(previousStep);

    if (previousStep === ContractPurchaseStep.Logistics) {
      await handleFetchDetailPurchaseContract(Number(id));
    }
  };

  const handleStepNext = (formData?: FormProps) => {
    setCurrentStep((state) => state + 1);
    setGlobalForm((state) => ({
      ...state,
      ...formData
    }));
  };

  const codeBookingOptions = useMemo(
    () =>
      (saleContract?.codeBookings || []).map((codeBooking) => ({
        label: codeBooking.codeBooking,
        value: codeBooking.id,
        metadata: {
          exportPort: codeBooking.exportPort
        }
      })) as SelectionOption<CodeBookingMetaData>[],
    [saleContract]
  );

  const defaultWeightContainer = useMemo(
    () => (saleContract?.weightPerContainer || 0) * (saleContract?.unit === 'TON' ? 1000 : 1),
    [saleContract]
  );

  const steps: StepperInfoProps[] = [
    {
      label: 'Thông tin logistics',
      key: ContractPurchaseStep.Logistics,
      component: <LogisticStep onNext={handleStepNext} saleContracts={saleContracts} />
    },
    {
      label: 'Phiếu cân và cân nặng thực tế',
      key: ContractPurchaseStep.Weight,
      component: <WeighingSlipStep onBack={handleStepBack} />
    }
  ];

  const fieldOnlyView = useMemo(
    () =>
      mode === 'view' ||
      (mode !== 'create' && !purchaseContract?.status) ||
      (purchaseContract?.status && [CommonStatus.RequestApproval].includes(purchaseContract.status)) ||
      false,
    [mode, purchaseContract]
  );

  const selectedGoodId = useMemo(() => businessPlan?.draftPo?.goodId || 0, [businessPlan?.draftPo?.goodId]);

  const titleBreadcrumb = useMemo(() => {
    if (mode === 'create') return 'Tạo mới';

    if (!purchaseContract?.code) return 'Chi tiết hợp đồng mua hàng';

    if (mode === 'edit') return `Cập nhật - ${purchaseContract?.code || ''}`;

    return `Chi tiết - ${purchaseContract?.code || ''}`;
  }, [mode, purchaseContract]);

  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    { title: '4. PO mua', to: routing.contractPurchase.list },
    { title: titleBreadcrumb }
  ];

  return (
    <ContractPurchaseManageContext.Provider
      value={{
        mode,
        fieldOnlyView,
        purchaseContract: purchaseContract,
        onRefetchDetail: handleFetchDetailPurchaseContract,
        codeBookingOptions,
        saleContract,
        onChangeSaleContract: setSaleContract,
        globalForm,
        logistics: globalForm?.logistic?.logistics,
        businessPlan,
        onChangeBusinessPlan: setBusinessPlan,
        defaultWeightContainer,
        selectedGoodId
      }}
    >
      <Breadcrumbs custom heading={titleBreadcrumb} links={breadcrumbLinks} translate={false} />

      <MainCard>
        {initializing.value ? (
          <Stack direction="row" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Stack>
        ) : (
          <Steps steps={steps} activeStep={currentStep} />
        )}
      </MainCard>
    </ContractPurchaseManageContext.Provider>
  );
};

export default ContractPurchaseManage;
