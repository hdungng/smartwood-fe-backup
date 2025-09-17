import { Box, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import ReactApexChart from 'react-apexcharts';
import { PurchaseContractDetailResponse } from 'services/contract';
import { dateHelper, numberHelper } from 'utils';
import { useMemo } from 'react';
import { useGlobal } from 'contexts/GlobalContext';
import { ApexOptions } from 'apexcharts';

type Props = {
  data: PurchaseContractDetailResponse;
};

const ContractDetail = ({ data }: Props) => {
  const theme = useTheme();
  const { goods } = useGlobal();

  const hasDetail = !!data?.purchaseContractPackingPlan;

  const suppliers = data.purchaseContractPackingPlan?.purchaseContractPackingPlanGoodSuppliers || [];

  const totalQuantity = useMemo(() => suppliers.reduce((total, shipment) => total + (shipment.quantity || 0), 0), [suppliers]);

  const shippedQuantity = useMemo(() => suppliers.reduce((total, shipment) => total + (shipment.realQuantity || 0), 0), [suppliers]);

  // Calculate covered quantity from weight ticket
  const coveredQuantity = useMemo(() => {
    return (data.purchaseContractWeightTicket?.purchaseContractWeightTicketDetails || []).reduce((total, shipment) => {
      return total + (shipment.coverageQuantity || 0);
    }, 0);
  }, [data.purchaseContractWeightTicket]);

  const remainingQuantity = Math.max(0, totalQuantity - shippedQuantity - coveredQuantity);

  const chartSeries = [shippedQuantity, remainingQuantity, coveredQuantity];

  // Pie chart data
  const chartOptions: ApexOptions = {
    chart: {
      type: 'pie' as const,
      height: 350
    },
    labels: ['Đã xuất', 'Còn lại', 'Hàng phủ'],
    colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.success.main],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => numberHelper.formatPercent(val),
      style: {
        fontSize: '12px'
      }
    },
    stroke: { width: 0 },
    tooltip: {
      y: {
        formatter: (value: number) => numberHelper.formatNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` }
      }
    },
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Tổng số lượng',
              fontSize: '14px',
              fontWeight: 600,
              formatter: function () {
                return numberHelper.formatNumber(shippedQuantity + coveredQuantity);
              }
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: theme.palette.primary.main,
              formatter: function (value: string) {
                return numberHelper.formatNumber(value);
              }
            }
          }
        }
      }
    }
  };

  const chartLegends = [
    {
      name: 'Đã xuất',
      color: 'primary.main',
      value: shippedQuantity
    },
    {
      name: 'Còn lại',
      color: 'warning.main',
      value: remainingQuantity
    },
    {
      name: 'Hàng phủ',
      color: 'success.main',
      value: coveredQuantity
    }
  ];

  const processPercent = useMemo(
    () => (totalQuantity === 0 ? 0 : (shippedQuantity + coveredQuantity) / totalQuantity) * 100,
    [totalQuantity, shippedQuantity, coveredQuantity]
  );

  return (
    <Stack spacing={3} sx={{ p: 2.5 }}>
      <Typography variant="h6">Tóm tắt kế hoạch đóng hàng - {data.code}</Typography>

      {/* Main content with pie chart and planned shipments */}
      <Grid container spacing={3}>
        {/* Left side - Pie Chart */}
        {hasDetail && (
          <Grid size={{ xs: 12, md: 4 }}>
            <MainCard>
              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 1 }}>
                  Tiến độ thực hiện (
                  {numberHelper.formatPercent(processPercent, {
                    minDigits: processPercent === 100 || processPercent === 0 ? 0 : 2
                  })}
                  )
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 350 }}>
                  <ReactApexChart options={chartOptions} series={chartSeries} type="donut" height={320} />
                </Box>

                {/* Additional stats */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  {chartLegends.map((legend) => (
                    <Stack key={`chart-legend-${legend.name}`} spacing={0.5} alignItems="center">
                      <Box display="flex" gap={1} alignItems="center">
                        <Box height={12} width={12} borderRadius="50%" bgcolor={legend.color} />

                        <Typography>{legend.name}</Typography>
                      </Box>
                      <Typography variant="h6" color={legend.color} fontWeight={600}>
                        {numberHelper.formatNumber(legend.value)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </MainCard>
          </Grid>
        )}

        {/* Right side - Planned Shipments */}
        <Grid size={{ xs: 12, md: hasDetail ? 8 : 12 }}>
          <MainCard>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Kế hoạch xuất hàng</Typography>

              <TableContainer sx={{ overflowX: 'visible' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhà cung cấp</TableCell>
                      <TableCell>Loại hàng hóa</TableCell>
                      <TableCell>Ngày bắt đầu</TableCell>
                      <TableCell>Ngày kết thúc</TableCell>
                      <TableCell>Số lượng dự kiến</TableCell>
                      <TableCell>Số lượng thực tế</TableCell>
                      <TableCell>Hàng phủ</TableCell>
                    </TableRow>
                  </TableHead>
                  {suppliers.length > 0 ? (
                    <TableBody>
                      {suppliers.map((shipment, index) => (
                        <TableRow key={index}>
                          <TableCell>{shipment.supplierName}</TableCell>
                          <TableCell>{goods.find((x) => x.id === shipment.goodId)?.name || ''}</TableCell>
                          <TableCell>{dateHelper.from(shipment.startTime).format('DD/MM/YYYY')}</TableCell>
                          <TableCell>{dateHelper.from(shipment.endTime).format('DD/MM/YYYY')}</TableCell>
                          <TableCell>{numberHelper.formatNumber(shipment.quantity)} Kg</TableCell>
                          <TableCell>{numberHelper.formatNumber(shipment.realQuantity)} Kg</TableCell>
                          <TableCell>{numberHelper.formatNumber(shipment.coverageQuantity)} Kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  ) : (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ padding: 4 }}>
                          <Typography variant="body1">Không có dữ liệu</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ContractDetail;
