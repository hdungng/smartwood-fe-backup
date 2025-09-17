import React, { useCallback, useEffect, useMemo } from 'react';
import { Field } from 'forms';
import { InputAdornment, TableCell } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import { CostDetailItemFormProps, CostFormProps, OptionalCostDetailItemFormProps } from '../../../schema';
import { useBusinessPlanManageContext } from '../../../provider';
import { useFormContext, useWatch } from 'react-hook-form';
import { CostKeySection } from '../../../types';
import Typography from '@mui/material/Typography';
import { useCostConfig, useCostConversion } from './hook';
import Stack from '@mui/material/Stack';
import { BusinessPlanCostExtendData } from 'services/business-plan';

type Props = {
  index: number;
  sectionKey: CostKeySection;
  detail: CostDetailItemFormProps | OptionalCostDetailItemFormProps;
  costExtendData?: BusinessPlanCostExtendData;
};

const CostRow = ({ index, sectionKey, detail, costExtendData }: Props) => {
  const { fieldOnlyView } = useBusinessPlanManageContext();
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext<CostFormProps>();
  const {
    rate,
    itemConfig: { local, foreign, percent, autoCalculate }
  } = useCostConfig({ index, sectionKey, costItem: detail, costExtendData });

  useEffect(() => {
    if (local?.defaultValue !== undefined && local?.defaultValue !== null) {
      setValue(getCostProperName('amount'), Number(local?.defaultValue), { shouldValidate: false });
    }
  }, []);

  useEffect(() => {
    if (local?.value !== undefined && local?.value !== null) {
      setValue(getCostProperName('amount'), Number(local?.value), { shouldValidate: false });
    }
  }, [local?.value]);

  useEffect(() => {
    if (foreign?.defaultValue !== undefined && foreign?.defaultValue !== null) {
      setValue(getCostProperName('amountConversion'), Number(foreign?.defaultValue), { shouldValidate: false });
    }
  }, []);

  useEffect(() => {
    if (foreign?.value !== undefined && foreign?.value !== null) {
      setValue(getCostProperName('amountConversion'), Number(foreign?.value), { shouldValidate: false });
    }
  }, [foreign?.value]);

  const getCostProperName = useCallback(
    (property: keyof CostDetailItemFormProps): `${CostKeySection}.${'items'}.${number}.${keyof CostDetailItemFormProps}` =>
      `${sectionKey}.items.${index}.${property}`,
    [index]
  );

  useCostConversion<CostFormProps>({
    from: {
      field: getCostProperName('amount'),
      ...local
    },
    to: {
      field: getCostProperName('amountConversion'),
      ...foreign
    },
    rate
  });

  const watchUnit = useWatch<CostFormProps>({
    control,
    name: getCostProperName('unit')
  });

  const hasErrorInRow = useMemo(
    () =>
      !!errors[sectionKey]?.items?.[index]?.amount?.message ||
      !!errors[sectionKey]?.items?.[index]?.amountConversion?.message ||
      !!errors[sectionKey]?.items?.[index]?.percentage?.message,
    [errors[sectionKey]?.items?.[index]]
  );

  const renderUnit = (
    <InputAdornment position="end">
      <Typography variant="caption">{watchUnit as string}</Typography>
    </InputAdornment>
  );

  const isPercentage = useWatch({
    control,
    name: getCostProperName('isPercentage')
  }) as boolean | undefined;

  const percentage = useWatch({
    control,
    name: getCostProperName('percentage')
  }) as number | undefined;

  useEffect(() => {
    if (isPercentage && percentage !== undefined && percentage !== null) {
      const amount = percent?.onCalculateByPercent?.(percentage);
      if (amount !== undefined) {
        setValue(getCostProperName('amount'), amount, { shouldValidate: false, shouldDirty: false });
        setValue(getCostProperName('amountConversion'), amount * rate, { shouldValidate: false, shouldDirty: false });
      }
    }
  }, [percentage]);

  useEffect(() => {
    if (percent?.defaultValue !== undefined && percent?.defaultValue !== null) {
      setValue(getCostProperName('percentage'), Number(percent?.defaultValue), { shouldValidate: false, shouldDirty: false });
    }
  }, [isPercentage]);

  return (
    <TableRow>
      <TableCell sx={{ verticalAlign: hasErrorInRow ? 'top' : 'middle' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
          <Stack spacing={1}>
            <Typography>{detail.name}</Typography>
            <Typography variant="caption" color="text.secondary" fontStyle="italic">
              {autoCalculate && '(Tự động tính từ công thức)'}
            </Typography>
          </Stack>

          {isPercentage && (
            <Field.Number
              readOnly={fieldOnlyView}
              name={getCostProperName('percentage')}
              sx={{
                width: 120
              }}
              fullWidth={false}
              slotProps={{
                container: {
                  alignItems: 'flex-end'
                },
                input: {
                  endAdornment: <span>%</span>
                },
                number: {
                  decimalScale: 4,
                  min: 0,
                  max: 100
                }
              }}
            />
          )}
        </Stack>
      </TableCell>

      <TableCell sx={{ verticalAlign: hasErrorInRow ? 'top' : 'middle' }}>
        <Field.Number
          readOnly={fieldOnlyView}
          name={getCostProperName('amount')}
          slotProps={{
            input: {
              endAdornment: renderUnit,
              sx: {
                ...(local?.disabled && { backgroundColor: '#f5f5f5' })
              }
            }
          }}
          disabled={local?.disabled}
        />
      </TableCell>
      <TableCell sx={{ verticalAlign: hasErrorInRow ? 'top' : 'middle' }}>
        <Field.Number
          readOnly={fieldOnlyView}
          name={getCostProperName('amountConversion')}
          slotProps={{
            input: {
              endAdornment: renderUnit,
              sx: {
                ...(foreign?.disabled && { backgroundColor: '#f5f5f5' })
              }
            },
            number: {
              decimalScale: 4
            }
          }}
          disabled={foreign?.disabled}
        />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(CostRow);
