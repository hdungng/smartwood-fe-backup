// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BarChart } from '@mui/x-charts/BarChart';

// Sample data for top importing countries
const countryData = [
  { country: 'Hoa Kỳ', volume: 45600, percentage: 28.5, flag: '🇺🇸' },
  { country: 'Nhật Bản', volume: 38200, percentage: 23.8, flag: '🇯🇵' },
  { country: 'Hàn Quốc', volume: 29800, percentage: 18.6, flag: '🇰🇷' },
  { country: 'Đức', volume: 22100, percentage: 13.8, flag: '🇩🇪' },
  { country: 'Anh', volume: 15300, percentage: 9.5, flag: '🇬🇧' },
  { country: 'Trung Quốc', volume: 9200, percentage: 5.8, flag: '🇨🇳' }
];

// ==============================|| COUNTRY IMPORT CHART ||============================== //

export default function CountryImportChart() {
  const theme = useTheme();
  const axisFonstyle = { fontSize: 11, fill: theme.palette.text.secondary };

  const countries = countryData.map((item) => `${item.flag} ${item.country}`);
  const volumes = countryData.map((item) => item.volume);

  return (
    <Box>
      {/* Country Statistics */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {countryData.map((item, index) => (
          <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontSize: '16px' }}>
                {item.flag}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {item.country}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="textSecondary">
                {item.volume.toLocaleString()} MT
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ minWidth: '50px', textAlign: 'right' }}>
                {item.percentage}%
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      {/* Bar Chart */}
      <BarChart
        hideLegend
        height={280}
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
            data: countries,
            scaleType: 'band',
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: { ...axisFonstyle, fontSize: 10 }
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
        margin={{ top: 30, bottom: 60, left: 45, right: 20 }}
        sx={{
          '& .MuiBarElement-root:hover': { opacity: 0.7 },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: theme.palette.divider }
        }}
      />
    </Box>
  );
}
