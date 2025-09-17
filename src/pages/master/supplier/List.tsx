import { useCallback, useMemo, useState } from 'react';

import SupplierTable from 'sections/apps/supplier/SupplierTable';

import { openSnackbar } from 'api/snackbar';
import useSupplier from 'api/supplier';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { SupplierParams, TSupplier } from 'types/supplier';
import { getSupplierColumns } from './SupplierColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertSupplierDeactivate from 'sections/apps/supplier/AlertSupplierDeactivate';
import AlertSupplierActivate from 'sections/apps/supplier/AlertSupplierActivate';

// ==============================|| SUPPLIERS LIST ||============================== //

export default function SupplierListPage() {
  const navigate = useNavigate();
  const intl = useIntl();
  // ==============================|| SUPPLIERS FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SupplierParams>({
    // search: '',
    status: undefined,
    supplierType: undefined,
    name: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    taxCode: undefined,
    website: undefined,
    contactPerson: undefined,
    contactPhone: undefined,
    contactEmail: undefined,
    rating: undefined,
    costSpend: undefined,
    costRemain: undefined,
    region: undefined,
    province: undefined,
    district: undefined
  });

  // ==============================|| GET LIST SUPPLIERS ||============================== //
  const { list } = useSupplier();
  const {
    suppliersLoading,
    suppliers: lists = [],
    suppliersError,
    refetch
  } = list({
    search,
    ...filters
  });

  // ==============================|| DEACTIVATE SUPPLIER MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [supplierDeactivateId, setSupplierDeactivateId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState<string>('');

  // ==============================|| ACTIVATE SUPPLIER MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [supplierActivateId, setSupplierActivateId] = useState<number | null>(null);
  const [activateSupplierName, setActivateSupplierName] = useState<string>('');

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleActivateClose = useCallback(() => setActivateOpen((prev) => !prev), []);

  const handleDeactivateSupplier = useCallback(
    (supplierId: number) => {
      const supplier = lists.find((s) => s.id === supplierId);
      setOpen(true);
      setSupplierDeactivateId(supplierId);
      setSupplierName(supplier?.name || '');
    },
    [lists]
  );

  const handleActivateSupplier = useCallback(
    (supplierId: number) => {
      const supplier = lists.find((s) => s.id === supplierId);
      setActivateOpen(true);
      setSupplierActivateId(supplierId);
      setActivateSupplierName(supplier?.name || '');
    },
    [lists]
  );

  const handleSupplierAction = useCallback(
    (action: 'create' | 'view' | 'edit', supplierId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/supplier/create');
            break;
          case 'view':
          case 'edit':
            if (!supplierId || supplierId <= 0) {
              throw new Error('Invalid supplier ID');
            }
            navigate(`/master/supplier/${action}/${supplierId}`);
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

  // ==============================|| SUPPLIER TABLE COLUMNS ||============================== //
  const columns = useMemo(
    () => getSupplierColumns(handleSupplierAction, handleDeactivateSupplier, handleActivateSupplier),
    [handleSupplierAction, handleDeactivateSupplier, handleActivateSupplier]
  );

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        code: undefined,
        name: undefined,
        email: undefined,
        phone: undefined,
        address: undefined,
        taxCode: undefined,
        website: undefined,
        contactPerson: undefined,
        contactPhone: undefined,
        contactEmail: undefined,
        status: undefined,
        supplierType: undefined,
        rating: undefined,
        costSpend: undefined,
        costRemain: undefined,
        region: undefined,
        province: undefined,
        district: undefined
      };

      // Apply new filter values
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;

        switch (key) {
          case 'code':
            newFilters.code = String(value).trim() as any;
            break;
          case 'name':
            newFilters.name = String(value).trim() as any;
            break;
          case 'email':
            newFilters.email = String(value).trim() as any;
            break;
          case 'phone':
            newFilters.phone = String(value).trim() as any;
            break;
          case 'address':
            newFilters.address = String(value).trim() as any;
            break;
          case 'taxCode':
            newFilters.taxCode = String(value).trim() as any;
            break;
          case 'website':
            newFilters.website = String(value).trim() as any;
            break;
          case 'contactPerson':
            newFilters.contactPerson = String(value).trim() as any;
            break;
          case 'contactPhone':
            newFilters.contactPhone = String(value).trim() as any;
            break;
          case 'contactEmail':
            newFilters.contactEmail = String(value).trim() as any;
            break;
          case 'region':
            newFilters.region = String(value).trim() as any;
            break;
          case 'province':
            newFilters.province = String(value).trim() as any;
            break;
          case 'district':
            newFilters.district = String(value).trim() as any;
            break;
          // case 'supplierType':
          //   newFilters.supplierType = String(value).trim() as any;
          //   break;
          case 'status':
            const statusValue = Number(value);
            if (!isNaN(statusValue)) {
              newFilters.status = statusValue as any;
            }
            break;
          case 'rating':
            const ratingValue = Number(value);
            if (!isNaN(ratingValue)) {
              newFilters.rating = ratingValue as any;
            }
            break;
          case 'costSpend':
            const costSpendValue = Number(value);
            if (!isNaN(costSpendValue)) {
              newFilters.costSpend = costSpendValue as any;
            }
            break;
          case 'costRemain':
            const costRemainValue = Number(value);
            if (!isNaN(costRemainValue)) {
              newFilters.costRemain = costRemainValue as any;
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
    refetch();
  }, [refetch]);

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
  if (suppliersError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <SupplierTable data={lists} columns={columns} filters={filterProps} loading={suppliersLoading} onRefresh={refetch} />
      <AlertSupplierDeactivate
        id={supplierDeactivateId ?? 0}
        title={supplierName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={() => {}}
      />
      <AlertSupplierActivate
        id={supplierActivateId ?? 0}
        title={activateSupplierName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={() => {}}
      />
    </>
  );
}
