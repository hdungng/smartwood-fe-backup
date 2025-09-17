import * as yup from 'yup';
import { dateHelper, DatePickerFormat, validateErrors } from 'utils';
import { SelectionOption } from 'types/common';
import { Dayjs } from 'dayjs';
import { ActualTowingMetaDataForMultiple, PackingPlanDefaultValue } from './types';

export const logisticItemSchema = yup.object().shape({
  id: yup.number().nullable(),
  parentId: yup.number().nullable(),
  region: yup.string().required(validateErrors.required),
  supplier: yup.mixed<SelectionOption>().required(validateErrors.required),
  good: yup.mixed<SelectionOption>().required(validateErrors.required),
  goodType: yup.string().required(validateErrors.required),
  quantity: yup
    .number()
    .typeError(validateErrors.mustBeNumber)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  unitPrice: yup
    .number()
    .typeError(validateErrors.mustBeNumber)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  startDate: yup
    .mixed<Dayjs>()
    .typeError(validateErrors.invalidDate)
    .required(validateErrors.required)
    .nonNullable(validateErrors.invalidDate)
    .test('is-valid-date', validateErrors.invalidDate, (value: DatePickerFormat) => dateHelper.isValidDate(value))
    .test('is-after-now', (value: DatePickerFormat, context) => {
      const currentDate = dateHelper.now();
      if (!dateHelper.isValidDate(currentDate)) return true;

      const existingRecordId = context.parent.id;
      const originalStartDate = context.parent.defaultValue?.originalStartDate;
      if (existingRecordId && dateHelper.isValidDate(originalStartDate) &&
        dateHelper.formatIsSame(value, originalStartDate)) {
        return true;
      }

      if (dateHelper.formatIsBefore(currentDate, value)) {
        return context.createError({
          message: validateErrors.beforeDate(dateHelper.formatDate(currentDate)),
          path: context.path
        });
      }

      return true;
    })
    .test('is-before-end-date', (value: DatePickerFormat, context) => {
      const endDate = context.parent.endDate as DatePickerFormat;
      if (!dateHelper.isValidDate(endDate)) return true;

      if (dateHelper.formatIsBefore(value, endDate)) {
        return context.createError({
          message: validateErrors.afterDate(dateHelper.formatDate(endDate)),
          path: context.path
        });
      }

      return true;
    }),
  endDate: yup
    .mixed<Dayjs>()
    .typeError(validateErrors.invalidDate)
    .required(validateErrors.required)
    .test('is-valid-date', validateErrors.invalidDate, (value: DatePickerFormat) => dateHelper.isValidDate(value))
    .test('is-after-end-date', (value: DatePickerFormat, context) => {
      const startDate = context.parent.startDate as DatePickerFormat;
      if (!dateHelper.isValidDate(startDate)) return true;

      if (dateHelper.formatIsAfter(startDate, value)) {
        return context.createError({
          message: validateErrors.beforeDate(dateHelper.formatDate(startDate)),
          path: context.path
        });
      }

      return true;
    }),
  maxQuantity: yup.number().nullable(),
  baseQuantity: yup.number().nullable(),
  remainingQuantity: yup.number().default(0),
  actualQuantity: yup.number().default(0),
  initialized: yup.boolean().default(false),
  defaultLoaded: yup.boolean().default(false),
  isFilled: yup.boolean().default(false),
  hasWeightSlip: yup.boolean().default(false),
  defaultValue: yup.mixed<PackingPlanDefaultValue>().nullable(),

  hasConflict: yup.boolean().default(false),
  hasOverQuantity: yup.boolean().default(false)
});

export const logisticSchema = yup.object().shape({
  code: yup.string().required(validateErrors.required),
  date: yup
    .mixed<Dayjs>()
    .typeError(validateErrors.invalidDate)
    .required(validateErrors.required)
    .test('is-valid-date', validateErrors.invalidDate, (value: DatePickerFormat) => dateHelper.isValidDate(value)),
  buyer: yup.mixed<SelectionOption>().nullable().required(validateErrors.required),
  saleContract: yup.mixed<SelectionOption>().nullable().optional(),
  logistics: yup.array().of(logisticItemSchema)
    .min(1, validateErrors.minArray(1))
    .required(validateErrors.required),
  priceAverage: yup.number(),
  totalWeight: yup.number(),
  conditionRangeTotalWeight: yup.boolean().default(true),
  conditionPriceAverage: yup.boolean().default(true)
});

export const actualTowingSchema = yup.object().shape({
  codeBooking: yup.mixed<SelectionOption>().required(validateErrors.required),
  region: yup.string().required(validateErrors.required),
  supplier: yup.mixed<SelectionOption>().required(validateErrors.required),
  good: yup.mixed<SelectionOption>().required(validateErrors.required),
  goodType: yup.mixed<SelectionOption>().required(validateErrors.required),
  loadingDate: yup
    .mixed<Dayjs>()
    .typeError(validateErrors.invalidDate)
    .required(validateErrors.required)
    .test('is-valid-date', validateErrors.invalidDate, (value: DatePickerFormat) => dateHelper.isValidDate(value))
    .test('is-before-min-loading-date', (value: DatePickerFormat, context) => {
      const minLoadingDate = context.parent.minLoadingDate as DatePickerFormat;

      if (!dateHelper.isValidDate(minLoadingDate)) return true;

      if (dateHelper.formatIsBefore(minLoadingDate, value)) {
        return context.createError({
          message: validateErrors.beforeDate(dateHelper.formatDate(minLoadingDate)),
          path: context.path
        });
      }

      return true;
    })
    .test('is-after-max-loading-date', (value: DatePickerFormat, context) => {
      const maxLoadingDate = context.parent.maxLoadingDate as DatePickerFormat;
      if (!dateHelper.isValidDate(maxLoadingDate)) return true;

      if (dateHelper.formatIsAfter(value, maxLoadingDate)) {
        return context.createError({
          message: validateErrors.afterDate(dateHelper.formatDate(maxLoadingDate)),
          path: context.path
        });
      }

      return true;
    }),

  minLoadingDate: yup.mixed().optional().nullable(),
  maxLoadingDate: yup.mixed().optional().nullable(),

  actualWeight: yup
    .number()
    .typeError(validateErrors.mustBeNumber)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  goodPrice: yup
    .number()
    .typeError(validateErrors.mustBeNumber)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  maxGoodWeight: yup.number().typeError(validateErrors.mustBeNumber).nullable(),
  logistic: yup.mixed<LogisticItemFormProps>().nullable(),

  delivery: yup.mixed<SelectionOption>().required(validateErrors.required),
  transportPrice: yup
    .number()
    .typeError(validateErrors.mustBeNumber)
    .required(validateErrors.required)
    .moreThan(0, validateErrors.mustBeThanZero),
  unloadingPort: yup.string().required(validateErrors.required),
  truckNumber: yup.string().required(validateErrors.required),
  containerNumber: yup.string().required(validateErrors.required),
  sealNumber: yup.string().required(validateErrors.required),

  coverageGoodType: yup.string().nullable().optional(),
  coverageQuantity: yup.number().typeError(validateErrors.mustBeNumber).nullable().optional(),

  initialized: yup.boolean().default(false),
  multiple: yup.boolean().default(false),
  saved: yup.boolean().default(false),
  defaultValueForMultiple: yup.mixed<ActualTowingMetaDataForMultiple>().nullable()
});

export const weighingSlipSchema = yup.object().shape({
  actualTowing: yup.array().of(actualTowingSchema).required(validateErrors.required).min(1, validateErrors.required),

  hasOverWeight: yup.boolean().default(false)
});

export type LogisticItemFormProps = yup.InferType<typeof logisticItemSchema>;

export type LogisticFormProps = yup.InferType<typeof logisticSchema>;

export type ActualTowingFormProps = yup.InferType<typeof actualTowingSchema>;

export type WeighingSlipFormProps = yup.InferType<typeof weighingSlipSchema>;

export type FormProps = {
  logistic?: Partial<LogisticFormProps>;
};
