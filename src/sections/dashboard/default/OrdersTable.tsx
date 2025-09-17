// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import Dot from 'components/@extended/Dot';

// assets
import { ColorProps } from 'types/extended';
import { Button } from '@mui/material';

// types
interface Data {
  name: string;
  carbs: number;
  tracking_no: number;
  note: string;
  action?: string;
}

function createData(tracking_no: number, name: string, carbs: number, note: string): Data {
  return { tracking_no, name, carbs, note };
}

const rows: Data[] = [
  createData(84564564, 'Oak', 2, 'Contains 2g of carbs. Reference note: 40570.'),
  createData(98764564, 'Maple', 0, 'Zero carbs included. Reference note: 180139.'),
  createData(98756325, 'Walnut', 1, 'Low-carb item with 1g of carbs. Reference note: 90989.'),
  createData(98652366, 'Mahogany', 1, 'Includes 1g of carbs. Note ID: 10239.'),
  createData(13286564, 'Birch', 1, 'Light carb content—1g. Associated note: 83348.'),
  createData(86739658, 'Cherry', 0, 'No carbs in this item. Note reference: 410780.'),
  createData(13256498, 'Pine', 2, 'Higher carb content at 2g. Note: 70999.'),
  createData(98753263, 'Teak', 2, 'Includes 2g of carbs. Internal note: 10570.'),
  createData(98753275, 'Cedar', 1, 'Light carb content—1g. Note reference: 98063.'),
  createData(98753291, 'Bamboo', 0, 'No carbs in this order. Note ID: 14001.')
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// ==============================|| ORDER TABLE - HEADER CELL ||============================== //

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  align: 'center' | 'left' | 'right' | 'inherit' | 'justify' | undefined;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'tracking_no',
    align: 'left',
    disablePadding: false,
    label: 'Mã đơn hàng'
  },
  {
    id: 'name',
    align: 'left',
    disablePadding: true,
    label: 'Tên khách hàng'
  },
  {
    id: 'carbs',
    align: 'left',
    disablePadding: false,
    label: 'Trạng thái'
  },
  {
    id: 'note',
    align: 'left',
    disablePadding: false,
    label: 'Note'
  },
  {
    id: 'action',
    align: 'center',
    disablePadding: false,
    label: 'Hành động'
  }
];

interface OrderTableHeadProps {
  order: Order;
  orderBy: string;
}

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead({ order, orderBy }: OrderTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ==============================|| ORDER TABLE - STATUS ||============================== //

interface Props {
  status: number;
}

function OrderStatus({ status }: Props) {
  let color: ColorProps;
  let title: string;

  switch (status) {
    case 0:
      color = 'warning';
      title = 'Đơn hàng chưa thanh toán';
      break;
    case 1:
      color = 'info';
      title = 'Có vấn đề về QC';
      break;
    case 2:
      color = 'error';
      title = 'Chậm tiến độ';
      break;
    default:
      color = 'primary';
      title = 'None';
  }

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  );
}

// ==============================|| ORDER TABLE ||============================== //

export default function OrderTable() {
  const order: Order = 'asc';
  const orderBy: keyof Data = 'tracking_no';

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="tableTitle">
          <OrderTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  tabIndex={-1}
                  key={row.tracking_no}
                >
                  <TableCell component="th" id={labelId} scope="row">
                    <Link color="secondary">{row.tracking_no}</Link>
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <OrderStatus status={row.carbs} />
                  </TableCell>
                  <TableCell align="left">
                    <Typography>{row.note}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button onClick={() => {}}>Xem chi tiết</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
