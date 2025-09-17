import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Input } from 'components/@extended/input';
import TableSkeleton from 'components/cards/skeleton/TableSkeleton';
import { CODE_UNIT_OF_MEASURE } from 'constants/code';
import { useConfiguration } from 'hooks';
import React, { useMemo, useState } from 'react';
import { dateHelper, parseFormattedNumber } from 'utils';
import { TableRowData } from '../hooks/useTruckScheduleLogic';

interface TruckScheduleTableProps {
  // Data
  localData: TableRowData[];
  setLocalData: React.Dispatch<React.SetStateAction<TableRowData[]>>;
  editedRows: Set<number>;
  setEditedRows: React.Dispatch<React.SetStateAction<Set<number>>>;
  
  // Options
  bookingOptions: any[];
  bookingMap: Record<string, any>;
  supplierOptions: any[];
  transportOptions: any[];
  vehicleTypeOptions: any[];
  optionsLoaded: boolean;
  
  // Pagination
  pagination: { pageIndex: number; pageSize: number };
  handlePageChange: (newPagination: any) => void;
  schedulesTotal: number;
  
  // Loading states
  schedulesValidating: boolean;
  schedulesLoading: boolean;
  
  // Actions
  handleCreateRow: (rowIndex: number) => void;
  handleSaveRows: () => void;
  handleDeleteRow: (rowData: TableRowData, deletedIndex: number) => Promise<void>;
}

export const TruckScheduleTable: React.FC<TruckScheduleTableProps> = ({
  localData,
  setLocalData,
  editedRows,
  setEditedRows,
  bookingOptions,
  bookingMap,
  supplierOptions,
  transportOptions,
  vehicleTypeOptions,
  optionsLoaded,
  pagination,
  handlePageChange,
  schedulesTotal,
  schedulesValidating,
  schedulesLoading,
  handleCreateRow,
  handleSaveRows,
  handleDeleteRow
}) => {
  // Use element id for focusing cells to simplify integration with wrapped inputs
  const getCellId = (row: number, col: number) => `ts-${row}-${col}`;
  const { mapConfigObject } = useConfiguration();
  const columns = useMemo(
    () => [
      { key: 'bookingCode', label: 'Số booking' },
      { key: 'supplierId', label: 'Tên xưởng' },
      { key: 'transportUnit', label: 'Đơn vị vận chuyển' },
      { key: 'vehicleType', label: 'Loại xe' },
      { key: 'loadingDate', label: 'Ngày đóng hàng' },
      { key: 'quantity', label: 'Số lượng xe' },
      { key: 'totalCont', label: 'Tổng số cont' },
      { key: 'totalWeight', label: 'Tổng số cân' },
      { key: 'actions', label: 'Thao tác' }
    ],
    []
  );

  const lastDataColIndex = 7; // index of 'totalWeight'

  const updateRowData = (rowIndex: number, updates: Partial<TableRowData>) => {
    setLocalData((prev) => {
      const copy = [...prev];
      if (copy[rowIndex]) {
        copy[rowIndex] = { ...copy[rowIndex], ...updates, isEdited: true };
      }
      return copy;
    });
    setEditedRows((prev) => new Set([...prev, rowIndex]));
  };

  // Keyboard navigation similar to Excel
  const focusCell = (rowIndex: number, colIndex: number) => {
    const el = document.getElementById(getCellId(rowIndex, colIndex)) as HTMLInputElement | null;
    if (el) el.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    const isLastCell = colIndex === lastDataColIndex;
    if (e.key === 'Tab') {
      // Let default tabbing behavior handle navigation
      // No special handling for creating new rows with Tab
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isLastCell) {
        handleCreateRow(rowIndex);
      } else {
        // move down same column
        focusCell(rowIndex + 1, colIndex);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCol = Math.min(colIndex + 1, lastDataColIndex);
      focusCell(rowIndex, nextCol);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevCol = Math.max(colIndex - 1, 0);
      focusCell(rowIndex, prevCol);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(rowIndex + 1, colIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(Math.max(rowIndex - 1, 0), colIndex);
    }
  };

  // Precise rounding to avoid float artifacts like 9.999999991
  const roundTo = (value: number, decimals: number): number => {
    if (value === null || value === undefined || !isFinite(value)) return value as any;
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  };

  const CONT_DECIMALS = 6;
  const WEIGHT_DECIMALS = 4;

  // Delete confirmation state
  const [deleteState, setDeleteState] = useState<{ open: boolean; rowIndex: number | null }>(
    { open: false, rowIndex: null }
  );

  const openDeleteConfirm = (rowIndex: number) => setDeleteState({ open: true, rowIndex });
  const closeDeleteConfirm = () => setDeleteState({ open: false, rowIndex: null });
  const confirmDelete = async () => {
    if (deleteState.rowIndex == null) return;
    const index = deleteState.rowIndex;
    const row = localData[index];
    await handleDeleteRow(row, index);
    closeDeleteConfirm();
  };

  const editedExistingCount = useMemo(
    () => Array.from(editedRows).filter((idx) => localData[idx]?.id && !localData[idx]?.isNew).length,
    [editedRows, localData]
  );

  // Help guide state
  const [showHelp, setShowHelp] = useState(true);

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2">Thay đổi: {editedExistingCount}</Typography>
          <Tooltip title="Hướng dẫn sử dụng">
            <IconButton 
              size="large" 
              onClick={() => setShowHelp(!showHelp)}
              color={showHelp ? "primary" : "default"}
            >
              <QuestionCircleOutlined />
            </IconButton>
          </Tooltip>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSaveRows}
          disabled={editedExistingCount === 0}
        >
          Lưu
        </Button>
      </Stack>

      {/* Help Guide */}
      <Collapse in={showHelp}>
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          onClose={() => setShowHelp(false)}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Hướng dẫn sử dụng:</strong>
          </Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            <Typography variant="body1">
              <strong>Tab:</strong> Di chuyển ô tiếp theo
            </Typography>
            <Typography variant="body1">
              <strong>Shift + Tab:</strong> Di chuyển ô trước
            </Typography>
            <Typography variant="body1">
              <strong>Enter ở cột tổng số cont:</strong> Tạo dòng mới
            </Typography>
            <Typography variant="body1">
              <strong>Tổng số cân:</strong> Tự động tính khi nhập số cont
            </Typography>
          </Stack>
        </Alert>
      </Collapse>

      {/* Show skeleton when loading */}
      {(schedulesLoading || !optionsLoaded) ? (
        <TableSkeleton rows={10} columns={9} includeHeader />
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    sx={{
                      whiteSpace: 'nowrap',
                      ...(c.key === 'bookingCode' && { width: 220 }),
                      ...(c.key === 'supplierId' && { width: 260 }),
                      ...(c.key === 'transportUnit' && { width: 260 }),
                      ...(c.key === 'vehicleType' && { width: 200 }),
                      ...(c.key === 'loadingDate' && { width: 200 }),
                      ...(c.key === 'quantity' && { width: 140 }),
                      ...(c.key === 'totalCont' && { width: 160 }),
                      ...(c.key === 'totalWeight' && { width: 160 }),
                      ...(c.key === 'actions' && { width: 120 })
                    }}
                  >
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {localData.map((row, rowIndex) => (
                <TableRow key={`${row.id || 'new'}-${rowIndex}`} hover>
                {/* bookingCode */}
                <TableCell sx={{ minWidth: 220 }}>
                  <Input.Autocomplete
                    size="small"
                    fullWidth
                    options={bookingOptions}
                    value={bookingOptions.find((o: any) => o.value === row.bookingCode) || null}
                    onChange={(newValue: any) => {
                      const bookingCode = newValue?.value || '';
                      const weightPerContainer = Number(bookingMap[bookingCode]?.weightPerContainer);
                      const updates: Partial<TableRowData> = {
                        bookingCode,
                        shippingScheduleId: bookingMap[bookingCode]?.id || row.shippingScheduleId || 0
                      };
                      if (!Number.isNaN(weightPerContainer) && isFinite(weightPerContainer) && weightPerContainer !== 0) {
                        if (typeof row.totalCont === 'number' && isFinite(row.totalCont)) {
                          updates.totalWeight = roundTo(row.totalCont * weightPerContainer, WEIGHT_DECIMALS);
                        } else if (typeof row.totalWeight === 'number' && isFinite(row.totalWeight)) {
                          updates.totalCont = roundTo(row.totalWeight / weightPerContainer, CONT_DECIMALS);
                        }
                      }
                      updateRowData(rowIndex, updates);
                    }}
                    getOptionLabel={(option: any) => option.label}
                    isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                    placeholder="Chọn số booking"
                    disabled={bookingOptions.length === 0}
                    onKeyDown={(e: any) => onKeyDown(e, rowIndex, 0)}
                    slotProps={{ textfield: { id: getCellId(rowIndex, 0) } }}
                  />
                </TableCell>

                {/* supplierId */}
                <TableCell sx={{ minWidth: 260 }}>
                  <Input.Autocomplete
                    size="small"
                    fullWidth
                    options={supplierOptions}
                    value={supplierOptions.find((o: any) => o.value === row.supplierId) || null}
                    onChange={(newValue: any) => {
                      const supplierId = newValue?.value || 0;
                      const supplier = supplierOptions.find((s: any) => s.value === supplierId);
                      updateRowData(rowIndex, { supplierId: Number(supplierId), factoryName: supplier?.label || '' });
                    }}
                    getOptionLabel={(option: any) => option.label}
                    getOptionKey={(option: any) => option.value || option.id}
                    isOptionEqualToValue={(option: any, value: any) => {
                      if (!option || !value) return false;
                      
                      // Check if both have value property
                      if (!option.hasOwnProperty('value') || !value.hasOwnProperty('value')) {
                        return false;
                      }
                      
                      return option.value === value.value;
                    }}
                    placeholder="Chọn xưởng"
                    disabled={supplierOptions.length === 0}
                    onKeyDown={(e: any) => onKeyDown(e, rowIndex, 1)}
                    slotProps={{ textfield: { id: getCellId(rowIndex, 1) } }}
                  />
                </TableCell>

                {/* transportUnit */}
                <TableCell sx={{ minWidth: 260 }}>
                  <Input.Autocomplete
                    size="small"
                    fullWidth
                    options={transportOptions}
                    value={transportOptions.find((o: any) => o.value === row.transportUnit) || null}
                    onChange={(newValue: any) => {
                      const transportUnit = newValue?.value || '';
                      const transport = transportOptions.find((t: any) => t.value === transportUnit);
                      updateRowData(rowIndex, { transportUnit, transportName: transport?.label || '' });
                    }}
                    getOptionLabel={(option: any) => option.label}
                    isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                    placeholder="Chọn đơn vị vận chuyển"
                    disabled={transportOptions.length === 0}
                    onKeyDown={(e: any) => onKeyDown(e, rowIndex, 2)}
                    slotProps={{ textfield: { id: getCellId(rowIndex, 2) } }}
                  />
                </TableCell>

                {/* vehicleType */}
                <TableCell sx={{ minWidth: 200 }}>
                  <Input.Autocomplete
                    size="small"
                    fullWidth
                    options={vehicleTypeOptions}
                    value={vehicleTypeOptions.find((o: any) => o.value === row.vehicleType) || null}
                    onChange={(newValue: any) => {
                      const vehicleType = newValue?.value || '';
                      const vehicleTypeObj = vehicleTypeOptions.find((v: any) => v.value === vehicleType);
                      updateRowData(rowIndex, { vehicleType, vehicleTypeName: vehicleTypeObj?.label || '' });
                    }}
                    getOptionLabel={(option: any) => option.label}
                    isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                    placeholder="Chọn loại xe"
                    disabled={vehicleTypeOptions.length === 0}
                    onKeyDown={(e: any) => onKeyDown(e, rowIndex, 3)}
                    slotProps={{ textfield: { id: getCellId(rowIndex, 3) } }}
                  />
                </TableCell>

                  {/* loadingDate */}
                 <TableCell sx={{ minWidth: 180 }}>
                   <Input.DatePicker
                     fullWidth
                     value={row.loadingDate || ''}
                     onChange={(newValue: any) => {
                       const iso = newValue ? dateHelper.toDateString(newValue as any) : '';
                       updateRowData(rowIndex, { loadingDate: iso });
                     }}
                     onKeyDown={(e: any) => onKeyDown(e, rowIndex, 4)}
                     slotProps={{ slotProps: {}, textField: { id: getCellId(rowIndex, 4) } }}
                     minDate={!row.id ? dateHelper.now() : undefined}
                   />
                 </TableCell>

                {/* quantity */}
                <TableCell sx={{ minWidth: 140 }}>
                  <Input.Number
                    fullWidth
                    value={row.quantity ?? ''}
                    onChange={(val: string) => {
                      const parsed = parseFormattedNumber(val);
                      updateRowData(rowIndex, { quantity: parsed });
                    }}
                    onKeyDown={(e: any) => onKeyDown(e, rowIndex, 5)}
                    slotProps={{ number: { decimalScale: 10, thousandSeparator: false, allowNegative: false, allowedDecimalSeparators: ['.', ','] } }}
                    id={getCellId(rowIndex, 5)}
                  />
                </TableCell>

                {/* totalCont */}
                <TableCell sx={{ minWidth: 160 }}>
                  <Input.Number
                    fullWidth
                    value={row.totalCont ?? ''}
                    disabled={!row.bookingCode}
                    onChange={(val: string) => {
                      const parsed = parseFormattedNumber(val);
                      const weightPerContainer = Number(bookingMap[row.bookingCode]?.weightPerContainer);
                      const updates: Partial<TableRowData> = { totalCont: parsed };
                      if (parsed === null || parsed === undefined || `${parsed}` === '') {
                        updates.totalWeight = null;
                      } else if (!Number.isNaN(weightPerContainer) && isFinite(weightPerContainer)) {
                        updates.totalWeight = roundTo(parsed * weightPerContainer, WEIGHT_DECIMALS);
                      }
                      updateRowData(rowIndex, updates);
                    }}
                    onKeyDown={(e: any) => onKeyDown(e, rowIndex, 6)}
                    slotProps={{ number: { decimalScale: CONT_DECIMALS, thousandSeparator: false, allowNegative: false, allowedDecimalSeparators: ['.', ','] } }}
                    id={getCellId(rowIndex, 6)}
                  />
                </TableCell>

                {/* totalWeight */}
                <TableCell sx={{ minWidth: 160 }}>
                  <Input.Number
                    fullWidth
                    value={row.totalWeight ?? ''}
                    disabled={!row.bookingCode}
                    onChange={(val: string) => {
                      const parsed = parseFormattedNumber(val);
                      const weightPerContainer = Number(bookingMap[row.bookingCode]?.weightPerContainer);
                      const updates: Partial<TableRowData> = { totalWeight: parsed };
                      if (parsed === null || parsed === undefined || `${parsed}` === '') {
                        updates.totalCont = null;
                      } else if (!Number.isNaN(weightPerContainer) && isFinite(weightPerContainer) && weightPerContainer !== 0) {
                        updates.totalCont = roundTo(parsed / weightPerContainer, CONT_DECIMALS);
                      }
                      updateRowData(rowIndex, updates);
                    }}
                    onKeyDown={(e: any) => onKeyDown(e, rowIndex, 7)}
                    slotProps={{
                      number: { decimalScale: WEIGHT_DECIMALS, thousandSeparator: false, allowNegative: false, allowedDecimalSeparators: ['.', ','] },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                             {mapConfigObject(CODE_UNIT_OF_MEASURE, bookingMap[row.bookingCode]?.unitOfMeasure || '')}
                            </Typography>
                          </InputAdornment>
                        )
                      }
                    }}
                    id={getCellId(rowIndex, 7)}
                  />
                </TableCell>

                {/* actions */}
                <TableCell align="center">
                  {!(rowIndex === 0 && row.isNew && !row.id) && (
                    <Tooltip title="Xóa">
                      <IconButton color="error" size="small" onClick={() => openDeleteConfirm(rowIndex)}>
                        <DeleteOutlined />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={schedulesTotal}
            page={pagination.pageIndex}
            onPageChange={(_, newPage) => handlePageChange({ ...pagination, pageIndex: newPage })}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(e) => {
              const newPageSize = parseInt(e.target.value, 10);
              // Reset to first page and update page size
              handlePageChange({ pageIndex: 0, pageSize: newPageSize });
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </TableContainer>
      )}

      {/* Loading overlay */}
      {schedulesValidating && optionsLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backdropFilter: 'blur(2px)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Đang tải dữ liệu...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteState.open} onClose={closeDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Bạn có chắc chắn muốn xóa dòng này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm}>Hủy</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
