import { useState } from 'react';

// material-ui
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { alpha, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { LineChart } from '@mui/x-charts';

// project imports
import MainCard from 'components/MainCard';
import { dateHelper, DatePickerControl } from 'utils';

// Sample data - Replace with actual data from your API
const exchangeRates = [
  { date: '2024-03-01', rate: 24200 },
  { date: '2024-03-02', rate: 24350 },
  { date: '2024-03-03', rate: 24500 },
  { date: '2024-03-04', rate: 24800 },
  { date: '2024-03-05', rate: 25100 },
  { date: '2024-03-06', rate: 25300 },
  { date: '2024-03-07', rate: 25500 }
];

// Calculate percentage change from today's rate
const todayRate = exchangeRates[exchangeRates.length - 1].rate;
const ratesWithChange = exchangeRates.map((item) => ({
  ...item,
  change: (((item.rate - todayRate) / todayRate) * 100).toFixed(2)
}));

// Sample orders data - Replace with actual data from your API
const ordersData = {
  '2024-03-01': [
    { id: 'ORD001', customer: 'Nguyễn Văn A', amount: 1000 },
    { id: 'ORD002', customer: 'Trần Thị B', amount: 2000 }
  ],
  '2024-03-02': [{ id: 'ORD003', customer: 'Lê Văn C', amount: 1500 }],
  '2024-03-03': [
    { id: 'ORD004', customer: 'Phạm Thị D', amount: 3000 },
    { id: 'ORD005', customer: 'Đỗ Văn E', amount: 2500 }
  ],
  '2024-03-04': [
    { id: 'ORD006', customer: 'Vũ Thị F', amount: 2800 },
    { id: 'ORD007', customer: 'Trịnh Văn G', amount: 1800 }
  ],
  '2024-03-05': [{ id: 'ORD008', customer: 'Lương Thị H', amount: 2200 }],
  '2024-03-06': [
    { id: 'ORD009', customer: 'Ngô Văn I', amount: 1600 },
    { id: 'ORD010', customer: 'Đinh Thị K', amount: 1900 }
  ],
  '2024-03-07': [
    { id: 'ORD011', customer: 'Bùi Văn L', amount: 2100 },
    { id: 'ORD012', customer: 'Cao Thị M', amount: 1700 },
    { id: 'ORD013', customer: 'Hoàng Văn N', amount: 2600 }
  ]
};

function Row({ date, orders }: { date: string; orders: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <UpOutlined /> : <DownOutlined />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {date}
        </TableCell>
        <TableCell align="right">{orders.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Danh sách đơn hàng
              </Typography>
              <Table size="small" aria-label="orders">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn hàng</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell align="right">Số tiền (USD)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow hover key={order.id}>
                      <TableCell component="th" scope="row">
                        {order.id}
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell align="right">{order.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function Rate() {
  const theme = useTheme();
  const axisFonstyle = { fontSize: 12, fill: theme.palette.text.secondary };

  // Get unique dates from exchangeRates
  const dates = exchangeRates.map((item) => item.date);
  const today = dates[dates.length - 1];

  // State for date range
  const [startDate, setStartDate] = useState<DatePickerControl>(dateHelper.from(today));
  const [endDate, setEndDate] = useState<DatePickerControl>(dateHelper.from(today));

  // Filter data based on selected date range
  const filteredRates = ratesWithChange.filter((item) => {
    const itemDate = dateHelper.from(item.date);
    return startDate && endDate && itemDate >= startDate && itemDate <= endDate;
  });

  // Filter orders based on selected date range
  const filteredOrders = Object.entries(ordersData).filter(([date]) => {
    const itemDate = dateHelper.from(date);
    return startDate && endDate && itemDate >= startDate && itemDate <= endDate;
  });

  return (
    <MainCard title="Tỷ giá USD/VND">
      <Box sx={{ width: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <DatePicker
            label="Từ ngày"
            value={startDate}
            onChange={(newValue) => setStartDate(dateHelper.from(newValue))}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 200 }
              }
            }}
          />
          <DatePicker
            label="Đến ngày"
            value={endDate}
            onChange={(newValue) => setEndDate(dateHelper.from(newValue))}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 200 }
              }
            }}
          />
        </Stack>

        <LineChart
          height={400}
          xAxis={[
            {
              data: filteredRates.map((item) => item.date),
              scaleType: 'band',
              tickLabelStyle: axisFonstyle
            }
          ]}
          yAxis={[
            {
              tickLabelStyle: axisFonstyle,
              valueFormatter: (value: number | null) => (value ? `${value.toLocaleString()} VND` : '')
            }
          ]}
          series={[
            {
              data: filteredRates.map((item) => item.rate),
              area: true,
              color: theme.palette.primary.main,
              valueFormatter: (value: number | null) => {
                if (!value) return '';
                const index = filteredRates.findIndex((item) => item.rate === value);
                const change = filteredRates[index].change;
                const changeText = parseFloat(change) > 0 ? 'tăng' : 'giảm';
                return `${value.toLocaleString()} VND (${changeText} ${Math.abs(parseFloat(change))}%)`;
              },
              label: 'Tỷ giá USD/VND'
            }
          ]}
          margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
          sx={{
            '& .MuiLineElement-root': { strokeWidth: 2 },
            '& .MuiAreaElement-root': {
              fill: `url(#area-gradient)`,
              opacity: 0.3
            }
          }}
        >
          <defs>
            <linearGradient id="area-gradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor={alpha(theme.palette.primary.main, 0.3)} />
              <stop offset="100%" stopColor={alpha(theme.palette.primary.main, 0)} />
            </linearGradient>
          </defs>
        </LineChart>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom component="div">
            Đơn hàng theo ngày
          </Typography>
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
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Ngày</TableCell>
                  <TableCell align="right">Số lượng đơn hàng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map(([date, orders]) => (
                  <Row key={date} date={date} orders={orders} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </MainCard>
  );
}
