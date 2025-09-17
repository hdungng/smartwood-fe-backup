import { SupplierCell } from './cell';
import { Field } from 'forms';
import { useBusinessPlanManageContext } from '../../../../provider';
import { getSupplierPropertyName } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../../schema';
import { SupplierDefaultValue } from '../../../../types';
import { useEffect } from 'react';
import { useConfiguration } from 'hooks';
import { CODE_QUALITY_TYPE } from 'constants/code';

type Props = IndexProps;

const GoodTypeCell = ({ index }: Props) => {
  const { fieldOnlyView } = useBusinessPlanManageContext();
  const { mapConfigSelection } = useConfiguration();

  const goodTypeOptions = mapConfigSelection(CODE_QUALITY_TYPE);

  const { control, setValue } = useFormContext<SupplierFormProps>();

  const defaultValueRow = useWatch({
    control,
    name: getSupplierPropertyName('defaultValue', index)
  }) as SupplierDefaultValue | undefined;

  useEffect(() => {
    if (!defaultValueRow?.goodType || goodTypeOptions.length === 0) return;

    setValue(getSupplierPropertyName('goodType', index), defaultValueRow.goodType || null);
    setValue(getSupplierPropertyName('defaultValue', index), {
      ...defaultValueRow,
      goodType: null
    });
  }, [defaultValueRow?.goodType, goodTypeOptions]);

  return (
    <SupplierCell>
      <Field.Select
        readOnly={fieldOnlyView}
        name={getSupplierPropertyName('goodType', index)}
        options={goodTypeOptions}
        defaultOptionLabel="Chọn loại chất lượng"
      />
    </SupplierCell>
  );
};

export default GoodTypeCell;
