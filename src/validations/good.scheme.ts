import * as yup from 'yup';
import { Status } from '../constants/status';

// Validation schema for Good form
export const goodScheme = yup.object({
  code: yup.string().required('Code is required'),
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  //category: yup.string().required('Category is required'),
  //brand: yup.string().required('Brand is required'),
  //model: yup.string().required('Model is required'),
  //sku: yup.string().required('SKU is required'),
  //barcode: yup.string().optional(),
  //unitOfMeasure: yup.string().required('Unit of measure is required'),
  weight: yup.number().min(0, 'Weight must be 0 or greater').required('Weight is required'),
  //dimensions: yup.string().required('Dimensions is required'),
  purchasePrice: yup.number().min(0, 'Purchase price must be 0 or greater').required('Purchase price is required'),
  sellingPrice: yup.number().min(0, 'Selling price must be 0 or greater').required('Selling price is required'),
  minStockLevel: yup.number().min(0, 'Min stock level must be 0 or greater').required('Min stock level is required'),
  maxStockLevel: yup.number().min(0, 'Max stock level must be 0 or greater').required('Max stock level is required'),
  reorderPoint: yup.number().min(0, 'Reorder point must be 0 or greater').required('Reorder point is required'),
  isSellable: yup.number().oneOf([0, 1], 'Please select a valid option').required('Is sellable is required'),
  isPurchasable: yup.number().oneOf([0, 1], 'Please select a valid option').required('Is purchasable is required'),
  taxRate: yup.number().min(0, 'Tax rate must be 0 or greater').max(100, 'Tax rate must be 100 or less').required('Tax rate is required'),
  supplierId: yup.number().min(0, 'Supplier ID must be 0 or greater').required('Supplier ID is required'),
  //originCountry: yup.string().required('Origin country is required'),
  expiryDays: yup.number().min(0, 'Expiry days must be 0 or greater').required('Expiry days is required'),
  status: yup
    .number()
    .oneOf([Status.INACTIVE, Status.ACTIVE, Status.PENDING], 'Please select a valid status')
    .required('Status is required')
});
