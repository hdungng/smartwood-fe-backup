import { SupplierCell } from './cell';
import { getSupplierPropertyName } from './utils';
import { SelectionOption } from 'types/common';
import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../../schema';
import { Input } from 'components/@extended/input';

type Props = IndexProps;

const GoodCell = ({ index }: Props) => {
  const { control } = useFormContext<SupplierFormProps>();
  const selectedGood = useWatch({
    control,
    name: getSupplierPropertyName('good', index)
  }) as SelectionOption | undefined;

  return (
    <SupplierCell>
      <Input.Text readOnly value={selectedGood?.label || ''} />
    </SupplierCell>
  );
};

export default GoodCell;
