import { Chip, Button, Grid, TextField, MenuItem, Box, IconButton } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import ReactTableWithTotal from 'common/tables/BasicTableWithTotal';
import { useMemo, useState } from 'react';
import { formatCurrencyVND } from 'utils/currency';
import { EditOutlined as EditIcon } from '@ant-design/icons';

type AdvanceType = 'Tạm ứng hợp đồng' | 'Tạm ứng Khách hàng';

type HistoryData = {
  id: string;
  advanceDate: string;
  contractNumber: string;
  amount: number;
  status: string;
  advanceType: AdvanceType;
};

const mockHistoryData: HistoryData[] = [
  {
    id: '1',
    advanceDate: '2025-05-01',
    contractNumber: '',
    amount: 500000000,
    status: 'Chuyển khoản',
    advanceType: 'Tạm ứng hợp đồng'
  },
  {
    id: '2',
    advanceDate: '2025-05-05',
    contractNumber: 'HD002',
    amount: 300000000,
    status: 'Chưa chuyển',
    advanceType: 'Tạm ứng Khách hàng'
  },
  {
    id: '3',
    advanceDate: '2025-05-10',
    contractNumber: 'HD003',
    amount: 700000000,
    status: 'Chuyển khoản',
    advanceType: 'Tạm ứng hợp đồng'
  },
  {
    id: '4',
    advanceDate: '2025-05-15',
    contractNumber: 'HD004',
    amount: 200000000,
    status: 'Chưa chuyển',
    advanceType: 'Tạm ứng Khách hàng'
  }
];

export default function HistoryPayment({ striped, title }: { striped?: boolean; title?: string }) {
  const [data, setData] = useState<HistoryData[]>(mockHistoryData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    advanceDate: '',
    contractNumber: '',
    amount: '',
    advanceType: 'Tạm ứng hợp đồng' as AdvanceType
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditRecord = (record: HistoryData) => {
    setEditingId(record.id);
    setFormData({
      advanceDate: record.advanceDate,
      contractNumber: record.contractNumber,
      amount: record.amount.toString(),
      advanceType: record.advanceType
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      advanceDate: '',
      contractNumber: '',
      amount: '',
      advanceType: 'Tạm ứng hợp đồng'
    });
  };

  const handleAddRecord = () => {
    if (!formData.advanceDate || !formData.amount) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (editingId) {
      // Update existing record
      setData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                advanceDate: formData.advanceDate,
                contractNumber: formData.contractNumber,
                amount: Number(formData.amount),
                advanceType: formData.advanceType
              }
            : item
        )
      );
      setEditingId(null);
    } else {
      // Add new record
      const newRecord: HistoryData = {
        id: Date.now().toString(),
        advanceDate: formData.advanceDate,
        contractNumber: formData.contractNumber,
        amount: Number(formData.amount),
        status: 'Chưa chuyển',
        advanceType: formData.advanceType
      };
      setData((prev) => [...prev, newRecord]);
    }

    setFormData({
      advanceDate: '',
      contractNumber: '',
      amount: '',
      advanceType: 'Tạm ứng hợp đồng'
    });
  };

  const handleUpdateStatus = (id: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: item.status === 'Chưa chuyển' ? 'Chuyển khoản' : 'Chưa chuyển' } : item))
    );
  };

  const columns = useMemo<ColumnDef<HistoryData>[]>(
    () => [
      {
        header: 'Ngày tạm ứng',
        accessorKey: 'advanceDate'
      },
      {
        header: 'Loại tạm ứng',
        accessorKey: 'advanceType'
      },
      {
        header: 'Số hợp đồng',
        accessorKey: 'contractNumber'
      },
      {
        header: 'Số tiền',
        accessorKey: 'amount',
        cell: (cell) => formatCurrencyVND(cell.getValue() as number)
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Chuyển khoản':
              return <Chip color="success" label="Chuyển khoản" size="small" variant="light" />;
            case 'Chưa chuyển':
              return <Chip color="error" label="Chưa chuyển" size="small" variant="light" />;
            default:
              return <Chip color="info" label="Single" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Thao tác',
        id: 'actions',
        cell: (cell) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => handleEditRecord(cell.row.original)} color="primary" title="Chỉnh sửa">
              <EditIcon />
            </IconButton>
          </Box>
        )
      }
    ],
    []
  );

  return (
    <Box>
      {/* Form nhập liệu */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <TextField
              label="Ngày tạm ứng"
              type="date"
              fullWidth
              value={formData.advanceDate}
              onChange={(e) => handleInputChange('advanceDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <TextField
              label="Loại tạm ứng"
              select
              fullWidth
              value={formData.advanceType}
              onChange={(e) => handleInputChange('advanceType', e.target.value)}
            >
              <MenuItem value="Tạm ứng hợp đồng">Tạm ứng hợp đồng</MenuItem>
              <MenuItem value="Tạm ứng Khách hàng">Tạm ứng Khách hàng</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <TextField
              label="Số hợp đồng"
              fullWidth
              value={formData.contractNumber}
              onChange={(e) => handleInputChange('contractNumber', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <TextField
              label="Số tiền"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleAddRecord}
                sx={{ height: '40px', flex: 1 }}
                color={editingId ? 'warning' : 'primary'}
              >
                {editingId ? 'Cập nhật' : 'Thêm'}
              </Button>
              {editingId && (
                <Button variant="outlined" onClick={handleCancelEdit} sx={{ height: '40px' }} color="secondary">
                  Hủy
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Bảng lịch sử */}
      <ReactTableWithTotal {...{ data, columns, title, striped, total: data.reduce((sum, row) => sum + row.amount, 0), colSpan: 3 }} />
    </Box>
  );
}
