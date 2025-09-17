import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CostTable from 'sections/apps/cost/CostTable';
import { openSnackbar } from 'api/snackbar';
import useCost from 'api/cost';
import EmptyReactTable from 'pages/tables/react-table/empty';
import { SnackbarProps } from 'types/snackbar';
import { TCost } from 'types/cost';
import { getCostColumns } from './CostColumns';
import AlertCostDelete from 'sections/apps/cost/AlertCostDelete';

export default function CostListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({
    search: '',
    itemCode: '',
    costType: '',
    name: '',
    currency: ''
  });

  const { list } = useCost();
  const { costsLoading, costs: lists = [], costsError, refetch } = list({
    searchKey: search,
    itemCode: filters.itemCode,
    costType: filters.costType,
    name: filters.name,
    currency: filters.currency
  });

  const [open, setOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleDelete = useCallback((id: number) => {
    setOpen(true);
    setDeleteId(id);
  }, []);

  const handleAction = useCallback(
    (action: 'create' | 'view' | 'edit', id?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/logistics-cost/create');
            break;
          case 'view':
          case 'edit':
            if (!id || id <= 0) throw new Error('Invalid cost ID');
            navigate(`/master/logistics-cost/${action}/${id}`);
            break;
          default:
            throw new Error('Invalid action');
        }
      } catch (error) {
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

  const columns = useMemo(() => getCostColumns((action, id) => handleAction(action, id), handleDelete), [handleAction, handleDelete]);

  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, name: '', itemCode: '', costType: '', currency: '' };
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;
        switch (key) {
          case 'name':
            newFilters.name = String(value).trim();
            break;
          case 'itemCode':
            newFilters.itemCode = String(value).trim();
            break;
          case 'costType':
            newFilters.costType = String(value).trim();
            break;
          case 'currency':
            newFilters.currency = String(value).trim();
            break;
        }
      });
      return newFilters;
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);

  const filterProps = useMemo(
    () => ({ search, onSearchChange: handleSearchChange, onFilterChange: handleFilterChange }),
    [search, handleSearchChange, handleFilterChange]
  );

  if (costsError) return <EmptyReactTable />;

  return (
    <>
      <CostTable data={lists} columns={columns} filters={filterProps} loading={costsLoading} onRefresh={refetch} />
      <AlertCostDelete id={deleteId ?? 0} title={deleteId?.toString() || ''} open={open} handleClose={handleClose} />
    </>
  );
}


