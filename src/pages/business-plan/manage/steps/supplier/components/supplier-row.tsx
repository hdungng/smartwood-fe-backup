import { IconButton, TableRow } from '@mui/material';
import { DeleteOutlined } from '@ant-design/icons';
import Tooltip from '@mui/material/Tooltip';
import { useBusinessPlanManageContext } from '../../../provider';
import {
  ExportPortCell,
  TotalAmountCell,
  GoodTypeCell,
  GoodCell,
  PriceCell,
  QuantityCell,
  RegionCell,
  SupplierCell
} from './supplier-cell';

type Props = {
  index: number;
  canRemove: boolean;
  onRemove: VoidFunction;
  onAdd: VoidFunction;
};

const SupplierRow = ({ index, canRemove, onAdd, onRemove }: Props) => {
  const { fieldOnlyView } = useBusinessPlanManageContext();

  return (
    <TableRow key={index}>
      {/* Goods */}
      <GoodCell index={index} />

      {/* Quality Type */}
      <GoodTypeCell index={index} />

      {/* Region */}
      <RegionCell index={index} />

      {/* Export Port */}
      <ExportPortCell index={index} />

      {/* Quantity */}
      <QuantityCell index={index} />

      {/* Purchase Price */}
      <PriceCell index={index} onAdd={onAdd} />

      {/* Total Amount */}
      <TotalAmountCell index={index} />

      {/* Action */}
      {!fieldOnlyView && (
        <SupplierCell
          sx={{
            textAlign: 'center'
          }}
        >
          <Tooltip title="Xóa">
            <IconButton
              color="error"
              size="medium"
              disabled={!canRemove}
              onClick={() => onRemove()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onRemove();
                }
              }}
            >
              <DeleteOutlined />
            </IconButton>
          </Tooltip>
        </SupplierCell>
      )}
    </TableRow>
  );
};

export default SupplierRow;
