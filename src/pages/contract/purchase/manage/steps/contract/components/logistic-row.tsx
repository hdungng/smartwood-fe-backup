import { FormHelperText, TableRow, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../schema';
import React, { useMemo } from 'react';
import { useContractPurchaseManageContext } from '../../../providers';
import {
  SupplierCell,
  EndDateCell,
  PriceCell,
  QuantityCell,
  RegionCell,
  StartDateCell,
  GoodTypeCell,
  GoodCell,
  LogisticCell,
  ValidateDateWatcher,
  RemainingQuantityCell,
  ActualQuantityCell,
  ActionCell,
  RemainingQuantityWatcher
} from './logistic-cells';
import { getLogisticPropertyName } from './logistic-cells/utils';
import { useInitializedRowWatcher, useValidateQuantity } from './hook';

type Props = {
  index: number;
  onRemove: VoidFunction;
  onAllocate: (parent: LogisticItemFormProps) => void;
  onAdd: VoidFunction;
};

const LogisticRow = ({ index, onRemove, onAllocate, onAdd }: Props) => {
  const { control } = useFormContext<LogisticFormProps>();
  const { fieldOnlyView } = useContractPurchaseManageContext();

  const { helperText } = useValidateQuantity({ index });

  useInitializedRowWatcher(index);

  const hasConflictDate = useWatch({
    control,
    name: getLogisticPropertyName('hasConflict', index)
  });

  const hasOverQuantity = useWatch({
    control,
    name: getLogisticPropertyName('hasOverQuantity', index)
  }) as boolean | undefined;

  const initialized = useWatch({
    control,
    name: getLogisticPropertyName('initialized', index)
  }) as boolean;

  return (
    <TableRow>
      <ValidateDateWatcher index={index} />

      <RemainingQuantityWatcher index={index} />

      <RegionCell index={index} />

      {/* Supplier */}
      <SupplierCell index={index} />

      {/* Goods */}
      <GoodCell index={index} />

      {/* Quality Type */}
      <GoodTypeCell index={index} />

      <LogisticCell index={index} colSpan={3} sx={{ p: initialized ? 0 : 1 }}>
        <TableRow>
          {/* Quantity */}
          <QuantityCell index={index} />

          {/* Actual Quantity */}
          <ActualQuantityCell index={index} />

          {/* Remaining Quantity */}
          <RemainingQuantityCell index={index} />
        </TableRow>

        {hasOverQuantity && (
          <FormHelperText sx={{ ml: 3, mb: 1.5 }}>
            <Typography variant="caption" color="error">
              {helperText}
            </Typography>
          </FormHelperText>
        )}
      </LogisticCell>

      {/* Purchase Price */}
      <PriceCell index={index} />

      <LogisticCell index={index} colSpan={2} sx={{ p: initialized ? 0 : 1 }}>
        <TableRow>
          {/* Start Date */}
          <StartDateCell index={index} />

          {/* End Date */}
          <EndDateCell index={index} onAdd={onAdd} />
        </TableRow>

        {hasConflictDate && (
          <FormHelperText sx={{ ml: 3, mb: 1.5 }}>
            <Typography variant="caption" color="error">
              Ngày bắt đầu và kết thúc đã trùng với dòng khác
            </Typography>
          </FormHelperText>
        )}
      </LogisticCell>

      <ActionCell index={index} onRemove={onRemove} fieldOnlyView={fieldOnlyView} onAllocate={onAllocate} />
    </TableRow>
  );
};

export default React.memo(LogisticRow);
