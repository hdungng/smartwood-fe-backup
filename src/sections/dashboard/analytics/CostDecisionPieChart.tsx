// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// types
interface Props {
  height?: number;
  year?: number;
}

// Logistic cost data (same as LogisticCostsChart)
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

// Time period options
const periodOptions = [
  {
    value: '2025',
    label: 'Năm 2025'
  },
  {
    value: '2024',
    label: 'Năm 2024'
  },
  {
    value: '2023',
    label: 'Năm 2023'
  }
];

// Filter data based on selected period
const filterDataByPeriod = (data: any[], period: string) => {
  switch (period) {
    case 'q1':
      return data.slice(0, 3);
    case 'q2':
      return data.slice(3, 6);
    case 'q3':
      return data.slice(6, 9);
    case 'q4':
      return data.slice(9, 12);
    case 'h1':
      return data.slice(0, 6);
    case 'h2':
      return data.slice(6, 12);
    default:
      return data;
  }
};

// ==============================|| COST DECISION PIE CHART ||============================== //

export default function CostDecisionPieChart({ height = 320, year = new Date().getFullYear() }: Props) {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('2025');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedView, setSelectedView] = useState('costs');

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }

  // Filter data based on selected period
  const filteredData = filterDataByPeriod(logisticData, selectedPeriod);

  // Calculate cost totals from filtered data
  const costTotals = filteredData.reduce(
    (acc, item) => {
      acc.transport += item.transport;
      acc.warehouse += item.warehouse;
      acc.delivery += item.delivery;
      acc.total += item.total;
      return acc;
    },
    { transport: 0, warehouse: 0, delivery: 0, total: 0 }
  );

  // Calculate monthly averages
  const monthlyAverages = {
    transport: costTotals.transport / filteredData.length,
    warehouse: costTotals.warehouse / filteredData.length,
    delivery: costTotals.delivery / filteredData.length,
    total: costTotals.total / filteredData.length
  };

  // Prepare chart data based on selected view
  const getChartData = () => {
    if (selectedView === 'costs') {
      return {
        labels: ['Vận chuyển', 'Kho bãi', 'Giao nhận'],
        series: [costTotals.transport, costTotals.warehouse, costTotals.delivery],
        colors: [theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main]
      };
    } else {
      return {
        labels: ['Vận chuyển TB', 'Kho bãi TB', 'Giao nhận TB'],
        series: [monthlyAverages.transport, monthlyAverages.warehouse, monthlyAverages.delivery],
        colors: [theme.palette.info.light, theme.palette.success.light, theme.palette.warning.light]
      };
    }
  };

  const chartData = getChartData();

  // Chart options
  const chartOptions: ChartProps = {
    chart: {
      type: 'pie',
      height: height,
      toolbar: {
        show: false
      }
    },
    labels: chartData.labels,
    colors: chartData.colors,
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      formatter: function (val: number) {
        return val.toFixed(1) + '%';
      }
    },
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        },
        dataLabels: {
          offset: -10
        }
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: [theme.palette.background.paper]
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(1) + ' triệu VND';
        }
      }
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <ReactApexChart options={chartOptions} series={chartData.series} type="donut" height={height} />

      {/* Center content overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 1,
          width: '110px',
          height: '110px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.3, fontSize: '0.65rem', color: theme.palette.text.secondary }}>
          {selectedView === 'costs' ? 'Tổng chi phí' : 'Trung bình tháng'}
        </Typography>
        <Typography
          variant="h3"
          sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 0.3, lineHeight: 0.9, fontSize: '1.8rem' }}
        >
          {(selectedView === 'costs' ? costTotals.total : monthlyAverages.total).toFixed(1)}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 'medium', mb: 0.3, fontSize: '0.7rem' }}>
          triệu VND
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.6rem' }}>
          {periodOptions.find((p) => p.value === selectedPeriod)?.label}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Chip
            label={`${(selectedView === 'costs' ? costTotals.transport : monthlyAverages.transport).toFixed(1)} triệu VND`}
            color="info"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${(selectedView === 'costs' ? costTotals.warehouse : monthlyAverages.warehouse).toFixed(1)} triệu VND`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${(selectedView === 'costs' ? costTotals.delivery : monthlyAverages.delivery).toFixed(1)} triệu VND`}
            color="warning"
            variant="outlined"
            size="small"
          />
        </Stack>
      </Box>
    </Box>
  );
}
