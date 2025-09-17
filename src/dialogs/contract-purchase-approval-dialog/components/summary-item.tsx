import { Stack, Typography } from '@mui/material';
import { numberHelper } from 'utils';
import { ReactNode } from 'react';

type Props = {
  title: string;
  value: ReactNode;
  color: 'success' | 'error' | 'warning' | 'info';
};

const SummaryItem = ({ title, value, color }: Props) => {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      bgcolor={`${color}.lighter`}
      border={(theme) => `1px solid ${theme.palette[color].main}`}
      py={3}
    >
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Stack>
  );
};

export default SummaryItem;