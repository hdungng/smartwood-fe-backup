import * as yup from 'yup';
import { Status } from '../constants/status';

// Validation schema for User form
export const userScheme = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  language: yup.string().optional(),
  password: yup.string().when('isEditing', {
    is: false,
    then: (schema) => schema.min(8, 'Password must be at least 8 characters').required('Password is required'),
    otherwise: (schema) => schema.optional()
  }),
  roleId: yup.number().required('Role is required'),
  status: yup
    .number()
    .oneOf([Status.INACTIVE, Status.ACTIVE, Status.PENDING], 'Please select a valid status')
    .required('Status is required')
});
