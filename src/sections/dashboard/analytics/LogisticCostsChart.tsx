// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// types
interface Props {
  height?: number;
  year?: number;
}

// chart data
const logisticData = [
  { month: 'T1', transport: 10, warehouse: 5, delivery: 3, total: 18 },
  { month: 'T2', transport: 12, warehouse: 4, delivery: 4, total: 20 },
  { month: 'T3', transport: 11, warehouse: 6, delivery: 3.5, total: 20.5 },
  { month: 'T4', transport: 13, warehouse: 5.5, delivery: 4.2, total: 22.7 },
  { month: 'T5', transport: 9, warehouse: 7, delivery: 3.8, total: 19.8 },
  { month: 'T6', transport: 14, warehouse: 6.2, delivery: 4.5, total: 24.7 },
  { month: 'T7', transport: 15, warehouse: 5.8, delivery: 5, total: 25.8 },
  { month: 'T8', transport: 13.5, warehouse: 6.5, delivery: 4.3, total: 24.3 },
  { month: 'T9', transport: 12.2, warehouse: 7.2, delivery: 4.1, total: 23.5 },
  { month: 'T10', transport: 11.8, warehouse: 6.8, delivery: 3.9, total: 22.5 },
  { month: 'T11', transport: 13.2, warehouse: 5.9, delivery: 4.4, total: 23.5 },
  { month: 'T12', transport: 14.5, warehouse: 6.1, delivery: 4.8, total: 25.4 }
];

// ==============================|| LOGISTIC COSTS CHART ||============================== //

export default function LogisticCostsChart({ height = 350, year = new Date().getFullYear() }: Props) {
  const theme = useTheme();

  // Always show 12 months data
  const chartData = logisticData;

  // chart options
  const chartOptions: ChartProps = {
    chart: {
      type: 'line',
      height: height,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: [0, 0, 0, 3],
      colors: ['transparent', 'transparent', 'transparent', theme.palette.primary.main]
    },
    xaxis: {
      categories: chartData.map((item) => item.month),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      title: {
        text: 'Chi phí (triệu VND)',
        style: {
          color: theme.palette.text.secondary
        }
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    fill: {
      opacity: [0.85, 0.85, 0.85, 1]
    },
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40,
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    grid: {
      borderColor: theme.palette.grey[200]
    },
    colors: [theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.primary.main],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + ' triệu VND';
        }
      }
    }
  };

  const series = [
    {
      name: 'Vận chuyển',
      type: 'column',
      data: chartData.map((item) => item.transport)
    },
    {
      name: 'Kho bãi',
      type: 'column',
      data: chartData.map((item) => item.warehouse)
    },
    {
      name: 'Giao nhận',
      type: 'column',
      data: chartData.map((item) => item.delivery)
    },
    {
      name: 'Tổng chi phí',
      type: 'line',
      data: chartData.map((item) => item.total)
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <ReactApexChart options={chartOptions} series={series} type="line" height={height} />
    </Box>
  );
}
