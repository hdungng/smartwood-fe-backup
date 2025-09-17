import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { numberHelper, unitHelper } from 'utils';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../schema';
import { Box } from '@mui/system';

const LogisticSummary = () => {
  const { control, setValue } = useFormContext<LogisticFormProps>();

  const logistics = useWatch({
    control,
    name: 'logistics'
  }) as LogisticItemFormProps[];

  const totalWeight = useMemo(() => (logistics || []).reduce((acc, cur) => acc + Number(cur.quantity || 0), 0), [logistics]);

  const totalCost = useMemo(() => {
    const currentItems = logistics || [];
    const total = currentItems
      .filter((x) => !x.parentId)
      .reduce((acc, cur) => acc + (Number(cur.unitPrice || 0) * Number(cur.quantity) || 0), 0);

    return unitHelper.fromKgToTon(total);
  }, [logistics]);

  const totalWeightInTon = useMemo(() => unitHelper.fromKgToTon(totalWeight), [totalWeight]);

  const priceAverage = useMemo(() => (totalWeightInTon === 0 ? 0 : totalCost / totalWeightInTon), [totalWeightInTon, totalCost]);

  useEffect(() => {
    setValue('priceAverage', priceAverage);
  }, [priceAverage]);

  return (
    <Stack bgcolor="#f8f9fa" borderRadius={2} spacing={2} p={2} width="100%">
      <Typography variant="body1" fontWeight={800}>
        Tổng hợp
      </Typography>

      <Stack direction="row" spacing={5} alignContent="center">
        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Tổng lượng hàng:
          </Typography>
          <Typography sx={{ color: '#1677ff' }} fontWeight="bold">
            {numberHelper.formatNumber(totalWeightInTon, {
              maxDigits: 8
            })}{' '}
            Tấn
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Tổng giá trị đơn hàng theo tấn:
          </Typography>
          <Typography sx={{ color: '#52c41a' }} fontWeight="bold">
            {numberHelper.formatNumber(totalCost || 0)} VND
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Đơn giá trung bình/tấn hàng hóa:
          </Typography>
          <Typography sx={{ color: '#eb3c9a' }} fontWeight="bold">
            {numberHelper.formatNumber(priceAverage || 0)} VND / Tấn
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default LogisticSummary;
