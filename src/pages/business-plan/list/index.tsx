import { ChangeEvent, Fragment, useEffect, useMemo, useState } from 'react';

import AlertColumnDelete from 'components/AlertColumnDelete';
// material-ui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderGroup,
  PaginationState,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { openSnackbar } from 'api/snackbar';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination
} from 'components/third-party/react-table';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

import { CODE_QUALITY_TYPE, CODE_REGION, CODE_UNIT_OF_MEASURE } from 'constants/code';
import { useGlobal } from 'contexts/GlobalContext';
import { useRole } from 'contexts/RoleContext';
import { useBoolean, useConfiguration, useRouter } from 'hooks';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionDeleteBusinessPlanByID,
  actionFetchBusinessPlan,
  BusinessPlan,
  businessPlanSelector,
  BusinessPlanSupplierItem,
  TBusinessPlanState
} from 'redux/BusinessPLan';
import { BusinessPlanStatus } from 'redux/BusinessPLan/constant';
import { routing } from 'routes/routing';
import { TGood } from 'types/good';
import { numberHelper } from 'utils';
import { copyToClipboard } from 'utils/clipboard';
import { PAGE_LIMIT, PAGE_SIZE } from '../../../constants';
import { PermissionGuard } from 'components/guards';
import { CustomIconButton } from 'components/buttons';

type TBusinessPlanStatusFormat = {
  key: string;
  label: string;
  color: 'primary' | 'error' | 'default' | 'secondary' | 'info' | 'success' | 'warning';
  value?: number;
};

const goodFormat = (
  goods: TGood[]
): Record<
  string,
  {
    name: string;
    color: 'success' | 'warning' | 'primary';
  }
> => {
  let result: any = {};
  goods.forEach((good) => {
    let color = 'primary';
    if (good.name.includes('Viên nén')) {
      color = 'success';
    } else if (good.name.includes('Mùn cưa')) {
      color = 'warning';
    } else {
      color = 'primary';
    }

    result[`${good.id}`] = {
      name: good.name,
      color
    };
  });
  return result;
};

function calSumPrice(businessPlanSupplierItems: BusinessPlanSupplierItem[]) {
  return businessPlanSupplierItems.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.purchasePrice * currentValue.quantity;
  }, 0);
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

// ==============================|| CONTRACT LIST ||============================== //

const BusinessPlanList = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const router = useRouter();
  const { mapConfigObject } = useConfiguration();
  const { hasPermission } = useRole();

  const { businessPlans: data, meta }: TBusinessPlanState = useSelector(businessPlanSelector);

  const businessPlanStatusFormat: Record<string, TBusinessPlanStatusFormat> = useMemo(
    () => ({
      [`${BusinessPlanStatus.REQUESTAPPROVE}`]: {
        color: 'warning',
        label: intl.formatMessage({ id: 'business_plan_pending' }),
        key: BusinessPlanStatus[BusinessPlanStatus.REQUESTAPPROVE].toString().toLowerCase()
      },
      [`${BusinessPlanStatus.APPROVED}`]: {
        color: 'info',
        label: 'Đã duyệt',
        key: BusinessPlanStatus[BusinessPlanStatus.APPROVED].toString().toLowerCase()
      },
      [`${BusinessPlanStatus.INACTIVE}`]: {
        color: 'secondary',
        label: 'Không hoạt động',
        key: BusinessPlanStatus[BusinessPlanStatus.INACTIVE].toString().toLowerCase()
      },
      [`${BusinessPlanStatus.ACTIVE}`]: {
        color: 'success',
        label: 'Hoạt động',
        key: BusinessPlanStatus[BusinessPlanStatus.ACTIVE].toString().toLowerCase()
      },
      [`${BusinessPlanStatus.REJECTED}`]: {
        color: 'error',
        label: intl.formatMessage({ id: 'business_plan_rejected' }),
        key: BusinessPlanStatus[BusinessPlanStatus.REJECTED].toString().toLowerCase()
      }
    }),
    [intl]
  );

  const groups = useMemo(() => {
    const result: TBusinessPlanStatusFormat[] = [
      {
        label: intl.formatMessage({ id: 'business_plan_all' }),
        color: 'primary',
        key: 'all'
      }
    ];

    const formatters = Object.keys(businessPlanStatusFormat).map((x) => businessPlanStatusFormat[x]);

    for (const metaCount of Object.keys(meta.count || {})) {
      const statusCount = meta.count[metaCount];
      const statusFormat = metaCount.replace('Count', '').toLowerCase();
      const formatter = formatters.find((x) => x.key === statusFormat);

      if (formatter) {
        result[0] = {
          ...result[0],
          value: (result[0]?.value ?? 0) + statusCount
        };

        result.push({
          ...formatter,
          value: statusCount
        });
      }
    }

    return result;
  }, [businessPlanStatusFormat, meta, intl]);

  const [selectedBusinessPlan, setSelectedBusinessPlan] = useState<BusinessPlan | undefined>(undefined);
  const alertOpen = useBoolean();
  const [activeTab, setActiveTab] = useState(groups[0].key);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const global = useGlobal(); // lay bien global context
  const { goods, getGoodNameById } = global;
  const goodFormatData = goodFormat(goods);

  const handleFetchBusinessPlan = () => {
    dispatch(
      actionFetchBusinessPlan({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        ...(sorting?.[0]?.id && {
          sortKey: sorting[0].id,
          direction: sorting[0].desc ? 'desc' : 'asc'
        }),
        ...(search && {
          code: search
        }),
        ...(activeTab !== 'all' && {
          Status: BusinessPlanStatus[activeTab.toUpperCase() as keyof typeof BusinessPlanStatus]
        })
      })
    );
  };

  useEffect(() => {
    handleFetchBusinessPlan();
  }, [pagination.pageIndex, pagination.pageSize, sorting, search, columnFilters, activeTab, dispatch]);

  const handleClose = (status: boolean) => {
    if (status) {
      // Here you would delete the business plan
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'business_plan_delete_success' }),
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }

    alertOpen.onFalse();
  };

  const onDeleteBusinessPlan = () => {
    if (!selectedBusinessPlan?.id) return;

    dispatch(actionDeleteBusinessPlanByID(Number(selectedBusinessPlan!.id)));

    setTimeout(() => {
      handleFetchBusinessPlan();
      alertOpen.onFalse();
    }, 500);
  };

  const columns = useMemo<ColumnDef<BusinessPlan>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllPageRowsSelected(),
              indeterminate: table.getIsSomePageRowsSelected(),
              onChange: table.getToggleAllPageRowsSelectedHandler()
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
        ),
        meta: {
          style: { minWidth: 60, maxWidth: 60 }
        }
      },
      {
        id: 'expander',
        header: () => null,
        meta: {
          style: { minWidth: 60, maxWidth: 60 }
        },
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: 'pointer' }
              }}
            >
              {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
            </IconButton>
          ) : null;
        }
      },
      // ================= COLUMN INFO ==========================
      {
        id: 'code',
        header: intl.formatMessage({ id: 'business_plan_code' }),
        accessorKey: 'code',
        cell: ({ row }) => {
          const code = row?.original?.code;
          return (
            <Box sx={{ width: 150, minWidth: 150, maxWidth: 150 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <TruncatedCell value={code} maxLength={15} />
                {code && (
                  <Tooltip title={intl.formatMessage({ id: 'copy_to_clipboard' })} arrow placement="top">
                    <IconButton
                      size="small"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const success = await copyToClipboard(code);
                        if (success) {
                          enqueueSnackbar(intl.formatMessage({ id: 'copied_to_clipboard' }), {
                            variant: 'success',
                            autoHideDuration: 2000,
                            anchorOrigin: { horizontal: 'right', vertical: 'top' }
                          });
                        } else {
                          enqueueSnackbar(intl.formatMessage({ id: 'copy_failed' }), {
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
            </Box>
          );
        }
      },
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'business_plan_customer_name' }),
        accessorKey: 'customerName',
        cell: ({ row }) => {
          // Format customerName giống như trong approval
          const customerName = row?.original?.draftPo?.customerName || row?.original?.customerName || '';
          return (
            <Box sx={{ width: 280, minWidth: 280, maxWidth: 280 }}>
              <TruncatedCell value={customerName} maxLength={35} width={250} />
            </Box>
          );
        }
      },
      {
        id: 'goodName',
        header: intl.formatMessage({ id: 'business_plan_good_name' }),
        accessorKey: 'goodName',
        cell: ({ row }) => {
          // Use global mapping to get good name from goodId if available, otherwise fallback to goodName
          const goodId = row?.original?.businessPlanSupplierItems?.[0]?.goodId;
          const goodName = goodId ? getGoodNameById(goodId) : row?.original?.draftPo?.goodName || row?.original?.goodName || '';
          return (
            <Box sx={{ width: 280, minWidth: 280, maxWidth: 280 }}>
              <TruncatedCell value={goodName} maxLength={35} width={250} />
            </Box>
          );
        }
      },
      {
        id: 'status',
        header: intl.formatMessage({ id: 'business_plan_status' }),
        accessorKey: 'status',
        meta: {
          style: { minWidth: 150 }
        },
        cell: (cell) => {
          const format = businessPlanStatusFormat[`${cell.getValue()}` as keyof typeof businessPlanStatusFormat];
          if (!format) {
            return <Chip color="default" label="Unknown" size="small" variant="filled" />;
          }
          return <Chip color={format.color} label={format.label} size="small" variant="filled" />;
        }
      },
      // ===========================================
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'business_plan_actions' }),
        meta: {
          className: 'cell-center',
          style: { minWidth: 120, maxWidth: 120 }
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const canDelete = row?.original.status === BusinessPlanStatus.INACTIVE || row?.original?.canDelete;

          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <PermissionGuard permission="BUSINESS_PLAN_VIEW">
                <CustomIconButton
                  tooltip="Xem chi tiết"
                  color="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    router.push(routing.businessPlan.detail(row.original.id), {
                      fromUrl: routing.businessPlan.list
                    });
                  }}
                  icon={<EyeOutlined />}
                />
              </PermissionGuard>

              <PermissionGuard permission="BUSINESS_PLAN_DELETE">
                <CustomIconButton
                  tooltip="Xóa"
                  color="error"
                  disabled={!canDelete}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setSelectedBusinessPlan(row?.original);
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
    [router, intl, businessPlanStatusFormat]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      // globalFilter,
      expanded,
      pagination
    },
    enableRowSelection: true,
    enableExpanding: true,
    manualPagination: true,
    pageCount: meta.totalPages,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    // onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  });

  const headers: LabelKeyObject[] = [];
  columns.map(
    (columns) =>
      // @ts-expect-error Type 'string | undefined' is not assignable to type 'string'.
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-expect-error Type 'string | undefined' is not assignable to type 'string'.
        key: columns.accessorKey
      })
  );

  const dataExported = useMemo(() => {
    const convertToRowExport = (row: BusinessPlan) => ({
      ...row,
      status: businessPlanStatusFormat[`${row.status}` as keyof typeof businessPlanStatusFormat]?.label || 'Unknown'
    });

    return data.map((row) => convertToRowExport(row));
  }, [data, businessPlanStatusFormat]);

  return (
    <>
      <Breadcrumbs
        custom
        heading={intl.formatMessage({ id: 'business_plan_list' })}
        links={[
          {
            title: 'home',
            to: '/'
          },
          {
            title: '2. business-plan',
            to: routing.businessPlan.list
          },
          {
            title: 'list'
          }
        ]}
      />
      <Grid container spacing={2}>
        <Grid size={12}>
          <MainCard content={false}>
            <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={(e: ChangeEvent<unknown>, value: string) => {
                  setActiveTab(value);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset pagination when changing tab
                }}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                {groups.map((group, index: number) => (
                  <Tab
                    key={index}
                    label={group.label}
                    value={group.key}
                    icon={<Chip label={group.value ?? 0} color={group.color} variant="light" size="small" />}
                    iconPosition="end"
                  />
                ))}
              </Tabs>
            </Box>
            <Stack
              direction="row"
              sx={{
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2.5
              }}
            >
              <DebouncedInput
                value={search ?? ''}
                onFilterChange={(value) => setSearch(String(value))}
                placeholder="Tìm kiếm theo mã PAKD"
                sx={{
                  minWidth: 300
                }}
              />

              <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                {/*<SelectColumnSorting*/}
                {/*  {...{*/}
                {/*    getState: table.getState,*/}
                {/*    getAllColumns: table.getAllColumns,*/}
                {/*    setSorting*/}
                {/*  }}*/}
                {/*/>*/}
                <CSVExport
                  {...{
                    data: dataExported,
                    headers,
                    filename: 'business-plan-list.csv'
                  }}
                />
              </Stack>
            </Stack>
            <ScrollX>
              <Stack>
                <RowSelection selected={Object.keys(rowSelection).length} />
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
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <Fragment key={row.id}>
                          <TableRow>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                {...cell.column.columnDef.meta}
                                onDoubleClick={() => {
                                  if (cell.column.id === 'select' || row?.original?.status === BusinessPlanStatus.INACTIVE) return;

                                  if (hasPermission(['BUSINESS_PLAN_UPDATE'])) {
                                    router.push(routing.businessPlan.edit(row.original.id), {
                                      fromUrl: routing.businessPlan.list
                                    });
                                  } else if (hasPermission(['BUSINESS_PLAN_VIEW'])) {
                                    router.push(routing.businessPlan.detail(row.original.id), {
                                      fromUrl: routing.businessPlan.list
                                    });
                                  }
                                }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                          {row.getIsExpanded() && (
                            <TableRow>
                              <TableCell colSpan={row.getVisibleCells().length} sx={{ py: 0 }}>
                                <Collapse in={row.getIsExpanded()} timeout="auto" unmountOnExit>
                                  <Box sx={{ margin: 1 }}>
                                    <Typography variant="h6" gutterBottom component="div">
                                      {intl.formatMessage({ id: 'business_plan_product_details' })}
                                    </Typography>
                                    {/* =============== Table for details ======================*/}
                                    <Table size="small" aria-label="product-details" sx={{ tableLayout: 'fixed', width: '100%' }}>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ width: '20%', minWidth: 150 }}>
                                            {intl.formatMessage({ id: 'business_plan_good_name' })}
                                          </TableCell>
                                          <TableCell sx={{ width: '20%', minWidth: 150 }} align="right">
                                            {intl.formatMessage({ id: 'business_plan_quantity' })}
                                          </TableCell>
                                          <TableCell sx={{ width: '20%', minWidth: 150 }} align="right">
                                            {intl.formatMessage({ id: 'business_plan_purchase_price' })}
                                          </TableCell>
                                          <TableCell sx={{ width: '20%', minWidth: 150 }} align="center">
                                            {intl.formatMessage({ id: 'business_plan_region' })}
                                          </TableCell>
                                          <TableCell sx={{ width: '20%', minWidth: 150 }}>Chất lượng</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      {row.original.businessPlanSupplierItems.length > 0 ? (
                                        <TableBody>
                                          {row.original.businessPlanSupplierItems.map((bpPlanSupplierItem: BusinessPlanSupplierItem) => (
                                            <TableRow key={bpPlanSupplierItem.id}>
                                              {/** Tên hàng hóa */}
                                              <TableCell component="th" scope="row" sx={{ width: '20%', minWidth: 150 }}>
                                                <Chip
                                                  label={getGoodNameById(bpPlanSupplierItem.goodId) || bpPlanSupplierItem.goodName || ''}
                                                  color={goodFormatData?.[`${bpPlanSupplierItem.goodId}`]?.color ?? 'primary'}
                                                  size="small"
                                                  variant="filled"
                                                />
                                              </TableCell>

                                              {/** Khối lượng */}
                                              <TableCell sx={{ width: '20%', minWidth: 150 }} align="right">
                                                {numberHelper.formatNumber(bpPlanSupplierItem?.quantity ?? 0)}{' '}
                                                {row.original.draftPo?.unitOfMeasure &&
                                                  mapConfigObject(CODE_UNIT_OF_MEASURE, row.original.draftPo?.unitOfMeasure)}
                                              </TableCell>

                                              {/** Giá mua hàng */}
                                              <TableCell sx={{ width: '20%', minWidth: 150 }} align="right">
                                                {numberHelper.formatCurrency(bpPlanSupplierItem?.purchasePrice, {
                                                  currency: 'VND'
                                                })}
                                              </TableCell>

                                              {/** Khu vực */}
                                              <TableCell sx={{ width: '20%', minWidth: 150 }} align="center">
                                                {bpPlanSupplierItem?.region !== '1' ? (
                                                  <Chip
                                                    label={mapConfigObject(CODE_REGION, bpPlanSupplierItem?.region)}
                                                    size="small"
                                                    variant="outlined"
                                                  />
                                                ) : null}
                                              </TableCell>

                                              {/** Chất lượng */}
                                              <TableCell sx={{ width: '20%', minWidth: 150 }}>
                                                <Chip
                                                  color="info"
                                                  label={mapConfigObject(CODE_QUALITY_TYPE, bpPlanSupplierItem.goodType)}
                                                  size="small"
                                                  variant="light"
                                                />
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                          <TableRow>
                                            <TableCell colSpan={1} sx={{ width: '20%', minWidth: 150 }}>
                                              <Typography variant="subtitle1" fontWeight="bold">
                                                {intl.formatMessage({ id: 'business_plan_total' })}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '20%', minWidth: 150 }} align="right">
                                              <Typography variant="subtitle1" fontWeight="bold">
                                                {numberHelper.formatNumber(
                                                  row.original.businessPlanSupplierItems.reduce((accumulator, currentValue) => {
                                                    return accumulator + currentValue.quantity;
                                                  }, 0)
                                                )}{' '}
                                                {row.original.draftPo?.unitOfMeasure &&
                                                  mapConfigObject(CODE_UNIT_OF_MEASURE, row.original.draftPo?.unitOfMeasure)}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '20%', minWidth: 150 }} align="right">
                                              <Typography variant="subtitle1" fontWeight="bold">
                                                {numberHelper.formatCurrency(
                                                  row.original.businessPlanSupplierItems.reduce((accumulator, currentValue) => {
                                                    return accumulator + currentValue.purchasePrice;
                                                  }, 0),
                                                  {
                                                    currency: 'VND'
                                                  }
                                                )}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '20%', minWidth: 150 }} align="left">
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  alignItems: 'flex-end'
                                                }}
                                              >
                                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                                  {intl.formatMessage({ id: 'business_plan_total_price' })}{' '}
                                                  {numberHelper.formatCurrency(calSumPrice(row.original.businessPlanSupplierItems), {
                                                    currency: 'VND'
                                                  })}
                                                </Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell sx={{ width: '20%', minWidth: 150 }} />
                                          </TableRow>
                                        </TableBody>
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={6} align="center" sx={{ padding: 4 }}>
                                            <Typography variant="body1">Không có dữ liệu</Typography>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </Table>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <TablePagination
                      {...{
                        setPageSize: table.setPageSize,
                        setPageIndex: table.setPageIndex,
                        getState: table.getState,
                        getPageCount: table.getPageCount
                      }}
                    />
                  </Box>
                </>
              </Stack>
            </ScrollX>
          </MainCard>
          <AlertColumnDelete
            message={
              <Stack spacing={1}>
                <Typography align="center" variant="h4">
                  Bạn có chắc chắn muốn xoá?
                </Typography>
                <Typography align="center" component="span">
                  Mã PAKD: <strong>#{selectedBusinessPlan?.code}</strong>
                </Typography>
                <Typography align="center">Sau khi xoá thì phương án kinh doanh sẽ không thể khôi phục.</Typography>
              </Stack>
            }
            open={alertOpen.value}
            handleClose={handleClose}
            handleDelete={onDeleteBusinessPlan}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default BusinessPlanList;
