import { SupplierItemFormProps } from '../../../../schema';

export const getSupplierPropertyName = (
  property: keyof SupplierItemFormProps,
  index: number
): `suppliers.${number}.${keyof SupplierItemFormProps}` => `suppliers.${index}.${property}`;
