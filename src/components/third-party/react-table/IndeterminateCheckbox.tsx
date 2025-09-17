// material-ui
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';

// ==============================|| ROW SELECTION - CHECKBOX ||============================== //

export default function IndeterminateCheckbox({ indeterminate, ...rest }: { indeterminate?: boolean } & CheckboxProps) {
  return (
    <Checkbox
      {...rest}
      indeterminate={typeof indeterminate === 'boolean' && !rest.checked && indeterminate}
      sx={{
        color: '#1976d2',
        '&.Mui-checked': {
          color: '#1976d2'
        }
      }}
    />
  );
}
