import { ActualTowingFormProps } from '../../../../schema';
import { ActualTowingGrouped } from '../hooks';

export const getActualTowingPropertyName = (
  property: keyof ActualTowingFormProps,
  index: number
): `actualTowing.${number}.${keyof ActualTowingFormProps}` => `actualTowing.${index}.${property}`;

export const getActualTowingGrouped = (actualTowing: ActualTowingFormProps[]) => {
  const grouped: ActualTowingGrouped = {};

  (actualTowing || []).forEach((towing) => {
    if (!towing) return;

    const region = towing.region;
    const supplier = towing.supplier?.value;
    const good = towing.good?.value;
    const goodType = towing.goodType?.value;

    if (!grouped[region]) {
      grouped[region] = {};
    }
    if (!grouped[region][supplier]) {
      grouped[region][supplier] = {};
    }
    if (!grouped[region][supplier][good]) {
      grouped[region][supplier][good] = {};
    }
    if (!grouped[region][supplier][good][goodType]) {
      grouped[region][supplier][good][goodType] = {
        rows: []
      };
    }

    grouped[region][supplier][good][goodType].rows.push({
      total: towing.actualWeight || 0,
      date: towing.loadingDate
    });
  });

  return grouped;
};
