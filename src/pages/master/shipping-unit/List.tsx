import { useCallback, useMemo, useState } from 'react';

import ShippingUnitTable from 'sections/apps/shipping-unit/ShippingUnitTable';

import { openSnackbar } from 'api/snackbar';
import useShippingUnit from 'api/shipping-unit';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { ShippingUnitParams, TShippingUnit } from 'types/shipping-unit';
import { getShippingUnitColumns } from './ShippingUnitColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertShippingUnitDeactivate from 'sections/apps/shipping-unit/AlertShippingUnitDeactivate';
import AlertShippingUnitActivate from 'sections/apps/shipping-unit/AlertShippingUnitActivate';

// ==============================|| SHIPPING UNITS LIST ||============================== //

export default function ShippingUnitListPage() {
  const navigate = useNavigate();

  // ==============================|| SHIPPING UNITS FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ShippingUnitParams>({
    search: '',
    status: undefined,
    serviceType: undefined,
    name: undefined,
    fullName: undefined,
    code: undefined,
    isPreferred: undefined,
    rating: undefined
  });

  // ==============================|| GET LIST SHIPPING UNITS ||============================== //
  const { list } = useShippingUnit();
  const {
    shippingUnitsLoading,
    shippingUnits: lists = [],
    shippingUnitsError,
    refetch
  } = list({
    search,
    ...filters
  });

  // ==============================|| DEACTIVATE SHIPPING UNIT MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [shippingUnitDeactivateId, setShippingUnitDeactivateId] = useState<number | null>(null);
  const [shippingUnitName, setShippingUnitName] = useState<string>('');

  // ==============================|| ACTIVATE SHIPPING UNIT MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [shippingUnitActivateId, setShippingUnitActivateId] = useState<number | null>(null);
  const [activateShippingUnitName, setActivateShippingUnitName] = useState<string>('');

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleActivateClose = useCallback(() => setActivateOpen((prev) => !prev), []);

  const handleDeactivateShippingUnit = useCallback(
    (shippingUnitId: number) => {
      const shippingUnit = lists.find((s: TShippingUnit) => s.id === shippingUnitId);
      setOpen(true);
      setShippingUnitDeactivateId(shippingUnitId);
      setShippingUnitName(shippingUnit?.name || '');
    },
    [lists]
  );

  const handleActivateShippingUnit = useCallback(
    (shippingUnitId: number) => {
      const shippingUnit = lists.find((s: TShippingUnit) => s.id === shippingUnitId);
      setActivateOpen(true);
      setShippingUnitActivateId(shippingUnitId);
      setActivateShippingUnitName(shippingUnit?.name || '');
    },
    [lists]
  );

  const handleShippingUnitAction = useCallback(
    (action: 'create' | 'view' | 'edit', shippingUnitId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/shipping-unit/create');
            break;
          case 'view':
          case 'edit':
            if (!shippingUnitId || shippingUnitId <= 0) {
              throw new Error('Invalid shipping unit ID');
            }
            navigate(`/master/shipping-unit/${action}/${shippingUnitId}`);
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

  // ==============================|| SHIPPING UNIT TABLE COLUMNS ||============================== //
  const columns = useMemo(
    () => getShippingUnitColumns(handleShippingUnitAction, handleDeactivateShippingUnit, handleActivateShippingUnit),
    [handleShippingUnitAction, handleDeactivateShippingUnit, handleActivateShippingUnit]
  );

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        name: undefined,
        fullName: undefined,
        code: undefined,
        status: undefined,
        serviceType: undefined,
        isPreferred: undefined,
        rating: undefined
      };

      // Apply new filter values
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;

        switch (key) {
          case 'name':
            newFilters.name = String(value).trim() as any;
            break;
          case 'fullName':
            newFilters.fullName = String(value).trim() as any;
            break;
          case 'code':
            newFilters.code = String(value).trim() as any;
            break;
          case 'serviceType':
            newFilters.serviceType = String(value).trim() as any;
            break;
          case 'status':
            const statusValue = Number(value);
            if (!isNaN(statusValue)) {
              newFilters.status = statusValue as any;
            }
            break;
          case 'isPreferred':
            const preferredValue = Number(value);
            if (!isNaN(preferredValue)) {
              newFilters.isPreferred = preferredValue as any;
            }
            break;
          case 'rating':
            const ratingValue = Number(value);
            if (!isNaN(ratingValue)) {
              newFilters.rating = ratingValue as any;
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
  if (shippingUnitsError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <ShippingUnitTable data={lists} columns={columns} filters={filterProps} loading={shippingUnitsLoading} onRefresh={refetch} />
      <AlertShippingUnitDeactivate
        id={shippingUnitDeactivateId ?? 0}
        title={shippingUnitName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={() => {}}
      />
      <AlertShippingUnitActivate
        id={shippingUnitActivateId ?? 0}
        title={activateShippingUnitName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={() => {}}
      />
    </>
  );
}
