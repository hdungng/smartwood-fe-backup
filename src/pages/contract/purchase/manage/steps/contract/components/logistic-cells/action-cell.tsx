import Tooltip from '@mui/material/Tooltip';
import { IconButton } from '@mui/material';
import { BranchesOutlined, DeleteOutlined } from '@ant-design/icons';
import { LogisticCell } from './logistic-cell';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../../schema';
import { getLogisticPropertyName } from './utils';
import { useContractPurchaseManageContext } from '../../../../providers';

type Props = IndexProps & {
  onRemove: VoidFunction;
  onAllocate: (parent: LogisticItemFormProps) => void;
  fieldOnlyView?: boolean;
};

const ActionCell = ({ index, onRemove, onAllocate }: Props) => {
  const { fieldOnlyView } = useContractPurchaseManageContext();
  const { control, getFieldState } = useFormContext<LogisticFormProps>();

  const { invalid } = getFieldState(`logistics.${index}`);

  const currentRow = useWatch({
    control,
    name: `logistics.${index}`
  }) as LogisticItemFormProps;

  const isFilled = useWatch({
    control,
    name: getLogisticPropertyName('isFilled', index)
  }) as boolean | undefined;

  const hasWeightSlip = useWatch({
    control,
    name: getLogisticPropertyName('hasWeightSlip', index)
  }) as boolean | undefined;

  return (
    <LogisticCell index={index} sx={{ textAlign: 'center' }}>
      <Tooltip title="Thêm phân bổ">
        <IconButton
          color="info"
          size="medium"
          disabled={isFilled || fieldOnlyView || !(currentRow?.id && !currentRow?.parentId && hasWeightSlip)}
          onClick={() => onAllocate(currentRow)}
          onKeyDown={(event) => event.key === 'Enter' && onAllocate(currentRow)}
        >
          <BranchesOutlined />
        </IconButton>
      </Tooltip>
      <Tooltip title="Xóa">
        <IconButton
          color="error"
          size="medium"
          disabled={(isFilled && invalid) || hasWeightSlip || fieldOnlyView}
          onClick={() => onRemove()}
          onKeyDown={(event) => event.key === 'Enter' && onRemove()}
        >
          <DeleteOutlined />
        </IconButton>
      </Tooltip>
    </LogisticCell>
  );
};

export default ActionCell;
