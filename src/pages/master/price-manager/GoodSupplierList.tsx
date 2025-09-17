import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';

// MUI
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Checkbox from '@mui/material/Checkbox';

// Project components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport, DebouncedInput, EmptyTable, TablePagination } from 'components/third-party/react-table';
import { openSnackbar } from 'api/snackbar';

// Icons
import { PlusOutlined } from '@ant-design/icons';

// API & Types
import { goodSupplierService } from '../../../api/good-supplier';
import { GoodSupplier, GoodSupplierFilter } from '../../../types/good-supplier';
import useGood from 'api/good';
import useSupplier from 'api/supplier';

// Local
import GoodSupplierForm from './GoodSupplierForm';
import { formatCurrencyVND } from 'utils/currency';
import { useNavigate } from 'react-router';
import useCodeDetail from 'api/codeDetail';
import AlertPriceManagementDeactivate from 'sections/apps/price-manager/AlertPriceManagementDeactive';
import AlertPriceManagementActivate from 'sections/apps/price-manager/AlertPriceManagementActivate';

export default function GoodSupplierList() {
  const navigate = useNavigate();
  const theme = useTheme();

  // Data
  const [goodSuppliers, setGoodSuppliers] = useState<GoodSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Paging
  const [page, setPage] = useState(0); // zero-based for TablePagination
  const [size, setSize] = useState(10);

  // Filters
  const [searchCode, setSearchCode] = useState('');
  const [searchGood, setSearchGood] = useState('');
  // Debounce to call BE
  const [debCode, setDebCode] = useState('');
  const [debGood, setDebGood] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebCode(searchCode), 300);
    return () => clearTimeout(t);
  }, [searchCode]);
  useEffect(() => {
    const t = setTimeout(() => setDebGood(searchGood), 300);
    return () => clearTimeout(t);
  }, [searchGood]);
  const [filter, setFilter] = useState<GoodSupplierFilter>({
    page: 1,
    size: 10
  });

  // Type of good for render (the value database return will display differently in table)
  const SERVICE_TYPE_LABELS = {
    Level1: 'Loại 1',
    Level2: 'Loại 2',
    Level3: 'Loại 3',
    STANDARD: 'Standard',
    PREMIUM: 'Premium',
    A: 'Grade A',
    B: 'Grade B',
    C: 'Grade C'
  };

  // Tabs (All/Active/Inactive)
  const groups = ['Tất cả', 'Kích hoạt', 'Ngưng'];
  const [activeTab, setActiveTab] = useState(groups[0]);

  // ==============================|| DEACTIVATE SHIPPING UNIT MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [goodSupplierDeactivateId, setGoodSupplierDeactivateId] = useState<number | null>(null);
  const [goodSupplierUnitName, setGoodSupplierName] = useState<string>('');
  const handleClose = () => setOpen((prev) => !prev);

  // ==============================|| ACTIVATE SHIPPING UNIT MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [goodSupplierActivateId, setGoodSupplierActivateId] = useState<number | null>(null);
  const [activeGoodSupplierUnitName, setActiveGoodSupplierName] = useState<string>('');
  const handleActivateClose = () => setActivateOpen((prev) => !prev);

  // Sort state
  type SortField = 'code' | 'goodName' | 'supplierName' | 'unitPrice' | 'goodType' | 'startDate' | 'endDate' | 'status';
  const [sortField, setSortField] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [countsBE, setCountsBE] = useState({ all: 0, active: 0, inactive: 0 });

  // fetch record with status active and inactive to display in the header tab
  const fetchCounts = useCallback(async () => {
    try {
      const base = { code: debCode?.trim() || undefined, goodName: debGood?.trim() || undefined };
      const [activeRes, inactiveRes]: any = await Promise.all([
        goodSupplierService.getGoodSuppliers({ page: 1, size: 1, status: 1, ...base }),
        goodSupplierService.getGoodSuppliers({ page: 1, size: 1, status: 0, ...base })
      ]);
      const getTotal = (res: any) => (Array.isArray(res) ? res.length : res?.meta?.total || (res?.data?.length ?? 0));

      const active = getTotal(activeRes);
      const inactive = getTotal(inactiveRes);
      setCountsBE({ all: active + inactive, active, inactive });
    } catch {}
  }, [debCode, debGood]);

  // Load list base on the tab active (all, active, inactive)
  const loadGoodSuppliers = useCallback(async () => {
    try {
      setLoading(true);

      if (activeTab === groups[0]) {
        const total: any = await goodSupplierService.getGoodSuppliers({
          ...filter,
          page: page + 1,
          size,
          code: debCode?.trim() || undefined,
          goodName: debGood?.trim() || undefined
        });

        const totalItems = Array.isArray(total) ? total : total?.data || [];
        const itemsTotal = Array.isArray(total) ? totalItems.length : total?.meta?.total || total.length;

        setGoodSuppliers(totalItems);
        setTotal(itemsTotal);
      } else {
        const result: any = await goodSupplierService.getGoodSuppliers({
          ...filter,
          page: page + 1,
          size,
          code: debCode?.trim() || undefined,
          goodName: debGood?.trim() || undefined,
          status: activeTab === groups[1] ? 1 : 0
        });
        const items = Array.isArray(result) ? result : result?.data || [];
        const totalCount = Array.isArray(result) ? items.length : result?.meta?.total || items.length;
        setGoodSuppliers(items);
        setTotal(totalCount);
      }
    } catch (error: any) {
      openSnackbar({
        open: true,
        message: error?.message || 'Tải danh sách thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }, [filter, page, size, debCode, debGood, activeTab]);

  useEffect(() => {
    loadGoodSuppliers();
  }, [loadGoodSuppliers]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Handlers
  const handleCreate = () => {
    navigate('/master/good-supplier/create');
  };

  const handleEdit = (record: GoodSupplier) => {
    navigate(`/master/good-supplier/edit/${record.id}`);
  };

  // const handleDelete = async (id: number) => {
  //   try {
  //     await goodSupplierService.deleteGoodSupplier(id);
  //     openSnackbar({
  //       open: true,
  //       message: 'Xoá thành công',
  //       variant: 'alert',
  //       alert: { color: 'success' }
  //     } as any);
  //     await loadGoodSuppliers();
  //     await fetchCounts(); // Cập nhật badge
  //   } catch (error: any) {
  //     openSnackbar({
  //       open: true,
  //       message: error?.message || 'Xoá thất bại',
  //       variant: 'alert',
  //       alert: { color: 'error' }
  //     } as any);
  //   }
  // };
  const viewData = useMemo(() => {
    const data = [...goodSuppliers];
    if (!sortField) return data;
    const byStr = (a?: string, b?: string) => (a || '').localeCompare(b || '', 'vi', { sensitivity: 'base' });
    const byNum = (a?: number, b?: number) => (a ?? 0) - (b ?? 0);
    const byDate = (a?: string, b?: string) => new Date(a || '').getTime() - new Date(b || '').getTime();

    const cmp = (a: any, b: any) => {
      switch (sortField) {
        case 'code':
          return byStr(a.code, b.code);
        case 'goodName':
          return byStr(a.goodName, b.goodName);
        case 'supplierName':
          return byStr(a.supplierName, b.supplierName);
        case 'unitPrice':
          return byNum(a.unitPrice, b.unitPrice);
        case 'goodType':
          return byStr(a.goodType, b.goodType);
        case 'startDate':
          return byDate(a.startDate, b.startDate);
        case 'endDate':
          return byDate(a.endDate, b.endDate);
        case 'status':
          return byNum(a.status, b.status);
        default:
          return 0;
      }
    };
    data.sort((a, b) => (sortOrder === 'asc' ? cmp(a, b) : cmp(b, a)));
    return data;
  }, [goodSuppliers, sortField, sortOrder]);

  const csvData = useMemo(
    () =>
      viewData.map((row) => ({
        ...row,
        unitPrice: typeof row.unitPrice === 'number' ? formatCurrencyVND(row.unitPrice).replace('₫', 'đ') : '',
        startDate: row.startDate ? dayjs(row.startDate).format('DD/MM/YYYY') : '',
        endDate: row.endDate ? dayjs(row.endDate).format('DD/MM/YYYY') : '',
        status: row.status === 1 ? 'Có hiệu lực' : 'Hết hiệu lực'
      })),
    [viewData]
  );

  const handleDeactivateGoodSupplier = (goodSupplierId: number) => {
    const goodSupplierUnit = goodSuppliers.find((s: GoodSupplier) => s.id === goodSupplierId);
    setOpen(true);
    setGoodSupplierDeactivateId(goodSupplierId);
    setGoodSupplierName(goodSupplierUnit?.goodName || '');
  };

  const handleDeactivateSuccess = async () => {
    await loadGoodSuppliers();
    await fetchCounts(); // Cập nhật badge
  };

  const handleActivateGoodSupplier = (goodSupplierId: number) => {
    const goodSupplierUnit = goodSuppliers.find((s: GoodSupplier) => s.id === goodSupplierId);
    setActivateOpen(true);
    setGoodSupplierActivateId(goodSupplierId);
    console.log(goodSupplierActivateId);
    setActiveGoodSupplierName(goodSupplierUnit?.goodName || '');
  };

  return (
    <>
      <MainCard content={false}>
        {/* Tabs */}
        <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              setActiveTab(v);
              setPage(0);
              fetchCounts();
            }}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label="Tất Cả"
              value={groups[0]}
              icon={<Chip label={countsBE.all} color="primary" variant="light" size="small" />}
              iconPosition="end"
            />
            <Tab
              label="Có hiệu lực"
              value={groups[1]}
              icon={<Chip label={countsBE.active} color="success" variant="light" size="small" />}
              iconPosition="end"
            />
            <Tab
              label="Hết hiệu lực"
              value={groups[2]}
              icon={<Chip label={countsBE.inactive} color="error" variant="light" size="small" />}
              iconPosition="end"
            />
          </Tabs>
        </Box>

        {/* Header actions - 2 search gửi BE (code & goodName) */}
        {/* Header actions - 2 search gửi BE (code & goodName) */}
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2.5, gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            {/* Search by code */}
            <TextField
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm theo mã sản phẩm"
              size="medium"
              sx={{ width: { xs: '100%', sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined style={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />
            {/* Search by good name */}
            <TextField
              value={searchGood}
              onChange={(e) => {
                setSearchGood(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm theo tên hàng hóa"
              size="medium"
              sx={{ width: { xs: '100%', sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined style={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />
          </Stack>
          {/* Right actions giữ nguyên */}
          <Stack direction="row" sx={{ gap: 1 }}>
            {/* Sắp xếp */}
            <FormControl size="medium" sx={{ minWidth: 260 }}>
              <InputLabel id="sort-field-label">
                Sắp xếp{' '}
                {sortField
                  ? `(${
                      {
                        code: 'Mã',
                        goodName: 'Tên hàng hóa',
                        supplierName: 'Nhà cung cấp',
                        unitPrice: 'Số Tiền',
                        goodType: 'Loại',
                        startDate: 'Ngày đề nghị',
                        endDate: 'Ngày kết thúc',
                        status: 'Trạng thái'
                      }[sortField]
                    })`
                  : ''}
              </InputLabel>
              <Select
                labelId="sort-field-label"
                value={sortField || ''}
                label="Sắp xếp"
                onChange={(e) => {
                  const value = e.target.value as SortField;
                  setSortField(sortField === value ? '' : value);
                  console.log(sortField);
                }}
                renderValue={() =>
                  sortField
                    ? `Sắp xếp (${
                        {
                          code: 'Mã',
                          goodName: 'Tên hàng hóa',
                          supplierName: 'Nhà cung cấp',
                          unitPrice: 'Số Tiền',
                          goodType: 'Loại',
                          startDate: 'Ngày bắt đầu',
                          endDate: 'Ngày kết thúc',
                          status: 'Trạng thái'
                        }[sortField]
                      })`
                    : 'Sắp xếp'
                }
                input={<OutlinedInput label="Sắp xếp" />}
                MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
              >
                {[
                  { key: 'startDate', label: 'Ngày đề nghị' },
                  { key: 'goodType', label: 'Loại' },
                  { key: 'status', label: 'Trạng thái' },
                  { key: 'code', label: 'Mã' },
                  { key: 'goodName', label: 'Tên hàng hóa' },
                  { key: 'supplierName', label: 'Nhà cung cấp' },
                  { key: 'unitPrice', label: 'Số Tiền' },
                  { key: 'endDate', label: 'Ngày kết thúc' }
                ].map((opt) => (
                  <MenuItem
                    onClick={() => {
                      setSortField(sortField === opt.key ? '' : (opt.key as SortField));
                    }}
                    key={opt.key}
                    value={opt.key}
                  >
                    <Checkbox checked={sortField === (opt.key as SortField)} />
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {sortField && (
              <Button
                variant="outlined"
                onClick={() => setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))}
                sx={{ ml: 1, whiteSpace: 'nowrap' }}
              >
                {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              </Button>
            )}

            {/* Tạo đề nghị */}
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleCreate} sx={{ whiteSpace: 'nowrap' }}>
              Tạo Mới
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        <ScrollX>
          <Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã</TableCell>
                    <TableCell>Tên hàng hóa</TableCell>
                    <TableCell>Nhà cung cấp</TableCell>
                    <TableCell align="right">Số Tiền</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Ngày bắt đầu</TableCell>
                    <TableCell>Ngày kết thúc</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <EmptyTable msg={loading ? 'Đang tải...' : 'Không có dữ liệu'} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    viewData.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.code}</TableCell>
                        <TableCell>{row.goodName}</TableCell>
                        <TableCell>{row.supplierName}</TableCell>
                        <TableCell align="right">
                          {typeof row.unitPrice === 'number' ? formatCurrencyVND(row.unitPrice).replace('₫', 'đ') : '-'}
                        </TableCell>
                        <TableCell>
                          {SERVICE_TYPE_LABELS[row.goodType as keyof typeof SERVICE_TYPE_LABELS] || row.goodType || '-'}
                        </TableCell>
                        <TableCell>{row.startDate ? dayjs(row.startDate).format('DD/MM/YYYY') : '-'}</TableCell>
                        <TableCell>{row.endDate ? dayjs(row.endDate).format('DD/MM/YYYY') : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status === 1 ? 'Có hiệu lực' : 'Hết hiệu lực'}
                            color={row.status === 1 ? 'success' : 'error'}
                            variant="light"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Sửa">
                              <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
                                <EditOutlined style={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Xoá">
                              {row.status === 1 ? (
                                <IconButton size="small" color="error" onClick={() => handleDeactivateGoodSupplier(row.id)}>
                                  <DeleteOutlined style={{ fontSize: 18 }} />
                                </IconButton>
                              ) : (
                                <IconButton size="small" color="success" onClick={() => handleActivateGoodSupplier(row.id)}>
                                  <CheckCircleOutlined style={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TablePagination
                setPageSize={(n) => {
                  setSize(n);
                  setPage(0);
                }}
                setPageIndex={(idx) => setPage(idx)}
                getState={() => ({ pagination: { pageIndex: page, pageSize: size } }) as any}
                getPageCount={() => Math.ceil((total || 0) / (size || 10))}
              />
            </Box>
          </Stack>
        </ScrollX>
      </MainCard>

      <AlertPriceManagementDeactivate
        id={goodSupplierDeactivateId ?? 0}
        title={goodSupplierUnitName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={handleDeactivateSuccess}
      />
      <AlertPriceManagementActivate
        id={goodSupplierActivateId ?? 0}
        title={activeGoodSupplierUnitName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={handleDeactivateSuccess}
      />
    </>
  );
}
