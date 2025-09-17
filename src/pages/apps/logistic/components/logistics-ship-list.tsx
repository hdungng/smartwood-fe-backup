import moment from 'moment';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import axiosServices from 'utils/axios';

import AlertColumnDelete from 'components/AlertColumnDelete';
// @components
import { Box, Button, Chip, CircularProgress, Divider, IconButton, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  ColumnDef,
  ExpandedState,
  HeaderGroup,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import ScrollX from 'components/ScrollX';
import { DebouncedInput, HeaderSort, TablePagination } from 'components/third-party/react-table';

// @constants
import { PURCHASE_CONTRACT_SHIPPING_SCHEDULE } from 'api/constants';
import { LIST_STATUS, PAGE_LIMIT, PAGE_SIZE, TYPE_ASC_DESC } from '../../../../constants';

// @assets
import { RightOutlined as CollapseIcon, DeleteOutlined as DeleteIcon, EditOutlined as EditIcon, DownOutlined as ExpandIcon, SearchOutlined as SearchIcon } from '@ant-design/icons';

// @types
import { IShippingPurchaseContract } from 'types/logistcs';

// @utils
import { CODE_DESTINATION, CODE_EXPORT_PORT, CODE_QUALITY_TYPE, CODE_REGION } from 'constants/code';
import { useConfiguration } from 'hooks';
import { useGlobal } from 'contexts';
import { CommonStatus, formatNumber, getStatusColor } from 'utils';

interface LogisticsShippingListProps {
  purchaseContractId?: number | undefined;
  onEditItem?: (id: string, saleContractId: string) => void;
}

export type TLogisticsShippingList = {
  callGetListShippingList: () => void;
};

export const LogisticsShippingList = forwardRef<TLogisticsShippingList, LogisticsShippingListProps>(({ purchaseContractId, onEditItem }, ref) => {
  const intl = useIntl();
  const navigation = useNavigate();
  const { mapConfigObject } = useConfiguration();
  const { getGoodNameById } = useGlobal();
  const [deleteItem, setDeleteItem] = useState<IShippingPurchaseContract>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(LIST_STATUS[0].id);
  const [globalFilter, setGlobalFilter] = useState('');
  const [codeBookingFilter, setCodeBookingFilter] = useState('');
  const [list, setList] = useState<IShippingPurchaseContract[]>([]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: '',
      desc: false
    }
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});

  useImperativeHandle(ref, () => ({
    callGetListShippingList() {
      getListShippingList(
        pagination.pageIndex,
        pagination.pageSize,
        globalFilter,
        sorting[0]?.id,
        sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
        activeTab === 100 ? '' : activeTab
      );
    }
  }));

  useEffect(() => {
    getListShippingList(
      pagination.pageIndex,
      pagination.pageSize,
      globalFilter,
      sorting[0]?.id,
      sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
      activeTab === 100 ? '' : activeTab
    );
  }, [sorting[0]?.id, sorting[0]?.desc, pagination.pageIndex, pagination.pageSize, purchaseContractId, codeBookingFilter]);

  const getListShippingList = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    key_search: string = '',
    key_sort: string = '',
    key_sort_direction: string = '',
    key_status: number | ''
  ) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', (page + 1).toString());
      queryParams.append('size', size.toString());
      if (key_status) {
        queryParams.append('status', key_status.toString());
      }
      else {
        queryParams.append('status', '1');
      }
      if  (key_sort) {
        queryParams.append('sortBy', key_sort);
      }
      if  (key_sort_direction) {
        queryParams.append('SortDirection', key_sort_direction);
      }
      if (purchaseContractId != undefined || purchaseContractId != 0) {
        queryParams.append('PurchaseContractId', purchaseContractId?.toString() || '');
      }
      
      // Add codeBooking filter if provided
      if (codeBookingFilter.trim()) {
        queryParams.append('codebooking', codeBookingFilter.trim());
      }

      const { data, status } = await axiosServices.get(
        PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON + `/page?${queryParams.toString()}`
      );
      
      if (status === 200 || status === 201) {
        setTotalPage(data.meta.totalPages || 0);
        setList(data.data);
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeBookingSearch = useCallback((value: string | number) => {
    setCodeBookingFilter(String(value));
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setCodeBookingFilter('');
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const fetchDeleteContractDeletShippingSchedule = async () => {
    if (!deleteItem?.id) return;
    try {
      const response = await axiosServices.delete(PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON + `/${deleteItem?.id}`);
      if (response.status === 200 || response.status === 204) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_delete_success_text' }), {
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        getListShippingList(
          pagination.pageIndex,
          pagination.pageSize,
          globalFilter,
          sorting[0]?.id,
          sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
          activeTab === 100 ? '' : activeTab
        );
        setAlertOpen(false);
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const getStatusText = useCallback((status: any) => {
    switch (status) {
      case 0:
        return intl.formatMessage({ id: 'inactive_label' });
      case 1:
        return intl.formatMessage({ id: 'active_label' });
      case 2:
        return intl.formatMessage({ id: 'pending_label' });
      case 3:
        return intl.formatMessage({ id: 'approval_label' });
      default:
        return '---';
    }
  }, []);

  const columns = useMemo<ColumnDef<IShippingPurchaseContract>[]>(
    () => [
      {
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton
              size="small"
              onClick={() => row.toggleExpanded()}
              sx={{ p: 0 }}
            >
              {row.getIsExpanded() ? <ExpandIcon /> : <CollapseIcon />}
            </IconButton>
          ) : null;
        },
        meta: {
          className: 'cell-center',
          width: 50
        }
      },
      {
        id: 'codeBooking',
        header: intl.formatMessage({ id: 'code_booking' }),
        accessorKey: 'codeBooking',
        width: 200
      },
      {
        id: 'shipName',
        header: intl.formatMessage({ id: 'shipName' }),
        accessorKey: 'shipName'
      },
      {
        id: 'etdDate',
        header: intl.formatMessage({ id: 'etd_shipping_date' }),
        accessorKey: 'etdDate',
        cell: (cell) => moment(cell.getValue() as string).format('DD/MM/YYYY HH:mm')
      },
      {
        id: 'etaDate',
        header: intl.formatMessage({ id: 'eta_shipping_date' }),
        accessorKey: 'etaDate',
        cell: (cell) => moment(cell.getValue() as string).format('DD/MM/YYYY HH:mm')
      },
      {
        id: 'containerQuantity',
        header: intl.formatMessage({ id: 'number_of_cont' }),
        accessorKey: 'containerQuantity',
        cell: (cell) => formatNumber(cell.getValue())
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
        id: 'actions',
        header: intl.formatMessage({ id: 'action_label' }),
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
              {row.original.status !== 0 && (
                <Tooltip title={intl.formatMessage({ id: 'edit_label' })}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      if (onEditItem) {
                        onEditItem(row.original.id.toString(), row.original.saleContractId.toString());
                      } else {
                        navigation(`/logistics/ship-edit/${row.original.id}`, { state: { code: row.original.code } });
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {row.original.status !== 0 && (
                <Tooltip title={intl.formatMessage({ id: 'delete_label' })}>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      setDeleteItem(row.original);
                      setAlertOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data: list,
    columns,
    state: {
      sorting,
      pagination,
      expanded
    },
    manualPagination: true,
    pageCount: totalPage,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange: setPagination,
  });

  const renderExpandedContent = (row: any) => {
    const data = row.original;
    return (
      <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
        {/* Contract Information Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            {intl.formatMessage({ id: 'contract_information' }) || 'Thông tin hợp đồng'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'booking_number' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {data.bookingNumber}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'quality_type', defaultMessage: 'Quality Type' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {mapConfigObject(CODE_QUALITY_TYPE, data.goodType)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'product_name_label', defaultMessage: 'Product Name' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {getGoodNameById(data.goodId)}
              </Typography>
            </Box>
            {/* <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'available_container_quantity', defaultMessage: 'Available Container Quantity' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {formatNumber(data.availableContainerQuantity)}
              </Typography>
            </Box> */}
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'number_of_cont', defaultMessage: 'Number of Cont' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {formatNumber(data.containerQuantity)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Ship Details Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            {intl.formatMessage({ id: 'ship_details' }) || 'Chi tiết tàu'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'forwarderName' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {data.forwarderName}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'shippingLine' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {data.shippingLine}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'region_logistic' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {mapConfigObject(CODE_REGION, data.region)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'export_port' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {mapConfigObject(CODE_EXPORT_PORT, data.exportPort)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'import_port' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {mapConfigObject(CODE_DESTINATION, data.importPort)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'firstContainerDropDate' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {moment(data.firstContainerDropDate).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: 'cutoffDate' })}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {moment(data.cutoffDate).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Notes Section */}
        {data.notes && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
              {intl.formatMessage({ id: 'notes' }) || 'Ghi chú'}
            </Typography>
            <Typography variant="body2" sx={{ backgroundColor: 'white', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
              {data.notes}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {intl.formatMessage({ id: 'list_of_shipping' })}
      </Typography>
      
      {/* Search Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 300, flexGrow: 1 }}>
            <InputLabel sx={{ fontWeight: 500, mb: 1 }}>
              {intl.formatMessage({ id: 'search_by_booking_code' }) || 'Tìm kiếm theo mã booking'}
            </InputLabel>
            <DebouncedInput
              value={codeBookingFilter}
              onFilterChange={handleCodeBookingSearch}
              placeholder={intl.formatMessage({ id: 'enter_booking_code' }) || 'Nhập mã booking...'}
              startAdornment={<SearchIcon style={{ color: 'grey.500', marginRight: 8 }} />}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }
              }}
            />
          </Box>
          {codeBookingFilter && (
            <Button
              variant="outlined"
              size="medium"
              onClick={handleClearSearch}
              sx={{ 
                borderRadius: 2,
                borderColor: 'grey.400',
                color: 'grey.600',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'grey.50'
                }
              }}
            >
              {intl.formatMessage({ id: 'clear_search' }) || 'Xóa tìm kiếm'}
            </Button>
          )}
        </Box>
      </Paper>
      
      <ScrollX>
        {list.length > 0 ? (
          <>
            <TableContainer component={Paper}>
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
                      <>
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {row.getIsExpanded() && (
                          <TableRow>
                            <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 0 }}>
                              {renderExpandedContent(row)}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </>
        ) : (
          !loading && (
            <>
              <TableContainer component={Paper}>
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
                </Table>
              </TableContainer>
              <Box py={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                  {intl.formatMessage({ id: 'no_data_found' })}
                </Typography>
              </Box>
            </>
          )
        )}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 504 }}>
            <CircularProgress size={50} />
          </div>
        )}
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
        <AlertColumnDelete
          title={`#${deleteItem?.code}`}
          open={alertOpen}
          handleClose={() => setAlertOpen(false)}
          handleDelete={() => fetchDeleteContractDeletShippingSchedule()}
        />
      </ScrollX>
    </>
  );
});