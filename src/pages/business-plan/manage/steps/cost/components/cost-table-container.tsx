import { useBusinessPlanManageContext } from '../../../provider';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { CostFormProps } from '../../../schema';
import { CostKeySection } from '../../../types';
import CostRow from './cost-row';
import { useFormContext, useWatch } from 'react-hook-form';
import { BusinessPlanCostExtendData, ItemCode } from 'services/business-plan';

const COLUMNS_WIDTH = {
  name: '50%',
  amount: '25%',
  amountConversion: '25%'
};

type ConstTableContainerProps = {
  sectionKey: CostKeySection;
  costExtendData?: BusinessPlanCostExtendData;
};

const CostTableContainer = ({ sectionKey, costExtendData }: ConstTableContainerProps) => {
  const { businessPlan, totalCostSupplier, totalWeightSupplier } = useBusinessPlanManageContext();
  const { control } = useFormContext<CostFormProps>();

  const items = useWatch({
    control,
    name: `${sectionKey}.items`
  });

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', width: COLUMNS_WIDTH.name }}>Tên chi phí</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: COLUMNS_WIDTH.amount }}>Giá (VND)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: COLUMNS_WIDTH.amountConversion }}>Giá ({businessPlan?.currency})</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            return (
              <CostRow
                key={item.itemCode}
                detail={item}
                index={index}
                sectionKey={sectionKey}
                costExtendData={costExtendData}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CostTableContainer;
