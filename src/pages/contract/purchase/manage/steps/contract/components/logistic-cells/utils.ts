import { LogisticItemFormProps } from '../../../../schema';

export const getLogisticPropertyName = (
  property: keyof LogisticItemFormProps,
  index: number
): `logistics.${number}.${keyof LogisticItemFormProps}` => `logistics.${index}.${property}`;
