import { useCallback, useMemo, useState } from 'react';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import CustomerTable from 'sections/apps/customer/CustomerTable';

import { openSnackbar } from 'api/snackbar';
import useCustomer from 'api/customer';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { CustomerParams, TCustomer } from 'types/customer';
import { getCustomerColumns } from './CustomerColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertCustomerDeactivate from 'sections/apps/customer/AlertCustomerDeactivate';
import AlertCustomerActivate from 'sections/apps/customer/AlertCustomerActivate';
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| CUSTOMERS LIST ||============================== //

export default function CustomerListPage() {
  const navigate = useNavigate();

  // ==============================|| CUSTOMERS FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<CustomerParams>({
    // search: '',
    status: undefined,
    name: undefined,
    code: undefined,
    represented: undefined,
    phone: undefined,
    email: undefined,
    address: undefined,
    fax: undefined,
    taxCode: undefined
  });

  // ==============================|| GET LIST CUSTOMERS ||============================== //
  const { list } = useCustomer();
  const {
    customersLoading,
    customers: lists = [],
    customersError,
    refetch
  } = list({
    search,
    ...filters
  });

  // ==============================|| DEACTIVATE CUSTOMER MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [customerDeactivateId, setCustomerDeactivateId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string>('');

  // ==============================|| ACTIVATE CUSTOMER MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [customerActivateId, setCustomerActivateId] = useState<number | null>(null);
  const [activateCustomerName, setActivateCustomerName] = useState<string>('');

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleActivateClose = useCallback(() => setActivateOpen((prev) => !prev), []);

  const handleDeactivateCustomer = useCallback(
    (customerId: number) => {
      const customer = lists.find((c) => c.id === customerId);
      setOpen(true);
      setCustomerDeactivateId(customerId);
      setCustomerName(customer?.name || '');
    },
    [lists]
  );

  const handleActivateCustomer = useCallback(
    (customerId: number) => {
      const customer = lists.find((c) => c.id === customerId);
      setActivateOpen(true);
      setCustomerActivateId(customerId);
      setActivateCustomerName(customer?.name || '');
    },
    [lists]
  );

  const handleCustomerAction = useCallback(
    (action: 'create' | 'view' | 'edit', customerId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/customer/create');
            break;
          case 'view':
          case 'edit':
            if (!customerId || customerId <= 0) {
              throw new Error('Invalid customer ID');
            }
            navigate(`/master/customer/${action}/${customerId}`);
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

  // ==============================|| CUSTOMER TABLE COLUMNS ||============================== //
  const columns = useMemo(
    () => getCustomerColumns(handleCustomerAction, handleDeactivateCustomer, handleActivateCustomer),
    [handleCustomerAction, handleDeactivateCustomer, handleActivateCustomer]
  );

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        name: undefined,
        code: undefined,
        represented: undefined,
        phone: undefined,
        email: undefined,
        address: undefined,
        fax: undefined,
        taxCode: undefined,
        status: undefined
      };

      // Apply new filter values
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;

        switch (key) {
          case 'name':
            newFilters.name = String(value).trim() as any;
            break;
          case 'code':
            newFilters.code = String(value).trim() as any;
            break;
          case 'represented':
            newFilters.represented = String(value).trim() as any;
            break;
          case 'phone':
            newFilters.phone = String(value).trim() as any;
            break;
          case 'email':
            newFilters.email = String(value).trim() as any;
            break;
          case 'address':
            newFilters.address = String(value).trim() as any;
            break;
          case 'fax':
            newFilters.fax = String(value).trim() as any;
            break;
          case 'taxCode':
            newFilters.taxCode = String(value).trim() as any;
            break;
          case 'status':
            const statusValue = Number(value);
            if (!isNaN(statusValue)) {
              newFilters.status = statusValue as any;
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

  const handleDeactivateSuccess = useCallback(() => {
    // No need to refetch - API already updates local state via SWR mutate
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
  if (customersError) {
    return <EmptyReactTable />;
  }
const breadcrumbLinks = [
    { title: 'Trang chủ', to: APP_DEFAULT_PATH },
    { title: 'Quản lý khách hàng', to: '/master/customer' },
    { title: 'Danh sách' }
    
  ];
  // ==============================|| RENDER ||============================== //
  return (
    <>
    <Breadcrumbs custom heading={`Danh sách`} links={breadcrumbLinks} />
      <CustomerTable data={lists} columns={columns} filters={filterProps} loading={customersLoading} onRefresh={refetch} />
      <AlertCustomerDeactivate
        id={customerDeactivateId ?? 0}
        title={customerName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={() => {}}
      />
      <AlertCustomerActivate
        id={customerActivateId ?? 0}
        title={activateCustomerName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={() => {}}
      />
    </>
  );
}
