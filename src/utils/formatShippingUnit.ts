import { TShippingUnit } from 'types/shipping-unit';

export const shippingUnitFormat = (
  shippingUnits: TShippingUnit[]
): Record<
  string,
  {
    name: string;
  }
> => {
  let result: any = {};
  shippingUnits.forEach((shippingUnit) => {
    result[`${shippingUnit.id}`] = {
      name: shippingUnit.name
    };
  });
  return result;
};
