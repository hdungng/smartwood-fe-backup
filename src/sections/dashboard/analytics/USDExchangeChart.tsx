// material-ui
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';

// Sample USD exchange rate data (last 30 days)
const exchangeData = [
  { date: '2024-01-01', rate: 24420 },
  { date: '2024-01-02', rate: 24385 },
  { date: '2024-01-03', rate: 24445 },
  { date: '2024-01-04', rate: 24520 },
  { date: '2024-01-05', rate: 24480 },
  { date: '2024-01-08', rate: 24455 },
  { date: '2024-01-09', rate: 24485 },
  { date: '2024-01-10', rate: 24520 },
  { date: '2024-01-11', rate: 24545 },
  { date: '2024-01-12', rate: 24580 },
  { date: '2024-01-15', rate: 24620 },
  { date: '2024-01-16', rate: 24595 },
  { date: '2024-01-17', rate: 24615 },
  { date: '2024-01-18', rate: 24640 },
  { date: '2024-01-19', rate: 24665 },
  { date: '2024-01-22', rate: 24720 },
  { date: '2024-01-23', rate: 24755 },
  { date: '2024-01-24', rate: 24780 },
  { date: '2024-01-25', rate: 24820 },
  { date: '2024-01-26', rate: 24795 },
  { date: '2024-01-29', rate: 24815 },
  { date: '2024-01-30', rate: 24780 },
  { date: '2024-01-31', rate: 24765 },
  { date: '2024-02-01', rate: 24740 },
  { date: '2024-02-02', rate: 24720 },
  { date: '2024-02-05', rate: 24685 },
  { date: '2024-02-06', rate: 24650 },
  { date: '2024-02-07', rate: 24580 },
  { date: '2024-02-08', rate: 24545 },
  { date: '2024-02-09', rate: 24580 }
];

// ==============================|| USD EXCHANGE RATE CHART ||============================== //

export default function USDExchangeChart() {
  const theme = useTheme();

  const dates = exchangeData.map((item) => item.date);
  const rates = exchangeData.map((item) => item.rate);

  const axisFonstyle = { fontSize: 11, fill: theme.palette.text.secondary };

  return (
    <LineChart
      hideLegend
      height={400}
      series={[
        {
          data: rates,
          label: 'Tỷ giá USD/VND',
          color: theme.palette.primary.main,
          curve: 'linear',
          showMark: true,
          valueFormatter: (value: number | null) => `${value?.toLocaleString()} VND`
        }
      ]}
      xAxis={[
        {
          data: dates,
          scaleType: 'point',
          tickLabelStyle: { ...axisFonstyle, fontSize: 10 },
          valueFormatter: (value: string) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }
        }
      ]}
      yAxis={[
        {
          tickLabelStyle: axisFonstyle,
          valueFormatter: (value: number) => `${(value / 1000).toFixed(0)}K`
        }
      ]}
      grid={{ horizontal: true, vertical: false }}
      margin={{ top: 30, bottom: 60, left: 60, right: 30 }}
      slotProps={{
        tooltip: {
          trigger: 'item',
          sx: {
            '& .MuiChartsTooltip-root': {
              border: '1px solid',
              borderColor: 'divider'
            }
          }
        }
      }}
      sx={{
        '& .MuiLineElement-root': {
          strokeWidth: 2
        },
        '& .MuiMarkElement-root': {
          fill: theme.palette.primary.main,
          stroke: theme.palette.background.paper,
          strokeWidth: 2,
          r: 4
        },
        '& .MuiChartsAxis-directionX .MuiChartsAxis-tick': {
          stroke: theme.palette.divider
        },
        '& .MuiChartsGrid-line': {
          stroke: theme.palette.divider,
          strokeDasharray: '3 3'
        }
      }}
    />
  );
}
