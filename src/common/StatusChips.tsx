import { Chip } from '@mui/material'; // hoặc lib UI bạn dùng
import { getStatusColor, getStatusLabelIntl, Status } from 'constants/status';
import { IntlShape } from 'react-intl';

export interface ConfigChip {
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  label: string;
}

export const factoryChip = (config: Record<number, ConfigChip>) => {
  return ({ status }: { status: number }) => {
    const currentConfig = config[status] || { color: 'default', label: 'Unknown' };
    return <Chip color={currentConfig.color} label={currentConfig.label} size="small" variant="outlined" />;
  };
};

export const StatusChipCommon = ({ status, intl }: { status: Status; intl: IntlShape }) => {
  return (
    <Chip
      label={getStatusLabelIntl(intl, status)}
      color={getStatusColor(status)}
      size="small"
      variant="outlined"
    />
  );
};
