import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';

import { CircularProgress } from '@mui/material';
import {
  ColumnDef,
  HeaderGroup,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';

// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { DebouncedInput, HeaderSort, TablePagination } from 'components/third-party/react-table';

// assets
import { AuditOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import { useDialog, useRouter } from 'hooks';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { routing } from 'routes/routing';
import { CommonStatus, getStatusColor, getStatusText, getTabColor, numberHelper } from 'utils';
import { copyToClipboard } from 'utils/clipboard';
import axiosServices from 'utils/axios';
import { LIST_STATUS_APPROVAL, PAGE_LIMIT, PAGE_SIZE, TYPE_ASC_DESC } from '../../../../constants';
import { PURCHASE_CONTRACT_API } from 'api/constants';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { ContractPurchaseApprovalDialog } from 'dialogs';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import { LocalStorageKeys } from '../../../../constants/storage';
import { PermissionGuard } from 'components/guards';
import { CustomIconButton } from 'components/buttons';

// types
interface PurchaseContractPackingPlanGoodSupplier {
  id: number;
  code: string;
  supplierId: number;
  goodId: number;
  quantity: number;
  goodType: string;
  realQuantity: number | null;
  packingPlanId: number;
  unitPrice: number;
}

interface PurchaseContractPackingPlan {
  id: number;
  code: string;
  status: number;
  isApprove: number;
  purchaseContractId: number;
  shippingScheduleId: number;
  purchaseContractPackingPlanGoodSuppliers: PurchaseContractPackingPlanGoodSupplier[];
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  lastUpdatedProgram: string;
}

interface PurchaseContract {
  id: number;
  code: string;
  status: CommonStatus;
  contractId: number;
  contractCode: string | null;
  contractNumber: string;
  businessPlanId: number;
  contractDate: string;
  sellerId: number | null;
  sellerName: string | null;
  buyerId: number | null;
  buyerName: string;
  saleContractId: number | null;
  purchaseContractPackingPlan: PurchaseContractPackingPlan | null;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
}

// ==============================|| TRUNCATED CELL COMPONENT ||============================== //

interface TruncatedCellProps {
  value: string | number | null | undefined;
  maxLength?: number;
  width?: string | number;
}

function TruncatedCell({ value, maxLength = 30, width }: TruncatedCellProps) {
  const displayValue = value?.toString() || '---';
  const shouldTruncate = displayValue.length > maxLength;
  const truncatedValue = shouldTruncate ? `${displayValue.substring(0, maxLength)}...` : displayValue;

  return (
    <Box sx={{ width, minWidth: width, maxWidth: width }}>
      {shouldTruncate ? (
        <Tooltip title={displayValue} arrow placement="top">
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'block'
            }}
          >
            {truncatedValue}
          </span>
        </Tooltip>
      ) : (
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block'
          }}
        >
          {displayValue}
        </span>
      )}
    </Box>
  );
}

// ==============================|| PURCHASE ORDER APPROVAL PAGE ||============================== //

export default function PurchaseOrderApproval() {
  const router = useRouter();
  const intl = useIntl();
  const navigate = useNavigate();
  const dialog = useDialog();

  const [, setCanContinueStep] = useLocalStorage<Record<string, boolean>>(LocalStorageKeys.PURCHASE_CONTRACT, {});
  const [activeTab, setActiveTab] = useState<number>(CommonStatus.RequestApproval);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listPurchaseContracts, setListPurchaseContracts] = useState<PurchaseContract[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: '',
      desc: false
    }
  ]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });

  /* ==== LIST WITHOUT PAGING */
  const [countListPO, setCountListPO] = useState({
    APPROVED: 0,
    REJECTED: 0,
    REQUEST_APPROVAL: 0,
    ALL: 0
  });

  const getListPurchaseContracts = useCallback(
    async (
      page: number = PAGE_SIZE,
      size: number = PAGE_LIMIT,
      key_search: string = '',
      key_sort: string = '',
      key_sort_direction: string = '',
      key_status: number | ''
    ) => {
      try {
        setLoading(true);
        const { data } = await axiosServices.get(
          PURCHASE_CONTRACT_API.GET_LIST +
            '/page' +
            `?page=${page + 1}&size=${size}&Status=${key_status}&ContractCode=${key_search}&sortBy=${key_sort}&SortDirection=${key_sort_direction}`
        );

        const counts = {
          APPROVED: data?.meta?.count?.approvedCount || 0,
          REJECTED: data?.meta?.count?.rejectedCount || 0,
          REQUEST_APPROVAL: data?.meta?.count?.requestApproveCount || 0
        };
        setCountListPO({
          ...counts,
          ALL: counts.APPROVED + counts.REJECTED + counts.REQUEST_APPROVAL
        });

        const formatData: PurchaseContract[] = data.data.map((item: any) => ({
          id: item.id,
          code: item.code,
          status: item.status,
          contractId: item.contractId,
          contractCode: item.contractCode,
          contractNumber: item.contractNumber,
          businessPlanId: item.businessPlanId,
          contractDate: item.contractDate,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          buyerId: item.buyerId,
          buyerName: item.buyerName,
          saleContractId: item.saleContractId,
          purchaseContractPackingPlan: item.purchaseContractPackingPlan,
          createdAt: item.createdAt,
          lastUpdatedAt: item.lastUpdatedAt,
          createdBy: item.createdBy,
          lastUpdatedBy: item.lastUpdatedBy
        }));

        setListPurchaseContracts(formatData);
        setTotalPage(data.meta.totalPages || 0);
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Memoize the API call function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    await getListPurchaseContracts(
      pagination.pageIndex,
      pagination.pageSize,
      globalFilter,
      sorting[0]?.id,
      sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
      activeTab === 100 ? '' : activeTab // Không lọc khi chọn All (activeTab = 100)
    );
  }, [activeTab, globalFilter, sorting[0]?.id, sorting[0]?.desc, pagination.pageIndex, pagination.pageSize, getListPurchaseContracts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewPurchaseDetail = (contractId: number) => {
    navigate(routing.contractPurchase.detail(contractId));
  };

  const handleOpenApprovalDialog = async (purchaseContract: PurchaseContract) => {
    const result = await dialog.show(ContractPurchaseApprovalDialog, {
      purchaseContractId: purchaseContract.id,
      businessPlanId: purchaseContract.businessPlanId
    });

    if (result?.success) {
      setCanContinueStep((state: Record<string, boolean>) => ({
        ...state,
        [purchaseContract.id]: true
      }));

      await getListPurchaseContracts(
        pagination.pageIndex,
        pagination.pageSize,
        globalFilter,
        sorting[0]?.id,
        sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
        activeTab === 100 ? '' : activeTab
      );
    }
  };

  const columns = useMemo<ColumnDef<PurchaseContract>[]>(
    () => [
      {
        id: 'code',
        header: 'Mã hợp đồng',
        accessorKey: 'code',
        cell: ({ row }) => {
          const code = row?.original?.code;
          return (
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <TruncatedCell value={code} maxLength={25} width={100} />
              {code && (
                <Tooltip title="Sao chép mã hợp đồng" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const success = await copyToClipboard(code);
                      if (success) {
                        enqueueSnackbar('Đã sao chép mã hợp đồng', {
                          variant: 'success',
                          autoHideDuration: 2000,
                          anchorOrigin: { horizontal: 'right', vertical: 'top' }
                        });
                      } else {
                        enqueueSnackbar('Sao chép thất bại', {
                          variant: 'error',
                          autoHideDuration: 2000,
                          anchorOrigin: { horizontal: 'right', vertical: 'top' }
                        });
                      }
                    }}
                    sx={{ width: 24, height: 24, color: 'primary.main' }}
                  >
                    <CopyOutlined style={{ fontSize: '12px' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        }
      },
      {
        id: 'buyerNamer',
        header: 'Bên mua',
        accessorKey: 'buyerNamer',
        cell: ({ row }) => row.original.buyerName || '---'
      },
      {
        id: 'totalCost',
        header: 'Tổng chi phí',
        accessorKey: 'purchaseContractPackingPlan',
        cell: ({ row }) => {
          const packingPlan = row.original.purchaseContractPackingPlan;
          if (!packingPlan?.purchaseContractPackingPlanGoodSuppliers) {
            return '---';
          }
          const totalCost = packingPlan.purchaseContractPackingPlanGoodSuppliers.reduce(
            (total, item) => total + item.quantity * item.unitPrice,
            0
          );
          return numberHelper.formatCurrency(totalCost, { currency: 'VND' });
        }
      },
      {
        id: 'status',
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: (cell) => {
          const value = cell.getValue() as CommonStatus;
          return <Chip label={getStatusText(value)} color={getStatusColor(value)} size="small" />;
        }
      },
      {
        id: 'actions',
        header: 'Thao tác',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const isApproved = row.original.status === CommonStatus.Approved;
          const isRejected = row.original.status === CommonStatus.Rejected;
          const isRequestApproval = row.original.status === CommonStatus.RequestApproval;
          const isProcessed = isApproved; // Chỉ disable khi đã được phê duyệt, cho phép phê duyệt lại sau khi reject

          const getTooltipText = () => {
            if (isApproved) return 'Đã phê duyệt';
            if (isRejected) return 'Phê duyệt lại';
            if (isRequestApproval) return 'Phê duyệt';
            return 'Phê duyệt';
          };

          return (
            <Box display="flex" gap={1}>
              <PermissionGuard permission="PURCHASE_ORDER_APPROVE">
                <CustomIconButton
                  tooltip={getTooltipText()}
                  color="primary"
                  disabled={isProcessed}
                  onClick={() => handleOpenApprovalDialog(row.original)}
                  icon={<AuditOutlined />}
                />
              </PermissionGuard>
              <PermissionGuard permission="PURCHASE_ORDER_VIEW">
                <CustomIconButton
                  tooltip="Xem chi tiết"
                  color="info"
                  onClick={() => handleViewPurchaseDetail(row.original.id)}
                  icon={<EyeOutlined />}
                />
              </PermissionGuard>
            </Box>
          );
        }
      }
    ],
    [router, getStatusText, handleOpenApprovalDialog]
  );

  const table = useReactTable({
    data: listPurchaseContracts || [],
    columns,
    state: {
      sorting,
      pagination
    },
    manualPagination: true,
    pageCount: totalPage,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  });

  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    {
      title: 'Đơn hàng mua',
      to: routing.contractPurchase.list
    },
    { title: 'Phê duyệt' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="Phê duyệt đơn hàng mua" links={breadcrumbLinks} />

      <MainCard content={false}>
        <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={(e: ChangeEvent<unknown>, value: string) => {
              setPagination({
                pageIndex: PAGE_SIZE,
                pageSize: PAGE_LIMIT
              });
              setActiveTab(Number(value));
            }}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {LIST_STATUS_APPROVAL.map(
              (
                status: {
                  id: number | null;
                  code: string;
                  label: string;
                  color: number;
                },
                index: number
              ) => (
                <Tab
                  key={index}
                  label={intl.formatMessage({ id: status.label })}
                  value={status.id}
                  iconPosition="end"
                  icon={
                    <Chip
                      label={(countListPO as any)[status.code] || 0}
                      variant="light"
                      size="small"
                      color={getTabColor(status.color as any)}
                      sx={{ ml: 0.5 }}
                    />
                  }
                />
              )
            )}
          </Tabs>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <DebouncedInput
                value={globalFilter ?? ''}
                onFilterChange={(value) => setGlobalFilter(String(value))}
                placeholder="Tìm kiếm theo mã hợp đồng, bên bán"
                sx={{ minWidth: 350 }}
              />
            </Stack>

            <ScrollX>
              {(listPurchaseContracts || []).length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                                Object.assign(header.column.columnDef.meta, {
                                  className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                                });
                              }

                              return (
                                <TableCell
                                  key={header.id}
                                  {...header.column.columnDef.meta}
                                  onClick={header.column.getToggleSortingHandler()}
                                  {...(header.column.getCanSort() &&
                                    header.column.columnDef.meta === undefined && {
                                      className: 'cursor-pointer prevent-select'
                                    })}
                                >
                                  {header.isPlaceholder ? null : (
                                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                                      <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                      {header.column.getCanSort() && <HeaderSort column={header.column} />}
                                    </Stack>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableHead>
                      {!loading && (
                        <TableBody>
                          {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                  {(listPurchaseContracts || []).length > 0 && (
                    <TablePagination
                      {...{
                        setPageSize: table.setPageSize,
                        setPageIndex: table.setPageIndex,
                        getState: table.getState,
                        getPageCount: table.getPageCount
                      }}
                    />
                  )}
                </>
              ) : (
                !loading && (
                  <Box py={4} textAlign="center">
                    <Typography variant="body1" color="text.secondary">
                      Không có đơn hàng mua nào cần phê duyệt
                    </Typography>
                  </Box>
                )
              )}
              {loading && (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={504}>
                  <CircularProgress />
                </Box>
              )}
            </ScrollX>
          </Stack>
        </Box>
      </MainCard>
    </>
  );
}
