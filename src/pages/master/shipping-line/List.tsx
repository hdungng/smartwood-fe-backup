import { useCallback, useMemo, useState } from 'react';

import ShippingLineTable from 'sections/apps/shipping-line/ShippingLineTable';

import { openSnackbar } from 'api/snackbar';
import useShippingLine from 'api/shipping-line';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { ShippingLineParams, ShippingLine } from 'types/shipping-line';
import { getShippingLineColumns } from './ShippingLineColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertShippingLineDeactivate from 'sections/apps/shipping-line/AlertShippingLineDeactivate';
import AlertShippingLineActivate from 'sections/apps/shipping-line/AlertShippingLineActivate';



// ==============================|| SHIPPING LINES LIST ||============================== //

export default function ShippingLineListPage() {
  const navigate = useNavigate();

  // ==============================|| SHIPPING LINES FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ShippingLineParams>({    
    status: undefined,
    name: undefined,
    code: undefined
  });

  // ==============================|| GET LIST SHIPPING LINES ||============================== //
  const { list } = useShippingLine();
  const {
    shippingLinesLoading,
    shippingLines: lists = [],
    shippingLinesError,
    refetch
  } = list({
    search,
    ...filters
  });

  // ==============================|| DEACTIVATE SHIPPING LINE MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [shippingLineDeactivateId, setShippingLineDeactivateId] = useState<number | null>(null);
  const [shippingLineName, setShippingLineName] = useState<string>('');

  // ==============================|| ACTIVATE SHIPPING LINE MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [shippingLineActivateId, setShippingLineActivateId] = useState<number | null>(null);
  const [activateShippingLineName, setActivateShippingLineName] = useState<string>('');

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleActivateClose = useCallback(() => setActivateOpen((prev) => !prev), []);

  const handleDeactivateShippingLine = useCallback(
    (shippingLineId: number) => {
      const shippingLine = lists.find((s) => s.id === shippingLineId);
      setOpen(true);
      setShippingLineDeactivateId(shippingLineId);
      setShippingLineName(shippingLine?.name || '');
    },
    [lists]
  );

  const handleActivateShippingLine = useCallback(
    (shippingLineId: number) => {
      const shippingLine = lists.find((s) => s.id === shippingLineId);
      setActivateOpen(true);
      setShippingLineActivateId(shippingLineId);
      setActivateShippingLineName(shippingLine?.name || '');
    },
    [lists]
  );

  const handleShippingLineAction = useCallback(
    (action: 'create' | 'view' | 'edit', shippingLineId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/shipping-line/create');
            break;
          case 'view':
          case 'edit':
            if (!shippingLineId || shippingLineId <= 0) {
              throw new Error('Invalid shipping line ID');
            }
            navigate(`/master/shipping-line/${action}/${shippingLineId}`);
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

  // ==============================|| SHIPPING LINE TABLE COLUMNS ||============================== //
  const columns = useMemo(
    () => getShippingLineColumns(handleShippingLineAction, handleDeactivateShippingLine, handleActivateShippingLine),
    [handleShippingLineAction, handleDeactivateShippingLine, handleActivateShippingLine]
  );

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        name: undefined,
        code: undefined,
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
    refetch();
  }, [refetch]);

  const handleActivateSuccess = useCallback(() => {
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
  if (shippingLinesError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <ShippingLineTable data={lists} columns={columns} filters={filterProps} loading={shippingLinesLoading} onRefresh={refetch} />
      <AlertShippingLineDeactivate
        id={shippingLineDeactivateId ?? 0}
        title={shippingLineName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={() => {}}
      />
      <AlertShippingLineActivate
        id={shippingLineActivateId ?? 0}
        title={activateShippingLineName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={() => {}}
      />
    </>
  );
}
