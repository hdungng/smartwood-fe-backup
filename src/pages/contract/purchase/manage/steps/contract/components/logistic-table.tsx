import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import LogisticRow from './logistic-row';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../schema';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SummaryRow from './summary-row';
import { useGlobal } from 'contexts';
import { useContractPurchaseManageContext } from '../../../providers';
import Button from '@mui/material/Button';
import { useQuantityValidation } from './hook';
import { getLogisticPropertyName } from './logistic-cells/utils';

const MAX_ROWS = 100;

const LogisticTable = () => {
  const { fieldOnlyView, selectedGoodId } = useContractPurchaseManageContext();
  const { goodMap } = useGlobal();

  const form = useFormContext<LogisticFormProps>();

  const { control } = form;
  const {
    fields: logistics,
    append,
    remove
  } = useFieldArray<LogisticFormProps>({
    control,
    name: 'logistics'
  });

  useQuantityValidation();

  const handleRemove = (index: number) => {
    const { getValues, setValue } = form;
    const logisticsData = getValues('logistics') as LogisticItemFormProps[];
    const rowToRemove = logisticsData[index];

    if (rowToRemove?.parentId && !rowToRemove?.hasWeightSlip && rowToRemove?.quantity) {
      const parentIndex = logisticsData.findIndex((item) => item.id === rowToRemove.parentId);
      if (parentIndex !== -1) {
        const parentRow = logisticsData[parentIndex];

        const newParentQuantity = (parentRow.quantity || 0) + rowToRemove.quantity;
        setValue(getLogisticPropertyName('quantity', parentIndex), newParentQuantity, { shouldDirty: true });
      }
    }

    remove(index);
  };

  const handleAddItem = (focus: boolean = false) => {
    append(
      {
        region: '',
        good: goodMap.get(selectedGoodId) || null,
        supplier: null,
        goodType: '',
        startDate: null,
        endDate: null,
        initialized: true,
        quantity: null,
        actualQuantity: 0,
        isFilled: false
      },
      {
        shouldFocus: focus
      }
    );
  };

  const handleAddAllocate = (parent: LogisticItemFormProps) => {
    if(!parent?.id)
      return;

    append({
      region: '',
      good: goodMap.get(selectedGoodId) || null,
      supplier: null,
      goodType: '',
      startDate: null,
      endDate: null,
      maxQuantity: parent.remainingQuantity,
      actualQuantity: 0,
      parentId: parent.id,
      initialized: true
    }, {
      shouldFocus: true
    });
  };

  return (
    <>
      <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          Thông tin hàng hóa và xưởng sản xuất
        </Typography>

        {!fieldOnlyView && (
          <Button variant="contained" onClick={() => handleAddItem(true)} disabled={logistics.length >= MAX_ROWS}>
            Thêm
          </Button>
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200 }}>
                Khu vực <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 300 }}>
                Tên Xưởng/nhà máy <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 250 }}>
                Tên hàng hóa <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 180 }}>
                Loại chất lượng <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 220 }}>
                Số lượng <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 220 }}>Số lượng thực tế</TableCell>
              <TableCell sx={{ minWidth: 220 }}>Số lượng còn lại</TableCell>
              <TableCell sx={{ minWidth: 250 }}>
                Đơn giá <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 220 }}>
                Thời gian bắt đầu <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 220 }}>
                Thời gian kết thúc <strong style={{ color: 'red' }}>*</strong>
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 150,
                  textAlign: 'center'
                }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>

          {logistics.length > 0 ? (
            <TableBody>
              {logistics.map((item, index) => (
                <LogisticRow
                  key={item.id}
                  index={index}
                  onRemove={() => handleRemove(index)}
                  onAllocate={(parent) => {
                    if (fieldOnlyView || logistics.length > MAX_ROWS) return;
                    handleAddAllocate(parent)
                  }}
                  onAdd={() => {
                    if (fieldOnlyView || logistics.length > MAX_ROWS) return;

                    handleAddItem(true);
                  }}
                />
              ))}

              <SummaryRow />
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ padding: 4 }}>
                  <Typography variant="body1">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <Typography variant="caption" fontStyle="italic" mt={-2}>
        Khi người dùng nhập dữ liệu đến ô thuộc cột cuối cùng và nhấn phím <strong>Enter</strong>, hệ thống sẽ tự động tạo thêm một dòng mới
        để tiếp tục nhập liệu.
      </Typography>
    </>
  );
};

export default LogisticTable;
