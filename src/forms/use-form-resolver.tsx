import type yup from 'yup';
import type { Resolver, FieldValues, UseFormProps } from 'react-hook-form';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export function useFormResolver<TFieldValues extends FieldValues = FieldValues, TContext = Dynamic>(
  schema: yup.ObjectSchema<TFieldValues>,
  options?: Omit<UseFormProps<TFieldValues, TContext>, 'resolver'>
) {
  return useForm<TFieldValues, TContext>({
    mode: 'all',
    reValidateMode: 'onChange',
    ...options,
    resolver: yupResolver(schema) as unknown as Resolver<TFieldValues, TContext>
  });
}
