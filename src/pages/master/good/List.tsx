import { useCallback, useMemo, useState } from 'react';

import GoodTable from 'sections/apps/good/GoodTable';

import { openSnackbar } from 'api/snackbar';
import useGood from 'api/good';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { GoodParams, TGood } from 'types/good';
import { getGoodColumns } from './GoodColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertGoodDeactivate from 'sections/apps/good/AlertGoodDeactivate';
import AlertGoodActivate from 'sections/apps/good/AlertGoodActivate';

// ==============================|| GOODS LIST ||============================== //

export default function GoodListPage() {
  const navigate = useNavigate();

  // ==============================|| GOODS FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<GoodParams>({
    search: '',
    status: undefined,
    category: undefined,
    brand: undefined,
    name: undefined,
    sku: undefined,
    code: undefined,
    unitOfMeasure: undefined,
    originCountry: undefined
  });

  // ==============================|| GET LIST GOODS ||============================== //
  const { list } = useGood();
  const {
    goodsLoading,
    goods: lists = [],
    goodsError,
    refetch
  } = list({
    search,
    ...filters
  });

  // ==============================|| DEACTIVATE GOOD MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [goodDeactivateId, setGoodDeactivateId] = useState<number | null>(null);
  const [goodName, setGoodName] = useState<string>('');

  // ==============================|| ACTIVATE GOOD MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [goodActivateId, setGoodActivateId] = useState<number | null>(null);
  const [activateGoodName, setActivateGoodName] = useState<string>('');

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleActivateClose = useCallback(() => setActivateOpen((prev) => !prev), []);

  const handleDeactivateGood = useCallback(
    (goodId: number) => {
      const good = lists.find((g) => g.id === goodId);
      setOpen(true);
      setGoodDeactivateId(goodId);
      setGoodName(good?.name || '');
    },
    [lists]
  );

  const handleActivateGood = useCallback(
    (goodId: number) => {
      const good = lists.find((g) => g.id === goodId);
      setActivateOpen(true);
      setGoodActivateId(goodId);
      setActivateGoodName(good?.name || '');
    },
    [lists]
  );

  const handleGoodAction = useCallback(
    (action: 'create' | 'view' | 'edit', goodId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/good/create');
            break;
          case 'view':
          case 'edit':
            if (!goodId || goodId <= 0) {
              throw new Error('Invalid good ID');
            }
            navigate(`/master/good/${action}/${goodId}`);
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

  // ==============================|| GOOD TABLE COLUMNS ||============================== //
  const columns = useMemo(
    () => getGoodColumns(handleGoodAction, handleDeactivateGood, handleActivateGood),
    [handleGoodAction, handleDeactivateGood, handleActivateGood]
  );

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        name: undefined,
        // sku: undefined,
        code: undefined,
        status: undefined,
        // category: undefined,
        // brand: undefined,
        // unitOfMeasure: undefined,
        // originCountry: undefined
      };

      // Apply new filter values
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;

        switch (key) {
          case 'name':
            newFilters.name = String(value).trim() as any;
            break;
          // case 'sku':
          //   newFilters.sku = String(value).trim() as any;
          //   break;
          case 'code':
            newFilters.code = String(value).trim() as any;
            break;
          // case 'category':
          //   newFilters.category = String(value).trim() as any;
          //   break;
          // case 'brand':
          //   newFilters.brand = String(value).trim() as any;
          //   break;
          // case 'unitOfMeasure':
          //   newFilters.unitOfMeasure = String(value).trim() as any;
          //   break;
          // case 'originCountry':
          //   newFilters.originCountry = String(value).trim() as any;
          //   break;
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
  if (goodsError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <GoodTable data={lists} columns={columns} filters={filterProps} loading={goodsLoading} onRefresh={refetch} />
      <AlertGoodDeactivate
        id={goodDeactivateId ?? 0}
        title={goodName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={() => {}}
      />
      <AlertGoodActivate
        id={goodActivateId ?? 0}
        title={activateGoodName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={() => {}}
      />
    </>
  );
}
