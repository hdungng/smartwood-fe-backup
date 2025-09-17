import { Field } from 'forms';
import { ActualTowingCell } from './actual-towing-cell';
import { getActualTowingPropertyName } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { SelectionOption } from 'types/common';
import { useEffect } from 'react';
import { useConfiguration } from 'hooks';
import { CODE_EXPORT_PORT } from 'constants/code';
import { CodeBookingMetaData } from '../../../../types';

const UnloadingPortCell = ({ index }: IndexProps) => {
  const { control, setValue } = useFormContext<WeighingSlipFormProps>();
  const { mapConfigObject } = useConfiguration();
  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  const selectedCodeBooking = useWatch({
    control,
    name: getActualTowingPropertyName('codeBooking', index)
  }) as SelectionOption<CodeBookingMetaData>;

  useEffect(() => {
    if (selectedCodeBooking && !saved) {
      const defaultUnloadingPort = mapConfigObject(CODE_EXPORT_PORT, selectedCodeBooking?.metadata?.exportPort);
      setValue(getActualTowingPropertyName('unloadingPort', index), defaultUnloadingPort || '');
    }
  }, [selectedCodeBooking, saved]);

  return (
    <ActualTowingCell index={index}>
      <Field.Text required name={getActualTowingPropertyName('unloadingPort', index)} placeholder="Nhập cảng đi" readOnly={saved} />
    </ActualTowingCell>
  );
};

export default UnloadingPortCell;
