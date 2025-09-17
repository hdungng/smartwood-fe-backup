import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { numberHelper } from 'utils';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../schema';
import { Box } from '@mui/system';

const SummarySection = () => {
  const { control } = useFormContext<WeighingSlipFormProps>();

  const actualTowing = useWatch({
    control,
    name: 'actualTowing'
  }) as WeighingSlipFormProps['actualTowing'];

  const totalWeight = useMemo(() => (actualTowing || []).reduce((acc, cur) => acc + Number(cur.actualWeight || 0), 0), [actualTowing]);

  const totalCoverageWeight = useMemo(() => (actualTowing || []).reduce((acc, cur) => acc + Number(cur.coverageQuantity || 0), 0), [actualTowing]);

  const totalPrice = useMemo(
    () => (actualTowing || []).reduce((acc, cur) => acc + (Number(cur.goodPrice || 0) * Number(cur.actualWeight) || 0), 0),
    [actualTowing]
  );

  return (
    <Stack bgcolor="#f8f9fa" borderRadius={2} spacing={2} p={2} width="100%">
      <Typography variant="body1" fontWeight={800}>
        Tóm tắt tổng hợp
      </Typography>

      <Stack direction="row" spacing={6} alignContent="center">
        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Tổng trọng lượng hàng hóa:
          </Typography>
          <Typography sx={{ color: '#1677ff' }} fontWeight="bold">
            {numberHelper.formatNumber(totalWeight)} Kg
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Tổng trọng lượng phủ:
          </Typography>
          <Typography sx={{ color: '#3ccc03' }} fontWeight="bold">
            {numberHelper.formatNumber(totalCoverageWeight)} Kg
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Giá đơn vị trung bình:
          </Typography>
          <Typography sx={{ color: '#eb3c9a' }} fontWeight="bold">
            {numberHelper.formatNumber(totalWeight === 0 ? 0 : totalPrice / totalWeight)} VND / Kg
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default SummarySection;
