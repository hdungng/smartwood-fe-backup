import { useCallback, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { useIntl } from 'react-intl';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { ColumnDef } from '@tanstack/react-table';

// project imports
import IconButton from 'components/@extended/IconButton';
import EmptyReactTable from 'pages/tables/react-table/empty';

import { IndeterminateCheckbox } from 'components/third-party/react-table';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';

// @utils
import { CommonStatus, getStatusColor, numberHelper, unitHelper } from 'utils';

// @constants
import { Chip } from '@mui/material';
import { useToast } from 'contexts';
import { useBoolean, useRouter } from 'hooks';
import AlertColumnDelete from 'components/AlertColumnDelete';
import { routing } from 'routes/routing';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { PurchaseContractDetailResponse, purchaseContractService } from 'services/contract';
import { PaginationResult, SortDirection } from 'services/core';
import { PAGE_LIMIT, PAGE_SIZE } from '../../../../constants';
import { ReactTable } from './components';
import { copyToClipboard } from 'utils/clipboard';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import TableCell from '@mui/material/TableCell';
import { PermissionGuard } from 'components/guards';
import { CustomIconButton } from 'components/buttons';

export default function ContractPurchaseList() {
  const intl = useIntl();
  const toast = useToast();
  const router = useRouter();

  const [contractId, setContractId] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number>(0);
  const alertOpen = useBoolean();
  const loading = useBoolean();
  const [contracts, setContracts] = useState<PaginationResult<PurchaseContractDetailResponse>>();

  const pageRef = useRef(0);

  const fetchGetListPurchaseContract = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    search: string = '',
    sortBy: string = '',
    sortDirection: SortDirection = 'asc',
    status?: number
  ) => {
    try {
      const response = await purchaseContractService.listPurchaseContract({
        page: page + 1,
        size,
        status,
        code: search,
        sortBy,
        sortDirection
      });

      setContracts({
        data: Array.isArray(response.data) ? response.data : [],
        meta: response.meta as PaginationResult<PurchaseContractDetailResponse>['meta']
      });
    } finally {
      loading.onFalse();
    }
  };

  const fetchDeleteContract = useCallback(async () => {
    try {
      const response = await purchaseContractService.deleteContractPurchase(deleteId);
      if (response.success) {
        toast.success(intl.formatMessage({ id: 'common_delete_success_text' }));
        await fetchGetListPurchaseContract(pageRef.current, PAGE_LIMIT, '', '', 'asc');
      }
    } catch {
      toast.error(intl.formatMessage({ id: 'common_error_text' }));
    } finally {
      alertOpen.onFalse();
    }
  }, [deleteId]);

  const getStatusText = useCallback((status: CommonStatus) => {
    const STATUSES_TEXT: Record<CommonStatus, string> = {
      [CommonStatus.Inactive]: 'Không hoạt động',
      [CommonStatus.Active]: 'Hoạt động',
      [CommonStatus.Pending]: 'Đang chờ duyệt',
      [CommonStatus.Approved]: 'Đã duyệt',
      [CommonStatus.RequestApproval]: 'Yêu cầu phê duyệt',
      [CommonStatus.Rejected]: 'Từ chối',
      [CommonStatus.All]: 'Tất cả'
    };

    return STATUSES_TEXT[status];
  }, []);

  const columns = useMemo<ColumnDef<PurchaseContractDetailResponse>[]>(
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
        header: intl.formatMessage({ id: 'code_contract' }),
        accessorKey: 'code',
        cell: ({ row }) => {
          const code = row?.original?.code;
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <TableCell sx={{ borderBottom: 'none' }}>{code}</TableCell>
              {code && (
                <Tooltip title="Sao chép" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const success = await copyToClipboard(code);
                      if (success) {
                        toast.success('Đã sao chép');
                      } else {
                        toast.error('Sao chép thất bại');
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
        header: 'Số hợp đồng',
        accessorKey: 'contractNumber',
        cell: ({ row }) => {
          const contractNumber = row?.original?.contractNumber;
          return (
            <Stack width={200} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <TableCell sx={{ borderBottom: 'none' }}>{contractNumber}</TableCell>
              {contractNumber && (
                <Tooltip title="Sao chép" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const success = await copyToClipboard(contractNumber);
                      if (success) {
                        toast.success('Đã sao chép');
                      } else {
                        toast.error('Sao chép thất bại');
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
        header: intl.formatMessage({ id: 'buyer_name' }),
        accessorKey: 'buyerName'
      },
      {
        header: intl.formatMessage({ id: 'date_signed_contract' }),
        accessorKey: 'contractDate',
        cell: ({ cell }) =>
          moment(cell.getValue() as string).isValid()
            ? moment(cell.getValue() as string).format('DD/MM/YYYY')
            : intl.formatMessage({ id: 'no_identify' })
      },
      {
        header: 'Tổng khối lượng (Tấn)',
        accessorKey: 'purchaseContractPackingPlan',
        cell: ({ cell }) => {
          const value = cell.getValue() as PurchaseContractDetailResponse['purchaseContractPackingPlan'];
          if (!value || !value.purchaseContractPackingPlanGoodSuppliers) {
            return '---';
          }
          const totalQuantity = value.purchaseContractPackingPlanGoodSuppliers.reduce((sum, item) => sum + (item.quantity || 0), 0);

          return numberHelper.formatNumber(unitHelper.fromKgToTon(totalQuantity));
        }
      },
      {
        header: intl.formatMessage({ id: 'total_money' }),
        accessorKey: 'purchaseContractPackingPlan',
        cell: ({ cell }) => {
          const value = cell.getValue() as PurchaseContractDetailResponse['purchaseContractPackingPlan'];
          if (!value || !value.purchaseContractPackingPlanGoodSuppliers) {
            return '---';
          }
          const totalMoney = value.purchaseContractPackingPlanGoodSuppliers.reduce(
            (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
            0
          );

          return numberHelper.formatCurrency(totalMoney, {
            currency: 'VND'
          });
        }
      },
      {
        header: intl.formatMessage({ id: 'status_label' }),
        accessorKey: 'status',
        cell: (cell) => {
          const value = cell.getValue() as CommonStatus;
          return <Chip label={getStatusText(value)} color={getStatusColor(value)} size="small" />;
        }
      },
      {
        header: intl.formatMessage({ id: 'action' }),
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              {/* View button - available for all roles */}
              <PermissionGuard permission="PURCHASE_ORDER_VIEW">
                <CustomIconButton
                  tooltip={intl.formatMessage({ id: 'preview_label' })}
                  color="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(routing.contractPurchase.detail(row.original.id));
                  }}
                  icon={<EyeOutlined />}
                />
              </PermissionGuard>

              {/* Edit button - only for Domestic and Manager */}
              <PermissionGuard permission="PURCHASE_ORDER_UPDATE">
                <Tooltip title="Chỉnh sửa">
                  <IconButton
                    color="primary"
                    disabled={[CommonStatus.Inactive, CommonStatus.RequestApproval].includes(row.original.status)}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(routing.contractPurchase.edit(row.original.id));
                    }}
                  >
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
              </PermissionGuard>

              {/* Delete button - only for Manager */}
              <PermissionGuard permission="PURCHASE_ORDER_DELETE">
                <CustomIconButton
                  tooltip={intl.formatMessage({ id: 'delete_label' })}
                  color="error"
                  disabled={row.original.status === CommonStatus.Inactive}
                  onClick={(e) => {
                    e.stopPropagation();
                    setContractId(row.original.code);
                    setDeleteId(row.original.id);
                    alertOpen.onTrue();
                  }}
                  icon={<DeleteOutlined />}
                />
              </PermissionGuard>
            </Stack>
          );
        }
      }
    ],
    []
  );
  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    { title: '4. PO mua', to: routing.contractPurchase.list },
    { title: 'Danh sách' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="Danh sách" links={breadcrumbLinks} translate={false} />

      <Grid container spacing={2}>
        <Grid size={12}>
          {loading.value ? (
            <EmptyReactTable />
          ) : (
            <ReactTable
              {...{
                data: contracts?.data || [],
                columns,
                totalPage: contracts?.meta?.totalPages || 0,
                counts: contracts?.meta?.count || {},
                onCallData: async (
                  page: number,
                  size: number,
                  search: string = '',
                  sort: string = '',
                  sortDirection: any,
                  status?: number
                ) => {
                  pageRef.current = page;
                  await fetchGetListPurchaseContract(page, size, search, sort, sortDirection ? 'desc' : 'asc', status);
                }
              }}
            />
          )}
          <AlertColumnDelete
            title={intl.formatMessage({ id: 'contract_label' }, { value: contractId })}
            open={alertOpen.value}
            handleClose={alertOpen.onFalse}
            handleDelete={() => fetchDeleteContract()}
          />
        </Grid>
      </Grid>
    </>
  );
}
