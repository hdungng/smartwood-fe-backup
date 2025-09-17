// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// types
interface Props {
  height?: number;
  selectedSupplier?: string;
  selectedCostType?: string;
  year?: number;
}

// supplier data - synced with LogisticCostsTable
const supplierData = [
  { id: 'all', name: 'Tất cả doanh nghiệp', region: 'Tất cả khu vực', type: 'Tổng hợp' },
  { id: '1', name: 'Công ty TNHH Gỗ Việt', region: 'Miền Bắc', type: 'Nhà máy chế biến' },
  { id: '2', name: 'HTX Nông Lâm Sản Đồng Nai', region: 'Miền Nam', type: 'Hợp tác xã' },
  { id: '3', name: 'Trang trại gỗ Bình Phước', region: 'Miền Nam', type: 'Trang trại gỗ' },
  { id: '4', name: 'Đại lý phân phối Miền Trung', region: 'Miền Trung', type: 'Đại lý' },
  { id: '5', name: 'Công ty Gỗ Tây Nguyên', region: 'Miền Trung', type: 'Nhà cung cấp trực tiếp' },
  { id: '6', name: 'Công ty Gỗ Đồng Tâm', region: 'Miền Bắc', type: 'Nhà máy chế biến' },
  { id: '7', name: 'HTX Lâm Nghiệp Quảng Nam', region: 'Miền Trung', type: 'Hợp tác xã' },
  { id: '8', name: 'Trang trại Acacia Bình Định', region: 'Miền Trung', type: 'Trang trại gỗ' },
  { id: '9', name: 'Công ty Gỗ Minh Phát', region: 'Miền Nam', type: 'Nhà cung cấp trực tiếp' },
  { id: '10', name: 'Đại lý Gỗ Thành Đạt', region: 'Miền Bắc', type: 'Đại lý' },
  { id: '11', name: 'HTX Gỗ Sạch Tiền Giang', region: 'Miền Nam', type: 'Hợp tác xã' },
  { id: '12', name: 'Công ty Gỗ Xuất Khẩu Hà Nội', region: 'Miền Bắc', type: 'Nhà máy chế biến' }
];

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

// Generate supplier-specific data
const generateSupplierData = (supplierId: string, baseData: any[]) => {
  if (supplierId === 'all') return baseData;

  const supplier = supplierData.find((s) => s.id === supplierId);
  if (!supplier) return baseData;

  // Create variation based on supplier type (consistent with LogisticCostsTable)
  let multiplier = 1;
  switch (supplier.type) {
    case 'Nhà máy chế biến':
      multiplier = 0.6 + Math.random() * 0.4; // 0.6 - 1.0
      break;
    case 'Hợp tác xã':
      multiplier = 0.8 + Math.random() * 0.6; // 0.8 - 1.4
      break;
    case 'Trang trại gỗ':
      multiplier = 0.7 + Math.random() * 0.5; // 0.7 - 1.2
      break;
    case 'Đại lý':
      multiplier = 1.0 + Math.random() * 0.8; // 1.0 - 1.8
      break;
    case 'Nhà cung cấp trực tiếp':
      multiplier = 0.9 + Math.random() * 0.7; // 0.9 - 1.6
      break;
    default:
      multiplier = 0.8 + Math.random() * 0.6; // 0.8 - 1.4
  }

  return baseData.map((item) => ({
    ...item,
    transport: Number((item.transport * multiplier * (0.8 + Math.random() * 0.4)).toFixed(1)),
    warehouse: Number((item.warehouse * multiplier * (0.7 + Math.random() * 0.6)).toFixed(1)),
    delivery: Number((item.delivery * multiplier * (0.9 + Math.random() * 0.3)).toFixed(1)),
    total: Number((item.total * multiplier * (0.8 + Math.random() * 0.4)).toFixed(1))
  }));
};

// Updated to sync with CostDecisionPieChart colors
const getCostTypeConfig = (theme: any) => [
  { value: 'transport', label: 'Vận chuyển', color: theme.palette.info.main },
  { value: 'warehouse', label: 'Kho bãi', color: theme.palette.success.main },
  { value: 'delivery', label: 'Giao nhận', color: theme.palette.warning.main },
  { value: 'total', label: 'Tổng chi phí', color: theme.palette.primary.main }
];

// ==============================|| SELECTABLE COST CHART ||============================== //

export default function SelectableCostChart({
  height = 350,
  selectedSupplier = 'all',
  selectedCostType = 'all',
  year = new Date().getFullYear()
}: Props) {
  const theme = useTheme();

  const costTypes = getCostTypeConfig(theme);
  const selectedType = costTypes.find((type) => type.value === selectedCostType);

  // Filter data based on supplier selection
  const filteredData = generateSupplierData(selectedSupplier, logisticData);

  // Handle different cost type selections
  const isShowingAll = selectedCostType === 'all';

  let chartData: any[] = [];
  let averageData: number[] = [];

  if (isShowingAll) {
    // Show all cost types as stacked columns
    chartData = [
      { name: 'Vận chuyển', data: filteredData.map((item) => item.transport) },
      { name: 'Kho bãi', data: filteredData.map((item) => item.warehouse) },
      { name: 'Giao nhận', data: filteredData.map((item) => item.delivery) }
    ];
  } else {
    // Show only selected cost type
    const singleCostData = filteredData.map((item) => {
      const value = item[selectedCostType as keyof typeof item];
      return typeof value === 'number' ? value : 0;
    });

    // Calculate average
    const average = singleCostData.reduce((sum, value) => sum + value, 0) / singleCostData.length;
    averageData = new Array(singleCostData.length).fill(average);

    chartData = singleCostData;
  }

  // chart options
  const chartOptions: ChartProps = {
    chart: {
      type: isShowingAll ? 'bar' : 'line',
      height: height,
      stacked: isShowingAll,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: isShowingAll ? [0, 0, 0] : [0, 3],
      colors: isShowingAll ? ['transparent', 'transparent', 'transparent'] : [undefined, theme.palette.error.main]
    },
    xaxis: {
      categories: filteredData.map((item) => item.month),
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
        },
        formatter: function (val: number) {
          return val.toFixed(1) + 'M';
        }
      }
    },
    fill: {
      opacity: isShowingAll ? [0.85, 0.85, 0.85] : [0.8, 1],
      gradient: isShowingAll
        ? undefined
        : {
            inverseColors: false,
            shade: 'light',
            type: 'vertical',
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100]
          }
    },
    grid: {
      borderColor: theme.palette.grey[200]
    },
    colors: isShowingAll
      ? [theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main]
      : [selectedType?.color || theme.palette.primary.main, theme.palette.error.main],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(1) + ' triệu VND';
        }
      }
    },
    legend: {
      show: false
    }
  };

  const series = isShowingAll
    ? chartData.map((item) => ({
        name: item.name,
        type: 'column',
        data: item.data
      }))
    : [
        {
          name: selectedType?.label || 'Chi phí',
          type: 'column',
          data: chartData
        },
        {
          name: 'Trung bình',
          type: 'line',
          data: averageData
        }
      ];

  return (
    <Box sx={{ width: '100%' }}>
      <ReactApexChart options={chartOptions} series={series} type={isShowingAll ? 'bar' : 'line'} height={height} />
    </Box>
  );
}
