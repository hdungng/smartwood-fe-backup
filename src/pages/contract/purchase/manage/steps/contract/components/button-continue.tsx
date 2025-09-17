import { Button } from '@mui/material';
import { useContractPurchaseManageContext } from '../../../providers';
import { useAllRowsInitialized } from './hook';

type Props = {
  onClick: VoidFunction;
  disabled: boolean;
};

const ButtonSubmit = ({ onClick, disabled }: Props) => {
  const { purchaseContract, saleContract } = useContractPurchaseManageContext();
  const { initialized } = useAllRowsInitialized();

  return (
    <Button variant="contained" onClick={onClick} disabled={!saleContract || !purchaseContract?.id || !initialized || disabled}>
      Tiếp tục
    </Button>
  );
};

export default ButtonSubmit;
