import React, { startTransition, useCallback, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import { GetDetailPurchaseContractWeightTicketResponse } from 'services/contract';
import { dateHelper } from 'utils';
import ActualTowingHeader from './actual-towing-header';
import { ListTruckResponse } from 'services/truck';
import ActualTowingTable from './actual-towing-table';
import { useFormContext } from 'react-hook-form';
import { useActualTowingFieldArray } from '../hooks';
import { ActualTowingFormProps, WeighingSlipFormProps } from '../../../../schema';
import { useContractPurchaseManageContext } from '../../../../providers';
import { useGlobal } from 'contexts';
import { useBoolean, useConfiguration, useDialog } from 'hooks';
import { InsertMultipleWeightSlipDialog } from 'dialogs';
import orderBy from 'lodash/orderBy';
import { getActualTowingPropertyName } from '../cells';
import { SelectionOption } from 'types/common';
import { CODE_EXPORT_PORT, CODE_QUALITY_TYPE } from 'constants/code';

type Props = {
  detail?: GetDetailPurchaseContractWeightTicketResponse;
};

const ActualTowingSection = ({ detail }: Props) => {
  const { businessPlan, selectedGoodId, purchaseContract, defaultWeightContainer, codeBookingOptions } =
    useContractPurchaseManageContext();
  const { shippingUnitOptions, shippingUnitMap, goodMap, supplierMap } = useGlobal();
  const { setFocus } = useFormContext<WeighingSlipFormProps>();
  const { mapConfigObject } = useConfiguration();
  const dialog = useDialog();

  const batchLoading = useBoolean();

  const { fields: actualTowing, prepend, remove } = useActualTowingFieldArray();

  const handleManualAddRow = useCallback(() => {
    const newRow = {
      codeBooking: codeBookingOptions.length > 0 ? codeBookingOptions[0] : null,
      region: '',
      good: goodMap.get(selectedGoodId) || null,
      goodType: null,
      supplier: null,
      loadingDate: null,
      actualWeight: defaultWeightContainer,
      goodPrice: null,
      delivery: (shippingUnitOptions.length > 0 ? shippingUnitOptions[0] : null) as SelectionOption | null,
      sealNumber: '',
      truckNumber: '',
      unloadingPort: '',
      transportPrice: null,
      containerNumber: '',
      coverageGoodType: '',
      coverageQuantity: null,
      initialized: true
    };

    prepend([newRow]);

    setTimeout(() => {
      setFocus(getActualTowingPropertyName('codeBooking', 0), { shouldSelect: true });
    }, 200);
  }, [codeBookingOptions, goodMap, businessPlan?.draftPo?.goodId, shippingUnitOptions, prepend, setFocus]);

  const handleAddAutomaticRow = React.useCallback(async () => {
    const result = await dialog.show(InsertMultipleWeightSlipDialog, {
      saleContractId: purchaseContract?.saleContractId || 0,
      actualTowing,
      codeBookingOptions
    });

    if (!result?.success || !businessPlan?.draftPo?.goodId) {
      return;
    }

    batchLoading.onTrue();

    const newTrucks = (result?.payload?.trucks || []) as ListTruckResponse[];
    const trucksConflict = (result?.payload?.trucksConflict || []) as ListTruckResponse[];

    const conflictingIndices: number[] = [];

    if (trucksConflict.length > 0) {
      actualTowing.forEach((at: Dynamic, index) => {
        const isConflicting = trucksConflict.some(
          (truck) =>
            at.codeBooking?.value === truck.shippingScheduleId &&
            at.supplier?.value === truck.supplierId &&
            dateHelper.formatIsSame(at.loadingDate, truck.loadingDate) &&
            at.delivery?.value === truck.transportUnit
        );

        if (isConflicting) {
          conflictingIndices.push(index);
        }
      });

      remove(conflictingIndices);
    }

    const codeBookingMap = new Map(codeBookingOptions.map((option) => [option.value, option]));

    const sortedTrucks = orderBy(newTrucks, ['createdAt'], ['asc']);
    const processedRows = sortedTrucks.map((truck) => ({
      codeBooking: codeBookingMap.get(truck.shippingScheduleId) || null,
      good: goodMap.get(businessPlan!.draftPo!.goodId) || null,
      loadingDate: null,
      delivery: shippingUnitMap.get(truck.transportUnit) || null,
      supplier: null,
      actualWeight: defaultWeightContainer,
      goodType: null,
      region: '',
      goodPrice: 0,
      transportPrice: null,
      sealNumber: '',
      truckNumber: '',
      unloadingPort: mapConfigObject(CODE_EXPORT_PORT, truck?.shippingSchedule?.exportPort) || '',
      containerNumber: '',
      coverageGoodType: '',
      coverageQuantity: null,
      initialized: true,
      multiple: true,
      saved: false,
      defaultValueForMultiple: {
        region: truck?.shippingSchedule?.region || '',
        supplier: truck.supplierId,
        goodType: truck?.shippingSchedule?.goodType || null,
        loadingDate: dateHelper.from(truck.loadingDate),
      }
    }))

    startTransition(() => {
      prepend(processedRows);
    });

    setTimeout(() => {
      batchLoading.onFalse();
    }, 500);
  }, [
    dialog,
    purchaseContract?.saleContractId,
    actualTowing,
    businessPlan?.draftPo?.goodId,
    codeBookingOptions,
    goodMap,
    supplierMap,
    shippingUnitMap,
    prepend,
    remove,
    setFocus
  ]);

  return (
    <Stack spacing={1}>
      <ActualTowingHeader onAddFromPlan={handleAddAutomaticRow} onAddManually={handleManualAddRow} />

      <ActualTowingTable
        detail={detail}
        actualTowing={actualTowing as (ActualTowingFormProps & Record<'id', string>)[]}
        onRemove={remove}
        onAdd={prepend}
        isLoading={batchLoading.value}
        onAddManually={handleManualAddRow}
      />
    </Stack>
  );
};

export default ActualTowingSection;
