import React, { useCallback, useMemo, useState } from 'react';

import ExchangeRateTable from 'sections/apps/exchange-rate/ExchangeRateTable';

import { openSnackbar } from 'api/snackbar';
import useExchangeRate from 'api/exchange-rate';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { ExchangeRateFilters, TExchangeRate } from 'types/exchange-rate';
import { getExchangeRateColumns } from './ExchangeRateColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertExchangeRateDeactivate from 'sections/apps/exchange-rate/AlertExchangeRateDeactivate';
import AlertExchangeRateActivate from 'sections/apps/exchange-rate/AlertExchangeRateActivate';

// ==============================|| EXCHANGE RATES LIST ||============================== //

export default function ExchangeRateListPage() {
  const navigate = useNavigate();

  // ==============================|| EXCHANGE RATES FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ExchangeRateFilters>({
    search: '',
    status: '',
    rateType: '',
    source: '',
    name: '',
    code: '',
    fromCurrency: '',
    toCurrency: ''
  });

  // ==============================|| GET LIST EXCHANGE RATES ||============================== //
  const { list } = useExchangeRate();
  const {
    exchangeRatesLoading,
    exchangeRates: lists = [],
    exchangeRatesError,
    refetch
  } = list({
    search,
    status: filters.status,
    rateType: filters.rateType,
    source: filters.source,
    name: filters.name,
    code: filters.code,
    fromCurrency: filters.fromCurrency,
    toCurrency: filters.toCurrency
  });

  // ==============================|| DEACTIVATE EXCHANGE RATE MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [exchangeRateDeactivateId, setExchangeRateDeactivateId] = useState<number | null>(null);
  const [exchangeRateName, setExchangeRateName] = useState<string>('');

  // ==============================|| ACTIVATE EXCHANGE RATE MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [exchangeRateActivateId, setExchangeRateActivateId] = useState<number | null>(null);
  const [activateExchangeRateName, setActivateExchangeRateName] = useState<string>('');

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleActivateClose = useCallback(() => setActivateOpen((prev) => !prev), []);

  const handleDeactivateExchangeRate = useCallback(
    (exchangeRateId: number) => {
      const exchangeRate = lists.find((er: TExchangeRate) => er.id === exchangeRateId);
      setOpen(true);
      setExchangeRateDeactivateId(exchangeRateId);
      setExchangeRateName(exchangeRate?.name || '');
    },
    [lists]
  );

  const handleActivateExchangeRate = useCallback(
    (exchangeRateId: number) => {
      const exchangeRate = lists.find((er: TExchangeRate) => er.id === exchangeRateId);
      setActivateOpen(true);
      setExchangeRateActivateId(exchangeRateId);
      setActivateExchangeRateName(exchangeRate?.name || '');
    },
    [lists]
  );

  const handleExchangeRateAction = useCallback(
    (action: 'create' | 'view' | 'edit', exchangeRateId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/exchange-rate/create');
            break;
          case 'view':
          case 'edit':
            if (!exchangeRateId || exchangeRateId <= 0) {
              throw new Error('Invalid exchange rate ID');
            }
            navigate(`/master/exchange-rate/${action}/${exchangeRateId}`);
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

  // ==============================|| EXCHANGE RATE TABLE COLUMNS ||============================== //
  const columns = useMemo(
    () => getExchangeRateColumns(handleExchangeRateAction, handleDeactivateExchangeRate, handleActivateExchangeRate),
    [handleExchangeRateAction, handleDeactivateExchangeRate, handleActivateExchangeRate]
  );

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        name: '',
        code: '',
        fromCurrency: '',
        toCurrency: '',
        rateType: '',
        source: '',
        status: ''
      };

      // Apply new filter values
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;

        switch (key) {
          case 'name':
            newFilters.name = String(value).trim();
            break;
          case 'code':
            newFilters.code = String(value).trim();
            break;
          case 'fromCurrency':
            newFilters.fromCurrency = String(value).trim();
            break;
          case 'toCurrency':
            newFilters.toCurrency = String(value).trim();
            break;
          case 'rateType':
            newFilters.rateType = String(value).trim();
            break;
          case 'source':
            newFilters.source = String(value).trim();
            break;
          case 'status':
            newFilters.status = String(value);
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

  const handleActivateSuccess = useCallback(() => {
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
  if (exchangeRatesError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <ExchangeRateTable data={lists} columns={columns} filters={filterProps} loading={exchangeRatesLoading} onRefresh={refetch} />
      <AlertExchangeRateDeactivate
        id={exchangeRateDeactivateId ?? 0}
        title={exchangeRateName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={handleDeactivateSuccess}
      />
      <AlertExchangeRateActivate
        id={exchangeRateActivateId ?? 0}
        title={activateExchangeRateName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={handleActivateSuccess}
      />
    </>
  );
}
