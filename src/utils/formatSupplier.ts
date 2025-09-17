import { TSupplier } from 'types/supplier';

export const supplierFormat = (
  suppliers: TSupplier[]
): Record<
  string,
  {
    name: string;
  }
> => {
  let result: any = {};
  suppliers.forEach((supplier) => {
    result[`${supplier.id}`] = {
      name: supplier.name
    };
  });
  return result;
};
