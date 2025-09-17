import { SupplierCell } from './cell';
import { Field } from 'forms';
import { useBusinessPlanManageContext } from '../../../../provider';
import { SelectionOption } from 'types/common';
import { getSupplierPropertyName } from './utils';
import { SupplierFormProps } from '../../../../schema';
import { useFormContext, useWatch } from 'react-hook-form';
import { ExportPortMetaData } from 'services/config';
import { useEffect, useState } from 'react';
import { SupplierDefaultValue } from '../../../../types';
import { useConfiguration, usePrevious } from 'hooks';
import { CODE_EXPORT_PORT } from 'constants/code';

type Props = IndexProps;

const ExportPortCell = ({ index }: Props) => {
  const { fieldOnlyView } = useBusinessPlanManageContext();
  const { mapConfigSelection } = useConfiguration();
  const { control, setValue } = useFormContext<SupplierFormProps>();
  const [exportPortOptions, setExportPortOptions] = useState<SelectionOption<ExportPortMetaData>[]>([]);
  const selectedRegion = useWatch({
    control,
    name: getSupplierPropertyName('region', index)
  }) as string | null;

  const previousRegion = usePrevious(selectedRegion);

  const defaultValueRow = useWatch({
    control,
    name: getSupplierPropertyName('defaultValue', index)
  }) as SupplierDefaultValue | undefined;

  useEffect(() => {
    if (!selectedRegion || previousRegion === selectedRegion) return;

    const exportPorts = mapConfigSelection(CODE_EXPORT_PORT) as SelectionOption<ExportPortMetaData>[];
    const filterExportPortOptions = exportPorts.filter((port) => port.metadata?.region === selectedRegion);
    setExportPortOptions(filterExportPortOptions);

    setValue(getSupplierPropertyName('exportPort', index), null as Dynamic);
  }, [selectedRegion, previousRegion]);

  useEffect(() => {
    if (!defaultValueRow?.exportPort || exportPortOptions.length === 0) return;

    const defaultExportPort = exportPortOptions.find((port) => port.value === defaultValueRow.exportPort);

    setValue(getSupplierPropertyName('exportPort', index), defaultExportPort?.value || null);
    setValue(getSupplierPropertyName('defaultValue', index), {
      ...defaultValueRow,
      exportPort: null
    });
  }, [defaultValueRow?.exportPort, exportPortOptions]);

  return (
    <SupplierCell>
      <Field.Select
        readOnly={fieldOnlyView}
        name={getSupplierPropertyName('exportPort', index)}
        options={exportPortOptions}
        defaultOptionLabel="Chọn cảng xuất"
      />
    </SupplierCell>
  );
};

export default ExportPortCell;
