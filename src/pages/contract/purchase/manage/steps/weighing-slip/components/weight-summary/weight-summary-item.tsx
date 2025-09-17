import Typography from '@mui/material/Typography';
import { Alert, Stack } from '@mui/material';
import { numberHelper } from 'utils';
import { ReactNode, useMemo } from 'react';
import { useConfiguration } from 'hooks';
import { CODE_QUALITY_TYPE, CODE_REGION } from 'constants/code';
import { useGlobal } from 'contexts';
import Box, { BoxProps } from '@mui/material/Box';

export type WeightSummaryBoxProps = {
  title: string;
  children: ReactNode;
  color?: string;
  slotProps?: {
    root?: Omit<BoxProps, 'children' | 'component'>;
  };
};

const WeightSummaryBox = ({ title, children, color = '#2d2d2d', slotProps }: WeightSummaryBoxProps) => {
  return (
    <Box {...slotProps?.root}>
      <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
        {title}
      </Typography>
      <Typography sx={{ color }} variant="body1" fontWeight="bold">
        {children}
      </Typography>
    </Box>
  );
};

export type WeightSummaryItemProps = {
  region: string;
  supplierId: number;
  goodType: string;
  minDate: string;
  maxDate: string;
  totalWeight: number;
  currentWeight: number;
  hasOverWeight: boolean;
};

const WeightSummaryItem = (props: WeightSummaryItemProps) => {
  const { mapConfigObject } = useConfiguration();
  const { supplierOptions } = useGlobal();
  const { region, supplierId, goodType, minDate, maxDate, totalWeight, currentWeight, hasOverWeight } = props;

  const remainingWeight = useMemo(() => {
    const result = totalWeight - currentWeight;
    if (result < 0) {
      return 0;
    }
    return result;
  }, [totalWeight, currentWeight]);

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={4} alignContent="center">
        <WeightSummaryBox title="Khu vực:">{mapConfigObject(CODE_REGION, region) || 'Chưa xác định'}</WeightSummaryBox>
        <WeightSummaryBox title="Xưởng / Nhà máy:" slotProps={{ root: { width: 280 } }}>
          {supplierOptions.find((x) => x.value === Number(supplierId))?.label || 'Chưa xác định'}
        </WeightSummaryBox>
        <WeightSummaryBox title="Chất lượng hàng:">{mapConfigObject(CODE_QUALITY_TYPE, goodType) || 'Chưa xác định'}</WeightSummaryBox>
        <WeightSummaryBox title="Thời gian bắt đầu - kết thúc:">{`${minDate} - ${maxDate}`}</WeightSummaryBox>
        <WeightSummaryBox title="Tổng khối lượng:" color="#13b900">
          {`${numberHelper.formatNumber(totalWeight || 0)} Kg`}
        </WeightSummaryBox>
        <WeightSummaryBox title="Khối lượng còn lại:" color="#c70101">
          {`${numberHelper.formatNumber(remainingWeight)} Kg`}
        </WeightSummaryBox>
      </Stack>

      {hasOverWeight && (
        <Alert color="error" severity="error">
          Khối lượng nhập <strong>{numberHelper.formatNumber(currentWeight)}</strong> lớn hơn khối lượng tối đa{' '}
          <strong>{numberHelper.formatNumber(totalWeight)}</strong>
        </Alert>
      )}
    </Stack>
  );
};

export default WeightSummaryItem;
