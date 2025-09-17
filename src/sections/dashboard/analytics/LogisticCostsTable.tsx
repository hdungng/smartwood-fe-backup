// material-ui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';

// types
interface Props {
  selectedSupplier?: string;
  onSupplierSelect?: (supplierId: string) => void;
  selectedCostType?: string;
  onCostTypeSelect?: (costType: string) => void;
  year?: number;
}

interface CostType {
  value: string;
  label: string;
}

// cost types for filtering
const costTypes: CostType[] = [
  { value: 'all', label: 'Tất cả loại chi phí' },
  { value: 'transport', label: 'Vận chuyển' },
  { value: 'warehouse', label: 'Kho bãi' },
  { value: 'delivery', label: 'Giao nhận' }
];

// supplier data for each month
const supplierData = [
  { id: 1, name: 'Công ty TNHH Gỗ Việt', region: 'Miền Bắc', type: 'Nhà máy chế biến' },
  { id: 2, name: 'HTX Nông Lâm Sản Đồng Nai', region: 'Miền Nam', type: 'Hợp tác xã' },
  { id: 3, name: 'Trang trại gỗ Bình Phước', region: 'Miền Nam', type: 'Trang trại gỗ' },
  { id: 4, name: 'Đại lý phân phối Miền Trung', region: 'Miền Trung', type: 'Đại lý' },
  { id: 5, name: 'Công ty Gỗ Tây Nguyên', region: 'Miền Trung', type: 'Nhà cung cấp trực tiếp' },
  { id: 6, name: 'Công ty Gỗ Đồng Tâm', region: 'Miền Bắc', type: 'Nhà máy chế biến' },
  { id: 7, name: 'HTX Lâm Nghiệp Quảng Nam', region: 'Miền Trung', type: 'Hợp tác xã' },
  { id: 8, name: 'Trang trại Acacia Bình Định', region: 'Miền Trung', type: 'Trang trại gỗ' },
  { id: 9, name: 'Công ty Gỗ Minh Phát', region: 'Miền Nam', type: 'Nhà cung cấp trực tiếp' },
  { id: 10, name: 'Đại lý Gỗ Thành Đạt', region: 'Miền Bắc', type: 'Đại lý' },
  { id: 11, name: 'HTX Gỗ Sạch Tiền Giang', region: 'Miền Nam', type: 'Hợp tác xã' },
  { id: 12, name: 'Công ty Gỗ Xuất Khẩu Hà Nội', region: 'Miền Bắc', type: 'Nhà máy chế biến' }
];

// Generate supplier costs for each month
const generateSupplierCosts = (monthData: any) => {
  return supplierData.map((supplier) => {
    // Create variation based on supplier type and region
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

    return {
      ...supplier,
      transport: Number((monthData.transport * multiplier * (0.8 + Math.random() * 0.4)).toFixed(1)),
      warehouse: Number((monthData.warehouse * multiplier * (0.7 + Math.random() * 0.6)).toFixed(1)),
      delivery: Number((monthData.delivery * multiplier * (0.9 + Math.random() * 0.3)).toFixed(1))
    };
  });
};

// chart data
const logisticData = [
  { month: 1, monthName: 'Tháng 1', transport: 10, warehouse: 5, delivery: 3, total: 18 },
  { month: 2, monthName: 'Tháng 2', transport: 12, warehouse: 4, delivery: 4, total: 20 },
  { month: 3, monthName: 'Tháng 3', transport: 11, warehouse: 6, delivery: 3.5, total: 20.5 },
  { month: 4, monthName: 'Tháng 4', transport: 13, warehouse: 5.5, delivery: 4.2, total: 22.7 },
  { month: 5, monthName: 'Tháng 5', transport: 9, warehouse: 7, delivery: 3.8, total: 19.8 },
  { month: 6, monthName: 'Tháng 6', transport: 14, warehouse: 6.2, delivery: 4.5, total: 24.7 },
  { month: 7, monthName: 'Tháng 7', transport: 15, warehouse: 5.8, delivery: 5, total: 25.8 },
  { month: 8, monthName: 'Tháng 8', transport: 13.5, warehouse: 6.5, delivery: 4.3, total: 24.3 },
  { month: 9, monthName: 'Tháng 9', transport: 12.2, warehouse: 7.2, delivery: 4.1, total: 23.5 },
  { month: 10, monthName: 'Tháng 10', transport: 11.8, warehouse: 6.8, delivery: 3.9, total: 22.5 },
  { month: 11, monthName: 'Tháng 11', transport: 13.2, warehouse: 5.9, delivery: 4.4, total: 23.5 },
  { month: 12, monthName: 'Tháng 12', transport: 14.5, warehouse: 6.1, delivery: 4.8, total: 25.4 }
];

// ==============================|| LOGISTIC COSTS TABLE ||============================== //

export default function LogisticCostsTable({
  selectedSupplier = 'all',
  onSupplierSelect,
  selectedCostType = 'all',
  onCostTypeSelect,
  year = new Date().getFullYear()
}: Props) {
  const theme = useTheme();

  // Handle supplier selection
  const handleSupplierSelect = (supplierId: string) => {
    if (onSupplierSelect) {
      onSupplierSelect(supplierId);
    }
  };

  // Calculate total costs for each supplier across all months (cached to prevent re-ordering)
  const supplierTotals = useMemo(() => {
    const supplierTotals = supplierData.map((supplier) => {
      let totalTransport = 0;
      let totalWarehouse = 0;
      let totalDelivery = 0;

      logisticData.forEach((monthData) => {
        const supplierCosts = generateSupplierCosts(monthData);
        const supplierCost = supplierCosts.find((s) => s.id === supplier.id);
        if (supplierCost) {
          totalTransport += supplierCost.transport;
          totalWarehouse += supplierCost.warehouse;
          totalDelivery += supplierCost.delivery;
        }
      });

      const grandTotal = totalTransport + totalWarehouse + totalDelivery;

      return {
        ...supplier,
        totalTransport: Number(totalTransport.toFixed(1)),
        totalWarehouse: Number(totalWarehouse.toFixed(1)),
        totalDelivery: Number(totalDelivery.toFixed(1)),
        grandTotal: Number(grandTotal.toFixed(1))
      };
    });

    // Sort by total cost (high to low) - stable sort
    const sortedSuppliers = supplierTotals.sort((a, b) => {
      if (b.grandTotal !== a.grandTotal) {
        return b.grandTotal - a.grandTotal;
      }
      // If same total cost, sort by name for stable ordering
      return a.name.localeCompare(b.name);
    });

    // Add "All suppliers" option at the top
    const allSuppliersTotal = sortedSuppliers.reduce(
      (acc, supplier) => ({
        totalTransport: acc.totalTransport + supplier.totalTransport,
        totalWarehouse: acc.totalWarehouse + supplier.totalWarehouse,
        totalDelivery: acc.totalDelivery + supplier.totalDelivery,
        grandTotal: acc.grandTotal + supplier.grandTotal
      }),
      { totalTransport: 0, totalWarehouse: 0, totalDelivery: 0, grandTotal: 0 }
    );

    const allOption = {
      id: 'all',
      name: 'Tất cả doanh nghiệp',
      region: 'Tất cả khu vực',
      type: 'Tổng hợp',
      totalTransport: Number(allSuppliersTotal.totalTransport.toFixed(1)),
      totalWarehouse: Number(allSuppliersTotal.totalWarehouse.toFixed(1)),
      totalDelivery: Number(allSuppliersTotal.totalDelivery.toFixed(1)),
      grandTotal: Number(allSuppliersTotal.grandTotal.toFixed(1))
    };

    return [allOption, ...sortedSuppliers];
  }, []); // Empty dependency array means this will only calculate once

  // Calculate totals
  const totalTransport = supplierTotals.reduce((sum, item) => sum + item.totalTransport, 0);
  const totalWarehouse = supplierTotals.reduce((sum, item) => sum + item.totalWarehouse, 0);
  const totalDelivery = supplierTotals.reduce((sum, item) => sum + item.totalDelivery, 0);
  const totalCosts = supplierTotals.reduce((sum, item) => sum + item.grandTotal, 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return `${value.toFixed(1)} triệu`;
  };

  // Get cost level color
  const getCostLevelColor = (value: number, type: 'transport' | 'warehouse' | 'delivery' | 'total') => {
    const thresholds = {
      transport: { low: 150, medium: 180 },
      warehouse: { low: 60, medium: 75 },
      delivery: { low: 50, medium: 60 },
      total: { low: 280, medium: 320 }
    };

    const threshold = thresholds[type];
    if (value <= threshold.low) return 'success';
    if (value <= threshold.medium) return 'warning';
    return 'error';
  };

  return (
    <>
      <Stack spacing={2} sx={{ mb: 2, pl: 2, pr: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Loại chi phí</InputLabel>
          <Select
            value={selectedCostType}
            label="Loại chi phí"
            onChange={(e: SelectChangeEvent) => onCostTypeSelect && onCostTypeSelect(e.target.value as string)}
          >
            {costTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 600,
          overflowX: 'auto',
          overflowY: 'auto',
          '& .MuiTableHead-root': {
            '& .MuiTableCell-root': {
              position: 'sticky',
              top: 0,
              zIndex: 1,
              backgroundColor: theme.palette.grey[50],
              borderBottom: `2px solid ${theme.palette.divider}`
            }
          }
        }}
      >
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 200
                }}
              >
                Nhà cung cấp
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 130
                }}
              >
                Vận chuyển
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                Kho bãi
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                Giao nhận
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 130
                }}
              >
                Tổng chi phí
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supplierTotals.map((supplier) => {
              const isSelected = selectedSupplier === supplier.id.toString();

              return (
                <TableRow
                  key={supplier.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    backgroundColor: isSelected ? theme.palette.grey[50] : 'inherit',
                    borderBottom: isSelected ? `2px solid ${theme.palette.divider}` : 'inherit'
                  }}
                  onClick={() => handleSupplierSelect(supplier.id.toString())}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="subtitle2" fontWeight={isSelected ? 700 : 500} color={isSelected ? 'primary' : 'inherit'}>
                      {supplier.name}
                    </Typography>
                    <Typography variant="caption" color={isSelected ? 'primary' : 'textSecondary'}>
                      {supplier.region} - {supplier.type}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(supplier.totalTransport)}
                      color={getCostLevelColor(supplier.totalTransport, 'transport')}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(supplier.totalWarehouse)}
                      color={getCostLevelColor(supplier.totalWarehouse, 'warehouse')}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(supplier.totalDelivery)}
                      color={getCostLevelColor(supplier.totalDelivery, 'delivery')}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(supplier.grandTotal)}
                      color={getCostLevelColor(supplier.grandTotal, 'total')}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Summary Row */}
            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
              <TableCell component="th" scope="row">
                <Typography variant="subtitle1" fontWeight={700}>
                  Tổng cộng
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight={700} color="info.main">
                  {formatCurrency(totalTransport)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight={700} color="info.main">
                  {formatCurrency(totalWarehouse)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight={700} color="info.main">
                  {formatCurrency(totalDelivery)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ fontSize: '1.1rem' }}>
                  {formatCurrency(totalCosts)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Legend */}
        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
            Mức độ chi phí:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip label="Thấp" color="success" variant="outlined" size="small" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip label="Trung bình" color="warning" variant="outlined" size="small" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip label="Cao" color="error" variant="outlined" size="small" />
            </Box>
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            💡 Click vào từng nhà cung cấp để chọn và cập nhật biểu đồ
          </Typography>
        </Box>
      </TableContainer>
    </>
  );
}
