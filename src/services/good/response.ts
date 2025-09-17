import { Entity, EntityWithName } from '../core';

export type GoodItemResponse = {
  goodId: number;
  goodType: string;
  unitPrice: number;
};

export type ListGoodResponse = EntityWithName<number>;

export type ListSupplierByGoodResponse = Entity<number> & {
  supplierId: number;
  supplierName: string;
  goods: GoodItemResponse[];
};

export type ListGoodBySupplierResponse = {
  goodId: number;
  goodName: string;
  goodTypes: string[];
}