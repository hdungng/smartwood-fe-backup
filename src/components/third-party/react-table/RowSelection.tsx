// material-ui
import Chip from '@mui/material/Chip';
import { useIntl } from 'react-intl';

// ==============================|| ROW SELECTION - PREVIEW ||============================== //

export default function RowSelection({ selected }: { selected: number }) {
  const intl = useIntl();
  return (
    <>
      {selected > 0 && (
        <Chip
          size="small"
          label={`${selected} ${intl.formatMessage({ id: 'row_selected' })}`}
          color="secondary"
          variant="light"
          sx={{ position: 'absolute', right: -1, top: -1, borderRadius: '0 4px 0 4px' }}
        />
      )}
    </>
  );
}
