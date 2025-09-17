import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { Box } from '@mui/system';
import { numberHelper } from 'utils';
import { useBusinessPlanManageContext } from '../../../provider';
import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../schema';
import { useConfiguration } from 'hooks';
import { useEffect, useMemo } from 'react';

const SummarySection = () => {
  const { businessPlan, setTotalCostSupplier } = useBusinessPlanManageContext();
  const { control } = useFormContext<SupplierFormProps>();
  const { mapConfigObject } = useConfiguration();

  const watchedSuppliers = useWatch({
    control,
    name: 'suppliers'
  }) as SupplierFormProps['suppliers'];

  const totalWeight = useMemo(() => {
    const currentSuppliers = watchedSuppliers || [];
    return currentSuppliers.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);
  }, [watchedSuppliers]);

  const totalCost = useMemo(() => {
    const currentSuppliers = watchedSuppliers || [];
    return currentSuppliers.reduce((acc, cur) => {
      const totalAmount = cur.quantity * cur.purchasePrice;
      return acc + Number(totalAmount);
    }, 0);
  }, [watchedSuppliers]);

  useEffect(() => {
    setTotalCostSupplier(totalCost);
  }, [totalCost]);

  return (
    <Stack bgcolor="#f8f9fa" borderRadius={2} spacing={2} p={2}>
      <Typography variant="body1" fontWeight={800}>
        Tổng kết đơn hàng
      </Typography>

      <Stack direction="row" spacing={3} alignContent="center">
        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Tổng khối lượng:
          </Typography>
          <Typography sx={{ color: '#1677ff' }} fontWeight="bold">
            {numberHelper.formatNumber(totalWeight, {
              maxDigits: 4
            })}{' '}
            {mapConfigObject('UNIT-OF-MEASURE', businessPlan?.draftPo?.unitOfMeasure)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Tổng giá trị đơn hàng:
          </Typography>
          <Typography sx={{ color: '#52c41a' }} fontWeight="bold">
            {numberHelper.formatNumber(totalCost || 0)} VND
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Số lượng nhà cung cấp:
          </Typography>
          <Typography sx={{ color: '#13c2c2' }} fontWeight="bold">
            {numberHelper.formatNumber((watchedSuppliers || []).length)} nhà cung cấp
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#8c8c8c' }}>
            Giá mua trung bình/{mapConfigObject('UNIT-OF-MEASURE', businessPlan?.draftPo?.unitOfMeasure)}:
          </Typography>
          <Typography sx={{ color: '#eb3c9a' }} fontWeight="bold">
            {numberHelper.formatNumber(totalCost / totalWeight || 0)} VND /
            {mapConfigObject('UNIT-OF-MEASURE', businessPlan?.draftPo?.unitOfMeasure)}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default SummarySection;
