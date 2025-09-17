// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { BarChart } from '@mui/x-charts/BarChart';

interface SupplierChartProps {
  type: 'import' | 'export';
}

// Sample data for suppliers
const importSuppliers = [
  { name: 'VN Wood Pellet Co.', volume: 24800, region: 'Miền Nam', quality: 'Cao cấp' },
  { name: 'Mekong Biomass Export', volume: 18600, region: 'Đồng bằng sông Cửu Long', quality: 'Loại A' },
  { name: 'Saigon Wood Chips', volume: 15200, region: 'Miền Nam', quality: 'Loại A' },
  { name: 'Delta Sawdust Trading', volume: 12400, region: 'Đồng bằng sông Cửu Long', quality: 'Loại B' },
  { name: 'Green Forest Vietnam', volume: 9800, region: 'Miền Trung', quality: 'Tiêu chuẩn' }
];

const exportSuppliers = [
  { name: 'Biomass EU Trading', volume: 32100, region: 'EU', quality: 'Premium' },
  { name: 'Green Energy Corp', volume: 28500, region: 'North America', quality: 'Grade A' },
  { name: 'EcoFuel International', volume: 21800, region: 'Asia Pacific', quality: 'Grade A' },
  { name: 'Renewable Resources Ltd', volume: 16200, region: 'Europe', quality: 'Grade B' },
  { name: 'Clean Energy Solutions', volume: 12900, region: 'Middle East', quality: 'Standard' }
];

// ==============================|| SUPPLIER CHART ||============================== //

export default function SupplierChart({ type }: SupplierChartProps) {
  const theme = useTheme();
  const axisFonstyle = { fontSize: 11, fill: theme.palette.text.secondary };

  const supplierData = type === 'import' ? importSuppliers : exportSuppliers;
  const title = type === 'import' ? 'Nhà cung cấp' : 'Nhà nhập khẩu';

  const names = supplierData.map((item) => item.name);
  const volumes = supplierData.map((item) => item.volume);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Cao cấp':
      case 'Premium':
        return 'success';
      case 'Loại A':
      case 'Grade A':
        return 'primary';
      case 'Loại B':
      case 'Grade B':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Supplier Statistics */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {supplierData.map((item, index) => (
          <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ flex: 1 }}>
                {item.name}
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {item.volume.toLocaleString()} MT
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1}>
                <Chip label={item.region} size="small" variant="outlined" />
                <Chip label={item.quality} size="small" color={getQualityColor(item.quality) as any} variant="filled" />
              </Stack>
              <Typography variant="caption" color="textSecondary">
                #{index + 1} {title}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Bar Chart */}
      <BarChart
        hideLegend
        height={300}
        series={[
          {
            data: volumes,
            label: 'Khối lượng (MT)',
            color: theme.palette.primary.main,
            valueFormatter: (value: number | null) => `${value?.toLocaleString()} MT`
          }
        ]}
        xAxis={[
          {
            data: names.map((name, index) => `${name.split(' ')[0]}...`),
            scaleType: 'band',
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: { ...axisFonstyle, fontSize: 9 }
          }
        ]}
        yAxis={[
          {
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: axisFonstyle,
            valueFormatter: (value: number) => `${(value / 1000).toFixed(0)}K`
          }
        ]}
        slotProps={{
          bar: { rx: 5, ry: 5 },
          tooltip: { trigger: 'item' }
        }}
        axisHighlight={{ x: 'none' }}
        margin={{ top: 30, bottom: 50, left: 45, right: 20 }}
        sx={{
          '& .MuiBarElement-root:hover': { opacity: 0.7 },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: theme.palette.divider }
        }}
      />
    </Box>
  );
}
