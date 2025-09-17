import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useBoolean, useConfiguration } from 'hooks';
import { useContractPurchaseManageContext } from '../../../../providers';
import { ActualTowingFormProps } from '../../../../schema';
import { GetDetailPurchaseContractWeightTicketResponse } from 'services/contract';
import { useGlobal } from 'contexts/GlobalContext';
import { SelectionOption } from 'types/common';
import { CODE_QUALITY_TYPE } from 'constants/code';
import ActualTowingRow from './actual-towing-row';
import { dateHelper } from 'utils';

type Props = {
  actualTowing: (ActualTowingFormProps & Record<'id', string>)[];
  detail?: GetDetailPurchaseContractWeightTicketResponse;
  onRemove: (index: number) => void;
  onAdd: (rows: Dynamic[]) => void;
  onAddManually: VoidFunction;
  isLoading?: boolean;
};

const MemoizedActualTowingRow = React.memo(ActualTowingRow, (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index &&
    prevProps.canRemove === nextProps.canRemove &&
    prevProps.onRemove === nextProps.onRemove &&
    prevProps.onAdd === nextProps.onAdd
  );
});

const ActualTowingTable = ({ actualTowing, detail, onRemove, onAdd, onAddManually, isLoading }: Props) => {
  const { mode } = useContractPurchaseManageContext();

  const handleRowAdd = useCallback(() => {
    if (mode === 'view') return;
    onAddManually();
  }, [mode, onAddManually]);


  const columns = useMemo(
    () => [
      {
        id: 'codeBooking',
        label: 'SỐ BOOKING',
        minWidth: 230,
        required: true
      },
      {
        id: 'region',
        label: 'KHU VỰC',
        minWidth: 180,
        required: true
      },
      {
        id: 'supplier',
        label: 'XƯỞNG',
        minWidth: 280,
        required: true
      },
      {
        id: 'good',
        label: 'LOẠI HÀNG',
        minWidth: 250,
        required: true
      },
      {
        id: 'goodType',
        label: 'CHẤT LƯỢNG HÀNG',
        minWidth: 180,
        required: true
      },
      {
        id: 'loadingDate',
        label: 'NGÀY ĐÓNG HÀNG',
        minWidth: 200,
        required: true
      },
      {
        id: 'actualWeight',
        label: 'KHỐI LƯỢNG (KG)',
        minWidth: 250,
        required: true
      },
      {
        id: 'goodPrice',
        label: 'ĐƠN GIÁ HÀNG',
        minWidth: 220,
        required: true
      },
      {
        id: 'delivery',
        label: 'ĐƠN VỊ VẬN CHUYỂN',
        minWidth: 250,
        required: true
      },
      {
        id: 'transportPrice',
        label: 'ĐƠN GIÁ VẬN TẢI',
        minWidth: 180,
        required: true
      },
      {
        id: 'unloadingPort',
        label: 'CẢNG ĐI',
        minWidth: 180,
        required: true
      },
      {
        id: 'truckNumber',
        label: 'BIỂN SỐ XE',
        minWidth: 180,
        required: true
      },
      {
        id: 'containerNumber',
        label: 'SỐ CONT',
        minWidth: 180,
        required: true
      },
      {
        id: 'sealNumber',
        label: 'SỐ CHÌ',
        minWidth: 180,
        required: true
      },
      {
        id: 'coverageGoodType',
        label: 'LOẠI CHẤT LƯỢNG HÀNG PHỦ',
        minWidth: 250,
        required: false
      },
      {
        id: 'coverageQuantity',
        label: 'SỐ LƯỢNG HÀNG PHỦ',
        minWidth: 250,
        required: false
      },
      ...(mode !== 'view' && actualTowing.length >= 1
        ? [
            {
              id: 'actions',
              label: 'HÀNH ĐỘNG',
              minWidth: 150,
              required: false,
              textAlign: 'center'
            }
          ]
        : [])
    ],
    [mode, actualTowing]
  );

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Stack>
          <Typography sx={{ mb: 1 }}>
            Tổng số dòng: <strong>{actualTowing.length}</strong>
          </Typography>
        </Stack>
      </Stack>

      <TableContainer component={Paper} sx={{ maxHeight: 1200, overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} sx={{ minWidth: column.minWidth, textAlign: column.textAlign || 'left' }}>
                  {column.label} {column.required && <strong style={{ color: 'red' }}>*</strong>}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {actualTowing?.length > 0 ? (
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Stack spacing={1}>
                      <Typography variant="body1" color="textSecondary">
                        Đang tải dữ liệu, vui lòng chờ trong giây lát...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
              {(actualTowing as (ActualTowingFormProps & Record<'id', string>)[]).map((row, index) => (
                <MemoizedActualTowingRow
                  key={`actual-towing-${row.id}`}
                  index={index}
                  canRemove={actualTowing.length >= 1}
                  onRemove={() => onRemove(index)}
                  onAdd={handleRowAdd}
                />
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length - (mode === 'view' ? 1 : 0)} align="center" sx={{ padding: 4 }}>
                  <Typography variant="body1">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <Typography variant="caption" fontStyle="italic">
        Khi người dùng nhập dữ liệu đến ô thuộc cột cuối cùng và nhấn phím <strong>Enter</strong>, hệ thống sẽ tự động tạo thêm một dòng mới
        để tiếp tục nhập liệu.
      </Typography>
    </Stack>
  );
};

export default ActualTowingTable;
