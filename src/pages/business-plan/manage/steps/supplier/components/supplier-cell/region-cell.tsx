import { SupplierCell } from './cell';
import { Field } from 'forms';
import { useBusinessPlanManageContext } from '../../../../provider';
import { getSupplierPropertyName } from './utils';
import { useConfiguration } from 'hooks';
import { CODE_REGION } from 'constants/code';

type Props = IndexProps;

const RegionCell = ({ index }: Props) => {
  const { fieldOnlyView } = useBusinessPlanManageContext();
  const { mapConfigSelection } = useConfiguration();

  const regionOptions = mapConfigSelection(CODE_REGION);

  return (
    <SupplierCell>
      <Field.Select
        readOnly={fieldOnlyView}
        name={getSupplierPropertyName('region', index)}
        options={regionOptions}
        defaultOptionLabel="Chọn khu vực"
      />
    </SupplierCell>
  );
};

export default RegionCell;
