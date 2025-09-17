import { useCallback, useMemo, useState } from 'react';

import PaymentTermTable from 'sections/apps/payment-term/PaymentTermTable';

import { openSnackbar } from 'api/snackbar';
import usePaymentTerm from 'api/payment-term';
import { useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { PaymentTermParams, TPaymentTerm } from 'types/payment-term';
import { usePaymentTermColumns } from './PaymentTermColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertPaymentTermDeactivate from 'sections/apps/payment-term/AlertPaymentTermDeactivate';
import AlertPaymentTermActivate from 'sections/apps/payment-term/AlertPaymentTermActivate';

// ==============================|| PAYMENT TERMS LIST ||============================== //

export default function PaymentTermListPage() {
  const navigate = useNavigate();

  // ==============================|| PAYMENT TERMS FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PaymentTermParams>({
    search: '',
    status: undefined,
    code: undefined,
    name: undefined,
    description: undefined,
    paymentMethod: undefined
  });

  // ==============================|| GET LIST PAYMENT TERMS ||============================== //
  const { list, deactivate, activate } = usePaymentTerm();
  const {
    paymentTermsLoading,
    paymentTerms: lists = [],
    paymentTermsError,
    refetch
  } = list({
    search,
    ...filters
  });

  // ==============================|| DEACTIVATE PAYMENT TERM MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [paymentTermDeactivateId, setPaymentTermDeactivateId] = useState<number | null>(null);
  const [paymentTermName, setPaymentTermName] = useState<string>('');

  // ==============================|| ACTIVATE PAYMENT TERM MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [paymentTermActivateId, setPaymentTermActivateId] = useState<number | null>(null);
  const [activatePaymentTermName, setActivatePaymentTermName] = useState<string>('');

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => {
    setOpen(false);
    setPaymentTermDeactivateId(null);
    setPaymentTermName('');
  }, []);

  const handleActivateClose = useCallback(() => {
    setActivateOpen(false);
    setPaymentTermActivateId(null);
    setActivatePaymentTermName('');
  }, []);

  const handleDeactivatePaymentTerm = useCallback(
    (paymentTermId: number) => {
      const paymentTerm = lists.find((p) => p.id === paymentTermId);
      setOpen(true);
      setPaymentTermDeactivateId(paymentTermId);
      setPaymentTermName(paymentTerm?.name || '');
    },
    [lists]
  );

  const handleActivatePaymentTerm = useCallback(
    (paymentTermId: number) => {
      const paymentTerm = lists.find((p) => p.id === paymentTermId);
      setActivateOpen(true);
      setPaymentTermActivateId(paymentTermId);
      setActivatePaymentTermName(paymentTerm?.name || '');
    },
    [lists]
  );

  // ==============================|| PAYMENT TERM TABLE COLUMNS ||============================== //
  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const columns = usePaymentTermColumns({
    onNavigate: handleNavigate,
    onDeactivate: handleDeactivatePaymentTerm,
    onActivate: handleActivatePaymentTerm
  });

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        code: undefined,
        name: undefined,
        description: undefined,
        paymentMethod: undefined,
        status: undefined
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
          case 'description':
            newFilters.description = String(value).trim() as any;
            break;
          case 'paymentMethod':
            newFilters.paymentMethod = String(value).trim() as any;
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
  if (paymentTermsError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <PaymentTermTable data={lists} columns={columns} filters={filterProps} loading={paymentTermsLoading} onRefresh={refetch} />
      <AlertPaymentTermDeactivate
        id={paymentTermDeactivateId ?? 0}
        title={paymentTermName}
        open={open}
        handleClose={handleClose}
        onDeactivateSuccess={() => {}}
      />
      <AlertPaymentTermActivate
        id={paymentTermActivateId ?? 0}
        title={activatePaymentTermName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={() => {}}
      />
    </>
  );
}
