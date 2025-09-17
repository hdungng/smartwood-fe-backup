import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useContractPurchaseManageContext } from '../../../../providers';
import Button from '@mui/material/Button';
import { useAllRowsInitialized } from '../hooks';

type Props = {
  onAddManually: VoidFunction;
  onAddFromPlan: VoidFunction;
};

const ActualTowingHeader = ({ onAddManually, onAddFromPlan }: Props) => {
  const { mode } = useContractPurchaseManageContext();

  const { initialized } = useAllRowsInitialized();

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" gutterBottom sx={{ my: 2 }}>
        Thực tế kéo hàng
      </Typography>

      {(mode !== 'view' && initialized) && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={onAddManually}>
            Thêm
          </Button>

          <Button variant="contained" onClick={onAddFromPlan}>
            Thêm từ kế hoạch
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default ActualTowingHeader;
