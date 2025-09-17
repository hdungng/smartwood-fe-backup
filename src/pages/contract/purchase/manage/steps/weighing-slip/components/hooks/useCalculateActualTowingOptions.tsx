import { LogisticItemFormProps, WeighingSlipFormProps } from '../../../../schema';
import { SelectionOption } from 'types/common';
import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { useConfiguration } from 'hooks';
import { useLogisticGrouped } from './useLogisticGrouped';
import { getActualTowingPropertyName } from '../cells';
import { CODE_QUALITY_TYPE } from 'constants/code';

type ActualTowingOptionProps = IndexProps & {
  logistics?: LogisticItemFormProps[];
};

export const useCalculateActualTowingOptions = ({ index, logistics }: ActualTowingOptionProps) => {
  const { control } = useFormContext<WeighingSlipFormProps>();
  const { mapConfigObject } = useConfiguration();
  const { grouped: groupedData } = useLogisticGrouped({
    logistics
  });

  const regionOptions = useMemo(
    () =>
      Object.keys(groupedData).map((region) => ({
        label: mapConfigObject('REGION', region),
        value: region
      })) as SelectionOption[],
    [groupedData]
  );

  const selectedRegion = useWatch({
    control,
    name: getActualTowingPropertyName('region', index)
  }) as string | undefined;

  const supplierOptions = useMemo(() => {
    if (!selectedRegion || !groupedData[selectedRegion]) return [];

    return Object.keys(groupedData[selectedRegion]).map((supplierId) => ({
      label: groupedData[selectedRegion][supplierId].label,
      value: Number(supplierId)
    })) as SelectionOption[];
  }, [groupedData, selectedRegion]);

  const selectedSupplier = useWatch({
    control,
    name: getActualTowingPropertyName('supplier', index)
  }) as SelectionOption | undefined;

  const selectedGood = useWatch({
    control,
    name: getActualTowingPropertyName('good', index)
  }) as SelectionOption | undefined;

  const goodTypeOptions = useMemo(() => {
    if (
      !selectedRegion ||
      !selectedSupplier?.value ||
      !selectedGood?.value ||
      !groupedData[selectedRegion] ||
      !groupedData[selectedRegion][selectedSupplier.value] ||
      !groupedData[selectedRegion][selectedSupplier.value].goods ||
      !groupedData[selectedRegion][selectedSupplier.value].goods[selectedGood.value]
    )
      return [];

    return Object.keys(groupedData[selectedRegion][selectedSupplier.value].goods[selectedGood.value].goodTypes).map((goodType) => ({
      label: mapConfigObject(CODE_QUALITY_TYPE, goodType),
      value: goodType
    })) as SelectionOption[];
  }, [groupedData, selectedRegion, selectedSupplier, selectedGood]);

  const selectedGoodType = useWatch({
    control,
    name: getActualTowingPropertyName('goodType', index)
  }) as SelectionOption | undefined;

  const logisticsAvailable = useMemo(
    () =>
      selectedRegion && selectedSupplier?.value && selectedGood?.value && selectedGoodType?.value
        ? groupedData[selectedRegion]?.[selectedSupplier.value]?.goods?.[selectedGood.value]?.goodTypes?.[selectedGoodType.value] || []
        : [],
    [selectedRegion, selectedSupplier, selectedGood, selectedGoodType, index]
  );

  return {
    regionOptions,
    supplierOptions,
    goodTypeOptions,
    logisticsAvailable,

    selectedGood,
    selectedGoodType,
    selectedRegion,
    selectedSupplier
  };
};
