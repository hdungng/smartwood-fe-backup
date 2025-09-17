import { useState, useMemo, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Button, Chip, Grid, Stack, Tooltip, Typography, IconButton as MuiIconButton } from '@mui/material';

// third-party
import { ColumnDef } from '@tanstack/react-table';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import ContractTable from 'sections/apps/customer/ContractTable';
import AlertContractDelete from 'sections/apps/customer/AlertContractDelete';
import EmptyReactTable from 'pages/tables/react-table/empty';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { APP_DEFAULT_PATH } from 'config';

// types
interface ContractData {
  id: string;
  contractNumber: string;
  companyName: string;
  companyCode: string;
  termMonths: number;
  termLabel: string;
  fileName: string;
  fileSize: number;
  createdDate: string;
  status: 'active' | 'expired' | 'pending';
  totalValue?: number;
  notes?: string;
}

// Mock data
const mockContracts: ContractData[] = [
  {
    id: '1',
    contractNumber: 'CT001',
    companyName: 'Công ty TNHH ABC',
    companyCode: 'ABC001',
    termMonths: 12,
    termLabel: '12 tháng',
    fileName: 'hop_dong_abc_2024.pdf',
    fileSize: 2.5,
    createdDate: '2024-01-15',
    status: 'active',
    totalValue: 5000000000,
    notes: 'Hợp đồng chính thức'
  },
  {
    id: '2',
    contractNumber: 'CT002',
    companyName: 'Công ty TNHH XYZ',
    companyCode: 'XYZ002',
    termMonths: 6,
    termLabel: '6 tháng',
    fileName: 'hop_dong_xyz_2024.pdf',
    fileSize: 1.8,
    createdDate: '2024-02-20',
    status: 'pending',
    totalValue: 3000000000,
    notes: 'Đang chờ phê duyệt'
  },
  {
    id: '3',
    contractNumber: 'CT003',
    companyName: 'Công ty CP DEF',
    companyCode: 'DEF003',
    termMonths: 24,
    termLabel: '24 tháng',
    fileName: 'hop_dong_def_2023.pdf',
    fileSize: 3.2,
    createdDate: '2023-12-10',
    status: 'expired',
    totalValue: 8000000000,
    notes: 'Hợp đồng đã hết hạn'
  },
  {
    id: '4',
    contractNumber: 'CT004',
    companyName: 'Công ty TNHH GHI',
    companyCode: 'GHI004',
    termMonths: 12,
    termLabel: '12 tháng',
    fileName: 'hop_dong_ghi_2024.pdf',
    fileSize: 2.1,
    createdDate: '2024-03-05',
    status: 'active',
    totalValue: 4500000000,
    notes: 'Hợp đồng mới ký'
  }
];

// ==============================|| CONTRACT LIST PAGE ||============================== //

export default function ContractList() {
  const navigate = useNavigate();
  const [contractData] = useState<ContractData[]>(mockContracts);
  const [contractDeleteId, setContractDeleteId] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(!open);
  };

  const handleEdit = (id: string) => {
    // Điều hướng đến trang edit
    navigate(`/master/customer-contract/edit/${id}`);
  };

  const handleView = (id: string) => {
    // Điều hướng đến trang view chi tiết
    navigate(`/master/customer-contract/view/${id}`);
  };

  const handleDelete = (id: string) => {
    setContractDeleteId(id);
    setOpen(true);
  };

  const handleCreateNew = () => {
    navigate('/master/customer-contract/create');
  };

  const columns = useMemo<ColumnDef<ContractData>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: 'Mã HĐ',
        accessorKey: 'contractNumber',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Thông Tin Công Ty',
        accessorKey: 'companyName',
        cell: ({ row }) => (
          <Stack>
            <Typography variant="subtitle1">{row.original.companyName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.companyCode}
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Thời Hạn',
        accessorKey: 'termLabel',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'File Hợp Đồng',
        accessorKey: 'fileName',
        cell: ({ row }) => (
          <Stack>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {row.original.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.fileSize} MB
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Ngày Tạo',
        accessorKey: 'createdDate',
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return date.toLocaleDateString('vi-VN');
        }
      },
      {
        header: 'Giá Trị HĐ',
        accessorKey: 'totalValue',
        cell: ({ getValue }) => {
          const value = getValue() as number;
          if (!value) return '-';
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(value);
        },
        meta: {
          className: 'cell-right'
        }
      },
      {
        header: 'Trạng Thái',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'active':
              return <Chip color="success" label="Đang hiệu lực" size="small" variant="light" />;
            case 'expired':
              return <Chip color="error" label="Hết hạn" size="small" variant="light" />;
            case 'pending':
            default:
              return <Chip color="warning" label="Chờ phê duyệt" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Ghi Chú',
        accessorKey: 'notes',
        cell: ({ getValue }) => {
          const notes = getValue() as string;
          return notes ? (
            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {notes}
            </Typography>
          ) : (
            '-'
          );
        }
      },
      {
        header: 'Thao Tác',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="Xem">
                <IconButton
                  color="secondary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleView(row.original.id);
                  }}
                >
                  <EyeOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Chỉnh sửa">
                <IconButton
                  color="primary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleEdit(row.original.id);
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa">
                <IconButton
                  color="error"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleDelete(row.original.id);
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    [navigate]
  );
const breadcrumbLinks = [
  { title: 'Trang chủ', to: APP_DEFAULT_PATH },
  { title: 'Quản lý khách hàng', to: '/master/customer' },
  { title: 'Hợp đồng nguyên tắc', to: '/master/customer-contract' },
  { title: 'Danh sách'}
];
  return (
    <>
        <Breadcrumbs custom heading={`${breadcrumbLinks[3].title}`} links={breadcrumbLinks} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <MainCard >
            <ContractTable data={contractData} columns={columns} modalToggler={handleCreateNew} />
          </MainCard>
        </Grid>
      </Grid>
      <AlertContractDelete id={contractDeleteId} title={contractDeleteId} open={open} handleClose={handleClose} />
    </>
  );
}
