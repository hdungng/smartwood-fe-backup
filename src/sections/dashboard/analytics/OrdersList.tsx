import { Link as RouterLink } from 'react-router-dom';

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

// third-party
import { NumericFormat } from 'react-number-format';

// project imports
import Dot from 'components/@extended/Dot';

// assets
import { ColorProps } from 'types/extended';

// types
interface Data {
  name: string;
  carbs: number;
  fat: number;
  tracking_no: number;
  protein: number;
}

function createData(tracking_no: number, name: string, fat: number, carbs: number, protein: number): Data {
  return { tracking_no, name, fat, carbs, protein };
}

const rows = [
  createData(10000001, 'Mùn cưa dăm gỗ loại A', 500, 1, 15000),
  createData(10000002, 'Mùn cưa dăm gỗ loại B', 300, 0, 12000),
  createData(10000003, 'Mùn cưa dăm gỗ xuất khẩu', 800, 2, 18000),
  createData(10000004, 'Viên nén gỗ 6mm', 1000, 1, 22000),
  createData(10000005, 'Viên nén gỗ 8mm', 700, 0, 21000),
  createData(10000006, 'Viên nén gỗ xuất khẩu ', 1200, 2, 25000),
  createData(10000007, 'Mùn cưa khô nghiền mịn', 450, 1, 14000),
  createData(10000008, 'Viên nén gỗ sinh khối', 950, 1, 23000),
  createData(10000009, 'Mùn cưa ép đóng bao', 600, 0, 16000),
  createData(10000010, 'Viên nén gỗ công nghiệp', 1100, 2, 20000)
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
    label: 'Tracking No.'
  },
  {
    id: 'name',
    align: 'left',
    disablePadding: true,
    label: 'Product Name'
  },
  {
    id: 'fat',
    align: 'right',
    disablePadding: false,
    label: 'Total Order'
  },
  {
    id: 'carbs',
    align: 'left',
    disablePadding: false,

    label: 'Status'
  },
  {
    id: 'protein',
    align: 'right',
    disablePadding: false,
    label: 'Total Amount'
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
      title = 'Pending';
      break;
    case 1:
      color = 'success';
      title = 'Approved';
      break;
    case 2:
      color = 'error';
      title = 'Rejected';
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

export default function OrdersList() {
  const order: Order = 'asc';
  const orderBy: keyof Data = 'tracking_no';

  return (
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
                  <Link color="secondary" component={RouterLink} to="">
                    {row.tracking_no}
                  </Link>
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell>
                  <OrderStatus status={row.carbs} />
                </TableCell>
                <TableCell align="right">
                  <NumericFormat value={row.protein} displayType="text" thousandSeparator prefix="$" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
