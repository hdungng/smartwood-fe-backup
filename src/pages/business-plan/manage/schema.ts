import { dateHelper, DatePickerFormat, validateErrors } from 'utils';
import { Currency } from 'utils/mapCurrenciesFromConfig';
import * as yup from 'yup';
import { SelectionOption } from 'types/common';
import { ItemCode } from 'services/business-plan';
import { SupplierDefaultValue } from './types';

export const initializeSchema = yup.object().shape({
  draftPo: yup.mixed<SelectionOption>().required(validateErrors.required),
  currency: yup
    .mixed<Currency>()
    .required(validateErrors.required)
    .transform((value) => (value === undefined ? null : value)),
  exchangeRateBuy: yup
    .number()
    .typeError(validateErrors.required)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  exchangeRateSell: yup
    .number()
    .typeError(validateErrors.required)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  deliveryMethod: yup.mixed<SelectionOption>().required(validateErrors.required),
  packingMethod: yup.mixed<SelectionOption>().required(validateErrors.required),
  weightPerContainer: yup
    .number()
    .typeError(validateErrors.required)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  estimatedTotalContainers: yup.number().nullable().optional(),
  estimatedTotalBookings: yup
    .number()
    .typeError(validateErrors.required)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero)
});

const supplierItemSchema = yup.object().shape({
  good: yup.mixed<SelectionOption>().required(validateErrors.required),
  goodType: yup.string().required(validateErrors.required),
  quantity: yup
    .number()
    .typeError(validateErrors.mustBeNumber)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  purchasePrice: yup
    .number()
    .typeError(validateErrors.mustBeNumber)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  region: yup.string().required(validateErrors.required),
  exportPort: yup.string().required(validateErrors.required),
  defaultValue: yup.mixed<SupplierDefaultValue>().nullable().optional()
});

export const supplierSchema = yup.object().shape({
  suppliers: yup.array().of(supplierItemSchema).required(validateErrors.required).min(1),
  conditionRangeTotalWeight: yup.boolean().nullable().optional(),
  hasDuplicateRow: yup.boolean().default(false)
});

export const costDetailItemSchema = yup.object().shape({
  itemCode: yup.mixed<ItemCode>().required(validateErrors.required),
  name: yup.string().required(validateErrors.required),
  amount: yup.number().required(validateErrors.required),
  amountConversion: yup.number().typeError(validateErrors.required).required(validateErrors.required),
  unit: yup.string().nullable().optional(),
  notes: yup.string().nullable().optional(),
  isPercentage: yup.boolean().default(false),
  percentage: yup.number().when('isPercentage', (isPercentage, schema) => {
    return isPercentage
      ? schema
          .typeError(validateErrors.mustBeNumber)
          .required(validateErrors.required)
      : schema.nullable().optional();
  })
});

export const optionalCostDetailItemSchema = costDetailItemSchema.shape({
  amount: yup.number().nullable().optional(),
  amountConversion: yup.number().nullable().optional()
});

export const costDetailSchema = yup.object().shape({
  name: yup.string().required(validateErrors.required),
  items: yup.array().of(costDetailItemSchema).required(validateErrors.required)
});

export const otherCostDetailSchema = yup.object().shape({
  name: yup.string().required(validateErrors.required),
  items: yup.array().of(optionalCostDetailItemSchema).required(validateErrors.required)
});

export const costSchema = yup.object().shape({
  logistics: costDetailSchema,
  customs: costDetailSchema,
  finance: costDetailSchema,
  management: costDetailSchema,
  other: otherCostDetailSchema
});

export type SupplierItemFormProps = yup.InferType<typeof supplierItemSchema>;

export type InitializeFormProps = yup.InferType<typeof initializeSchema>;

export type SupplierFormProps = yup.InferType<typeof supplierSchema>;

export type CostDetailItemFormProps = yup.InferType<typeof costDetailItemSchema>;

export type OptionalCostDetailItemFormProps = yup.InferType<typeof optionalCostDetailItemSchema>;

export type CostFormProps = yup.InferType<typeof costSchema>;
