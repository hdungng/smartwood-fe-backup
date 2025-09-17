import { Fragment, useEffect, useMemo, useState } from 'react';
import { authorityService, ListRoleResponse } from 'services/authority';
import { useDialog } from 'hooks';
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
import { PAGE_LIMIT, PAGE_SIZE } from '../../../constants';
import { ManageInfoRoleDialog, AssignPermissionForRoleDialog } from './dialogs';
import { numberHelper } from 'utils';
import Stack from '@mui/material/Stack';
import { PermissionGuard } from 'components/guards';
import { CustomButton, CustomIconButton } from 'components/buttons';
import { EditOutlined, PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { HeaderSort, TablePagination } from 'components/third-party/react-table';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { routing } from 'routes/routing';
import { useToast } from 'contexts';

const Role = () => {
  const toast = useToast();
  const [roles, setRoles] = useState<ListRoleResponse[]>();
  const dialog = useDialog();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });

  const handleFetchRoles = async () => {
    const response = await authorityService.listRole();
    setRoles(response.data);
  };

  useEffect(() => {
    handleFetchRoles();
  }, []);

  const handleOpenManageInfoRoleDialog = async (role?: ListRoleResponse) => {
    const result = await dialog.show(ManageInfoRoleDialog, {
      role
    });

    if (result?.success) {
      await handleFetchRoles();
    }
  };

  const handleOpenManageAssignPermissionForRoleDialog = async (role: ListRoleResponse) => {
    const result = await dialog.show(AssignPermissionForRoleDialog, {
      role
    });

    if (result?.success) {
      await handleFetchRoles();
    }
  };

  const handleDeleteRole = async (role?: ListRoleResponse) => {
    await dialog.confirm({
      title: 'Xác nhận xóa vai trò',
      slots: {
        content: (
          <Typography textAlign="center">
            Bạn có chắc chắn muốn xóa vai trò <strong>"{role?.name}"</strong> không? Khi vai trò bị xóa, tất cả người dùng được gán vai trò
            này sẽ mất quyền.
          </Typography>
        )
      },
      onAccept: async () => {
        await authorityService.deleteRole(role!.id);

        toast.success('Xóa vai trò thành công');

        await handleFetchRoles();
      }
    });
  };

  const columns = useMemo<ColumnDef<ListRoleResponse>[]>(
    () => [
      {
        id: 'code',
        header: 'Mã vai trò',
        accessorKey: 'code'
      },
      {
        id: 'name',
        header: 'Tên vai trò',
        accessorKey: 'name'
      },
      {
        id: 'description',
        header: 'Mô tả',
        accessorKey: 'description'
      },
      {
        id: 'numberOfPermissions',
        header: 'Số quyền',
        cell: ({ row }) => {
          const numberOfPermissions = row?.original?.permissions?.length || 0;
          return <>{numberHelper.formatNumber(numberOfPermissions)}</>;
        }
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
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <PermissionGuard permission="ROLE_UPDATE">
                <CustomIconButton
                  onClick={async () => {
                    await handleOpenManageAssignPermissionForRoleDialog(row.original);
                  }}
                  icon={<SafetyOutlined />}
                  tooltip="Phân bố quyền"
                  color="success"
                />
              </PermissionGuard>
              <PermissionGuard permission="ROLE_UPDATE">
                <CustomIconButton
                  tooltip="Chỉnh sửa"
                  color="info"
                  onClick={async (event) => {
                    event.stopPropagation();
                    await handleOpenManageInfoRoleDialog(row.original);
                  }}
                  icon={<EditOutlined />}
                />
              </PermissionGuard>
              <PermissionGuard permission="ROLE_DELETE">
                <CustomIconButton
                  tooltip="Xóa"
                  color="error"
                  disabled={['SYSTEM'].includes(row.original.code)}
                  onClick={async (event) => {
                    event.stopPropagation();
                    await handleDeleteRole(row.original);
                  }}
                  icon={<DeleteOutlined />}
                />
              </PermissionGuard>
            </Stack>
          );
        }
      }
    ],
    [handleOpenManageInfoRoleDialog, handleDeleteRole, handleOpenManageAssignPermissionForRoleDialog]
  );

  const table = useReactTable({
    data: roles || [],
    columns,
    state: {
      pagination
    },
    manualPagination: true,
    pageCount: Math.ceil((roles?.length || 0) / pagination.pageSize),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  });

  const breadcrumbLinks = [{ title: 'Trang chủ', to: routing.home }, { title: 'Phân quyền', disabled: true }, { title: 'Vai trò' }];

  return (
    <Box>
      <Breadcrumbs custom heading="Quản lí vai trò" links={breadcrumbLinks} translate={false} />

      <MainCard title="Phân quyền vai trò">
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="end" alignItems="center" mb={3}>
            <PermissionGuard permission="ROLE_CREATE">
              <CustomButton variant="contained" startIcon={<PlusOutlined />} onClick={async () => await handleOpenManageInfoRoleDialog()}>
                Tạo vai trò mới
              </CustomButton>
            </PermissionGuard>
          </Stack>

          <Stack>
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
        </Stack>
      </MainCard>
    </Box>
  );
};

export default Role;
