import * as yup from 'yup';

// Validation schema for Product form
export const productScheme = yup.object({
  name: yup.string().required('Product name is required'),
  price: yup.number().min(0, 'Price must be positive').required('Price is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  stock: yup.number().min(0, 'Stock must be positive').required('Stock is required'),
  sku: yup.string().optional(),
  image: yup.string().optional(),
  status: yup.number().required('Status is required')
});
