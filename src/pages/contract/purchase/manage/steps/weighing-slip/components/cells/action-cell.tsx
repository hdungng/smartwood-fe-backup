import { ActualTowingCell } from './actual-towing-cell';
import { IconButton } from '@mui/material';
import { DeleteOutlined } from '@ant-design/icons';
import React from 'react';
import { useContractPurchaseManageContext } from '../../../../providers';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { getActualTowingPropertyName } from './utils';

type Props = IndexProps & {
  canRemove: boolean;
  onRemove: VoidFunction;
};

const ActionCell = ({ index, canRemove, onRemove }: Props) => {
  const { mode } = useContractPurchaseManageContext();
  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  return (
    <ActualTowingCell index={index} sx={{ textAlign: 'center' }}>
      <IconButton
        color="error"
        onClick={onRemove}
        disabled={mode === 'view' || !canRemove || saved}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onRemove();
          }
        }}
      >
        <DeleteOutlined />
      </IconButton>
    </ActualTowingCell>
  );
};

export default React.memo(ActionCell, (prevProps, nextProps) => {
  return prevProps.index === nextProps.index && prevProps.canRemove === nextProps.canRemove;
});
