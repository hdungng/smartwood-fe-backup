import { Chip, Grid, TextField, Button, Box } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import ReactTable from 'common/tables/BasicTable';
import { useMemo, useState } from 'react';
import { formatCurrencyVND } from 'utils/currency';

type HistoryApprove = {
  contractNumber: string;
  advanceDate: string;
  status: string;
  note: string;
};

const mockHistoryApprove: HistoryApprove[] = [
  {
    contractNumber: '1234567890',
    advanceDate: '2021-01-01',
    status: 'Từ chối',
    note: 'Thiếu thông tin hợp đồng'
  },
  {
    contractNumber: '0987654321',
    advanceDate: '2021-02-15',
    status: 'Từ chối',
    note: 'Thiếu chữ ký người đại diện'
  },
  {
    contractNumber: '5566778899',
    advanceDate: '2021-04-05',
    status: 'Từ chối',
    note: 'Không khớp thông tin ngân hàng'
  }
];

export default function Approve() {
  const [data, setData] = useState<HistoryApprove[]>(mockHistoryApprove);
  const [note, setNote] = useState('');

  const handleApprove = () => {
    const newItem: HistoryApprove = {
      contractNumber: 'NEW' + Math.floor(Math.random() * 1000),
      advanceDate: new Date().toISOString().split('T')[0],
      status: 'Chưa duyệt',
      note: note
    };
    setData([...data, newItem]);
    setNote('');
  };

  const handleReject = () => {
    const newItem: HistoryApprove = {
      contractNumber: 'NEW' + Math.floor(Math.random() * 1000),
      advanceDate: new Date().toISOString().split('T')[0],
      status: 'Từ chối',
      note: note
    };
    setData([...data, newItem]);
    setNote('');
  };

  const columns = useMemo<ColumnDef<HistoryApprove>[]>(
    () => [
      {
        header: 'Số hợp đồng',
        accessorKey: 'contractNumber'
      },
      {
        header: 'Ngày duyệt',
        accessorKey: 'advanceDate'
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Chưa duyệt':
              return <Chip color="success" label="Chưa duyệt" size="small" variant="light" />;
            case 'Từ chối':
              return <Chip color="error" label="Từ chối" size="small" variant="light" />;
            default:
              return <Chip color="info" label="Single" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Ghi chú',
        accessorKey: 'note'
      }
    ],
    []
  );

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth multiline rows={4} label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleApprove}>
              Yêu cầu phê duyệt
            </Button>
            <Button variant="contained" color="success" onClick={handleApprove}>
              Phê duyệt
            </Button>
            <Button variant="contained" color="error" onClick={handleReject}>
              Từ chối
            </Button>
          </Box>
        </Grid>
      </Grid>
      <ReactTable columns={columns} data={data} />
    </Box>
  );
}
