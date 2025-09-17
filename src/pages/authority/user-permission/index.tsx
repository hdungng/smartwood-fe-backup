import Stack from '@mui/material/Stack';
import {
  Box,
  Button,
  ListItemText,
  Table,
  Divider,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { CustomIconButton } from 'components/buttons';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderGroup,
  PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { authorityService, ListUserPermissionResponse } from 'services/authority';
import { PAGE_LIMIT, PAGE_SIZE } from '../../../constants';
import { HeaderSort, TablePagination } from 'components/third-party/react-table';
import { numberHelper } from 'utils';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { routing } from 'routes/routing';
import MainCard from 'components/MainCard';
import { useDialog } from 'hooks';
import { ManageUserPermissionDialog } from 'dialogs';

const UserPermission = () => {
  const dialog = useDialog();
  const [users, setUsers] = useState<ListUserPermissionResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });

  const handleFetchUserRoles = async () => {
    const response = await authorityService.listUserPermission();
    setUsers(response.data || []);
  };

  useEffect(() => {
    handleFetchUserRoles();
  }, []);

  const handleOpenManageUserManageDialog = async (userPermission?: ListUserPermissionResponse) => {
    const result = await dialog.show(ManageUserPermissionDialog, {
      userPermission
    });

    if (result?.success) {
      await handleFetchUserRoles();
    }
  };

  const columns = useMemo<ColumnDef<ListUserPermissionResponse>[]>(
    () => [
      {
        id: 'user-info',
        header: 'Người dùng',
        cell: ({ row }) => {
          const { email, name } = row.original;
          return (
            <ListItemText
              primary={<Typography>{name}</Typography>}
              secondary={email}
              slotProps={{
                secondary: {
                  component: 'span',
                  color: 'text.secondary'
                }
              }}
            />
          );
        }
      },
      {
        id: 'numberOfRole',
        header: 'Số vai trò',
        cell: ({ row }) => <>{numberHelper.formatNumber(row?.original?.roleIds?.length)}</>
      },
      {
        id: 'numberOfRegion',
        header: 'Số khu vực',
        cell: ({ row }) => <>{numberHelper.formatNumber(row?.original?.regions?.length)}</>
      },
      {
        id: 'actions',
        header: 'Hành động',
        meta: {
          className: 'cell-center',
          style: { minWidth: 120, maxWidth: 120 }
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <CustomIconButton
              tooltip="Chỉnh sửa"
              color="info"
              onClick={async (event) => {
                event.stopPropagation();
                await handleOpenManageUserManageDialog(row.original);
              }}
              icon={<EditOutlined />}
            />
          );
        }
      }
    ],
    [handleOpenManageUserManageDialog]
  );

  const table = useReactTable({
    data: users || [],
    columns,
    state: {
      pagination
    },
    manualPagination: true,
    pageCount: Math.ceil((users?.length || 0) / pagination.pageSize),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  });

  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    { title: 'Phân quyền', disabled: true },
    { title: 'Phân quyền người dùng' }
  ];

  return (
    <Box>
      <Breadcrumbs custom heading="Phân quyền người dùng" links={breadcrumbLinks} translate={false} />

      <MainCard title="Phân quyền người dùng">
        <Stack spacing={2}>
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
                        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
        </Stack>
      </MainCard>
    </Box>
  );
};

export default UserPermission;
