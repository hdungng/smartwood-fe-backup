import { ButtonContinue, ButtonSave, ErrorPriceAverage, ErrorTotalWeight } from './components';
import {
  ContractPurchasePackingPlanItem,
  CreatePurchaseContractRequest,
  ListSaleContractResponse,
  PurchaseContractPackingPlanRequest,
  purchaseContractService
} from 'services/contract';
import { StepAction, StepActionHandler } from 'components/@extended/Steps';
import { supplierService } from 'services/supplier';
import { Form, useFormResolver } from 'forms';
import { LogisticFormProps, LogisticItemFormProps, logisticSchema } from '../../schema';
import { CommonStatus, dateHelper, DatePickerFormat, formatPatterns } from 'utils';
import { useRole, useToast } from 'contexts';
import { Button, Stack } from '@mui/material';
import { useBoolean, useConfiguration, useConfirmLeave, useRouter } from 'hooks';
import { routing } from 'routes/routing';
import { InformationSection, LogisticSection } from './sections';
import { LogisticStepContext, useContractPurchaseManageContext } from '../../providers';
import React, { useEffect, useMemo } from 'react';
import { regionService } from 'services/region';
import { SelectionOption } from 'types/common';
import { goodTypeService } from 'services/good-type';
import { CODE_QUALITY_TYPE, CODE_REGION } from 'constants/code';
import { SaleContractMetaData } from '../../types';
import { SMARTWOOD_SELECTIONS } from 'constants/smartwood';
import CircularProgress from '@mui/material/CircularProgress';
import { buttonActionId } from 'constants/component';
import useLocalStorage from 'hooks/useLocalStorage';
import { LocalStorageKeys } from 'constants/storage';

type Props = StepActionHandler & {
  saleContracts: ListSaleContractResponse[];
};

const LogisticStep = ({ saleContracts, onNext }: Props) => {
  const { mode, purchaseContract, saleContract, onRefetchDetail, businessPlan, globalForm } =
    useContractPurchaseManageContext();
  const toast = useToast();
  const router = useRouter();
  const { mapConfigObject } = useConfiguration();
  const { hasPermission } = useRole();
  const saved = useBoolean();
  const [canContinueStep, setCanContinueStep] = useLocalStorage<Record<string, boolean>>(LocalStorageKeys.PURCHASE_CONTRACT, {});

  const initializing = useBoolean(mode !== 'create');

  const canContinue = useMemo((): boolean => {
    if (mode === 'view') return true;
    if (!purchaseContract) return false;
    return canContinueStep[purchaseContract.id] ?? true;
  }, [canContinueStep, mode, purchaseContract]);

  useEffect(() => {
    if (!purchaseContract || purchaseContract?.status !== CommonStatus.Approved) return;

    setCanContinueStep((prev: Record<string, boolean>) => ({
      ...prev,
      [`${purchaseContract.id}`]: canContinue && !saved.value
    }));
  }, [purchaseContract, canContinue, saved.value]);

  const handleFetchRegion = async (goodId: number) => {
    const response = await regionService.listRegion({ goodId });
    return (response?.data || []).map((region) => ({
      value: region,
      label: mapConfigObject(CODE_REGION, region)
    })) as SelectionOption[];
  };

  const handleFetchSupplier = async (goodId: number, region: string) => {
    const response = await supplierService.listSuppliers({
      goodId,
      region
    });
    return (response?.data || []).map((item) => ({
      value: item.id,
      label: item.name
    })) as SelectionOption[];
  };

  const handleFetchGoodType = async (goodId: number, region: string, supplierId: number) => {
    const response = await goodTypeService.listGoodType({
      goodId,
      region,
      supplierId
    });
    return (response?.data || [])
      .map((goodType) => ({
        value: goodType,
        label: mapConfigObject(CODE_QUALITY_TYPE, goodType)
      }))
      .filter((goodType) => !!goodType.value && !!goodType.label) as SelectionOption[];
  };

  const form = useFormResolver<Nullable<LogisticFormProps>>(logisticSchema, {
    mode: mode === 'view' ? 'onSubmit' : 'all',
    defaultValues: {
      saleContract: null,
      buyer: null,
      date: dateHelper.now(),
      conditionRangeTotalWeight: true,
      conditionPriceAverage: true
    }
  });

  const {
    getValues,
    reset,
    formState: { isDirty }
  } = form;
  const { confirmLeave } = useConfirmLeave(mode !== 'view' && (getValues().logistics || []).length > 0 && isDirty);

  const saleContractOptions = useMemo(
    () =>
      saleContracts.map((item) => ({
        value: item.id,
        label: item.saleContractCode,
        metadata: {
          weightThreshold: item.weightThreshold,
          breakEvenPrice: item.breakEvenPrice,
          codeBookings: item.codeBookings,
          contractId: item.contractId
        }
      })) as SelectionOption<SaleContractMetaData>[],
    [saleContracts]
  );

  useEffect(() => {
    if (!purchaseContract || saleContractOptions.length === 0) return;

    if (!globalForm?.logistic?.logistics) {
      return;
    }

    reset({
      saleContract: saleContractOptions.find((item) => item.value === purchaseContract?.saleContractId),
      code: purchaseContract?.contractNumber,
      date: purchaseContract?.contractDate,
      buyer: SMARTWOOD_SELECTIONS.find((item) => item.value === purchaseContract?.buyerId),
      logistics: globalForm?.logistic?.logistics || [],
      conditionRangeTotalWeight: true,
      conditionPriceAverage: true
    });

    initializing.onFalse();
  }, [purchaseContract, saleContracts, globalForm]);

  const handleSubmit = async (values: LogisticFormProps, event: Dynamic) => {
    const convertLogisticToPackingPlanItem = (item: LogisticItemFormProps) => ({
      region: item.region,
      supplierId: Number(item.supplier?.value),
      goodId: item.good?.value,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      goodType: item.goodType,
      parentId: item.parentId,
      startTime: dateHelper.formatDate(item.startDate as DatePickerFormat, formatPatterns.iso.date),
      endTime: dateHelper.formatDate(item.endDate as DatePickerFormat, formatPatterns.iso.date),
      items: []
    });

    const goodSuppliers = values.logistics
      .filter((x) => !x.parentId)
      .map((item) => ({
        ...convertLogisticToPackingPlanItem(item),
        items: values.logistics
          .filter((x) => !!x.parentId && x.parentId === item.id)
          .map((subItem) => convertLogisticToPackingPlanItem(subItem))
      })) as ContractPurchasePackingPlanItem[];

    const purchaseContractInfo = {
      contractDate: dateHelper.formatDate(values.date, formatPatterns.iso.date),
      buyerId: Number(values.buyer.value)
    };

    const purchaseContractPackingPlan: PurchaseContractPackingPlanRequest = {
      saleContractId: saleContract!.id,
      goodSuppliers
    };

    let purchaseContractId = null;
    if (mode === 'create') {
      const payload: CreatePurchaseContractRequest = {
        contractId: saleContract!.contractId,
        businessPlanId: Number(businessPlan!.id),
        contractNumber: values.code,
        ...purchaseContractInfo,
        purchaseContractPackingPlan
      };

      const response = await purchaseContractService.createPurchaseContract(payload);
      if (!response.success) {
        toast.error('Tạo PO mua thất bại. Vui lòng thử lại');
        return;
      }

      purchaseContractId = response.data?.id;
    } else if (mode === 'edit') {
      const response = await purchaseContractService.updatePurchaseContract({
        id: purchaseContract!.id,
        ...purchaseContractInfo,
        purchaseContractPackingPlan
      });

      if (!response.success) {
        toast.error('Cập nhật PO mua thất bại. Vui lòng thử lại');
        return;
      }

      purchaseContractId = purchaseContract?.id;
    }

    const isRequestApproval = event?.nativeEvent?.submitter?.value === buttonActionId.SaveAndRequestApproval;
    if (isRequestApproval) {
      const response = await purchaseContractService.requestApprovalContractPurchase({
        id: Number(purchaseContractId)
      });

      if (!response.success) {
        toast.error(response.error || 'Đã xảy ra lỗi khi yêu cầu phê duyệt. Vui lòng thử lại sau.');
        return;
      }

      toast.success('Lưu và yêu cầu phê duyệt thành công');

      router.push(hasPermission(['PURCHASE_ORDER_APPROVE']) ? routing.contractPurchase.approval : routing.contractPurchase.list);
      return;
    }

    toast.success('Lưu thông tin đóng hàng thành công');

    if (mode === 'create' && purchaseContractId) {
      await onRefetchDetail(purchaseContractId);
    }

    reset(
      {
        ...getValues(),
        logistics: values.logistics.map((item) => ({
          ...item,
          initialized: true,
          defaultValue: {
            supplier: item.supplier?.value as number,
            goodType: item.goodType
          }
        }))
      },
      {
        keepValues: true,
        keepErrors: false,
        keepDirty: false
      }
    );

    setCanContinueStep((prev: Record<string, boolean>) => ({
      ...prev,
      [`${purchaseContractId}`]: false
    }));
    saved.onTrue();
  };

  const handleConfirmLeave = async (callback: VoidFunction) => {
    await confirmLeave(callback);
  };

  const handleContinueStep = async () => {
    await handleConfirmLeave(() =>
      onNext?.({
        logistic: getValues()
      })
    );
  };

  const handleCompleteStep = () => {
    router.push(routing.contractPurchase.list);
  };

  const unitOfMeasure = useMemo(() => businessPlan?.draftPo?.unitOfMeasure, [businessPlan]);

  return (
    <LogisticStepContext.Provider
      value={{
        unitOfMeasure,
        onFetchRegion: handleFetchRegion,
        onFetchSupplier: handleFetchSupplier,
        onFetchGoodType: handleFetchGoodType
      }}
    >
      <Form methods={form} onSubmit={handleSubmit}>
        {initializing.value ? (
          <Stack justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={3}>
            <InformationSection saleContracts={saleContracts} saleContractOptions={saleContractOptions} />

            <LogisticSection />

            <ErrorTotalWeight />

            <ErrorPriceAverage />

            <StepAction
              onNext={() =>
                onNext?.({
                  logistic: getValues()
                })
              }
              onBack={() => router.push(routing.contractPurchase.list)}
              slots={{
                next: (
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    {mode !== 'view' && (
                      <>
                        <ButtonSave id={buttonActionId.Save} label="Lưu" />

                        <ButtonSave id={buttonActionId.SaveAndRequestApproval} label="Lưu & Yêu cầu phê duyệt" />
                      </>
                    )}

                    {mode === 'view' && purchaseContract?.status !== CommonStatus.Approved && (
                      <Button variant="contained" onClick={handleCompleteStep}>
                        Thoát
                      </Button>
                    )}

                    {purchaseContract?.status === CommonStatus.Approved && (
                      <ButtonContinue onClick={handleContinueStep} disabled={!canContinue} />
                    )}
                  </Stack>
                )
              }}
            />
          </Stack>
        )}
      </Form>
    </LogisticStepContext.Provider>
  );
};

export default LogisticStep;
