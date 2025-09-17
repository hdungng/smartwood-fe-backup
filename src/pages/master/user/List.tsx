import { useCallback, useMemo, useState } from 'react';

import AlertUserDelete from 'sections/apps/user/AlertUserDelete';
import UserTable from 'sections/apps/user/UserTable';

import { openSnackbar } from 'api/snackbar';
import useUser from 'api/user';
import EmptyReactTable from 'pages/tables/react-table/empty';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { UserParams } from 'types/user.type';
import { getUserColumns } from './UserColumns';

// ==============================|| USERS LIST ||============================== //

export default function UserListPage() {
  const navigate = useNavigate();

  // ==============================|| USERS FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserParams>({
    search: '',
    status: undefined,
    roleId: undefined,
    name: undefined,
    email: undefined,
    username: undefined,
    language: undefined,
    password: undefined
  });

  // ==============================|| GET LIST USERS ||============================== //
  const { list } = useUser();
  const {
    usersLoading,
    users: lists = [],
    usersError,
    refetch
  } = list({
    search,
    ...filters
  });

  // console.log('🚀 ~ UserListPage ~ lists:', lists);
  // console.log('🚀 ~ UserListPage ~ filters:', filters);
  // ==============================|| DELETE USER MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [userDeleteId, setUserDeleteId] = useState<number | null>(null);

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);

  const handleDeleteUser = useCallback((userId: number) => {
    setOpen(true);
    setUserDeleteId(userId);
  }, []);

  const handleUserAction = useCallback(
    (action: 'create' | 'view' | 'edit', userId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/user/create');
            break;
          case 'view':
          case 'edit':
            if (!userId || userId <= 0) {
              throw new Error('Invalid user ID');
            }
            navigate(`/master/user/${action}/${userId}`);
            break;
          default:
            throw new Error('Invalid action');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        openSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Navigation failed',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      }
    },
    [navigate]
  );

  // ==============================|| USER TABLE COLUMNS ||============================== //
  const columns = useMemo(() => getUserColumns(handleUserAction, handleDeleteUser), [handleUserAction, handleDeleteUser]);

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        name: undefined,
        email: undefined,
        username: undefined,
        status: undefined,
        roleId: undefined,
        language: undefined
      };

      // Apply new filter values
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;

        switch (key) {
          case 'name':
            newFilters.name = String(value).trim() as any;
            break;
          case 'email':
            newFilters.email = String(value).trim() as any;
            break;
          case 'username':
            newFilters.username = String(value).trim() as any;
            break;
          case 'language':
            newFilters.language = String(value).trim() as any;
            break;
          case 'status':
            const statusValue = Number(value);
            if (!isNaN(statusValue)) {
              newFilters.status = statusValue as any;
            }
            break;
          case 'role':
            const roleValue = Number(value);
            if (!isNaN(roleValue) && roleValue > 0) {
              newFilters.roleId = roleValue as any;
            }
            break;
        }
      });

      return newFilters;
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  // ==============================|| MEMOIZED FILTER PROPS ||============================== //
  const filterProps = useMemo(
    () => ({
      search,
      onSearchChange: handleSearchChange,
      onFilterChange: handleFilterChange
    }),
    [search, handleSearchChange, handleFilterChange]
  );

  // ==============================|| ERROR HANDLING ||============================== //
  if (usersError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <UserTable data={lists} columns={columns} filters={filterProps} loading={usersLoading} onRefresh={refetch} />
      <AlertUserDelete id={userDeleteId ?? 0} title={userDeleteId?.toString() || ''} open={open} handleClose={handleClose} />
    </>
  );
}
