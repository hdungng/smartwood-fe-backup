import { useCallback, useEffect, useMemo, useState } from 'react';

import ForwarderTable from 'sections/apps/forwarder/ForwarderTable';

import { openSnackbar } from 'api/snackbar';
import useForwarder from 'api/forwarder';
import { useLocation, useNavigate } from 'react-router-dom';
import { SnackbarProps } from 'types/snackbar';
import { TForwarderFilter, TForwarder } from 'types/forwarder.types';
import { getForwarderColumns } from './ForwarderColumns';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertForwarderDeactivate from 'sections/apps/forwarder/AlertForwarderDeactivate';
import AlertForwarderActivate from 'sections/apps/forwarder/AlertForwarderActivate';

// ==============================|| FORWARDERS LIST ||============================== //

export default function ForwarderListPage() {
  const navigate = useNavigate();

  // ==============================|| FORWARDERS FILTER STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TForwarderFilter>({
    // search: '',
    status: undefined,
    forwarderType: undefined,
    name: undefined,
    forwarderNameVn: undefined,
    forwarderNameEn: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    taxCode: undefined,
    website: undefined,
    contactPerson: undefined,
    contactPhone: undefined,
    contactEmail: undefined,
    rating: undefined,
    region: undefined,
    province: undefined,
    district: undefined
  });

  // ==============================|| GET LIST FORWARDERS ||============================== //
  const { list } = useForwarder();
  const {
    forwardersLoading,
    forwarders: lists = [],
    forwardersError,
    refetch
  } = list({
    search,
    ...filters
  });

  useEffect(() => {
    refetch();
  }, [search, filters, refetch]);

  const location = useLocation();
  useEffect(() => {
    const s = location.state as any;
    if (s?.refresh) {
      refetch();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, refetch, navigate]);

  // ==============================|| DEACTIVATE FORWARDER MODAL STATE ||============================== //
  const [open, setOpen] = useState<boolean>(false);
  const [forwarderDeactivateId, setForwarderDeactivateId] = useState<number | null>(null);
  const [forwarderName, setForwarderName] = useState<string>('');

  // ==============================|| ACTIVATE FORWARDER MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [forwarderActivateId, setForwarderActivateId] = useState<number | null>(null);
  const [activateForwarderName, setActivateForwarderName] = useState<string>('');

  // ==============================|| PAGINATION STATE PRESERVATION ||============================== //
  const [beforeModalOpen, setBeforeModalOpen] = useState<(() => void) | null>(null);

  const registerBeforeModalOpen = useCallback((saveFn: () => void) => {
    setBeforeModalOpen(() => saveFn);
  }, []);

  // ==============================|| HANDLE FUNCTIONS ||============================== //
  const handleClose = useCallback(() => setOpen((prev) => !prev), []);
  const handleActivateClose = useCallback(() => setActivateOpen((prev) => !prev), []);

  const handleDeactivateForwarder = useCallback(
    (forwarderId: number) => {
      const forwarder = lists.find((s) => s.id === forwarderId);
      // Save pagination state before opening modal
      beforeModalOpen?.();
      setOpen(true);
      setForwarderDeactivateId(forwarderId);
      setForwarderName(forwarder?.forwarderNameVn || forwarder?.forwarderNameEn || '');
    },
    [lists, beforeModalOpen]
  );

  const handleActivateForwarder = useCallback(
    (forwarderId: number) => {
      const forwarder = lists.find((s) => s.id === forwarderId);
      // Save pagination state before opening modal
      beforeModalOpen?.();
      setActivateOpen(true);
      setForwarderActivateId(forwarderId);
      setActivateForwarderName(forwarder?.forwarderNameVn || forwarder?.forwarderNameEn || '');
    },
    [lists, beforeModalOpen]
  );

  const handleForwarderAction = useCallback(
    (action: 'create' | 'view' | 'edit', forwarderId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/master/forwarder/create');
            break;
          case 'view':
          case 'edit':
            if (!forwarderId || forwarderId <= 0) {
              throw new Error('Invalid forwarder ID');
            }
            navigate(`/master/forwarder/${action}/${forwarderId}`);
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

  // ==============================|| FORWARDER TABLE COLUMNS ||============================== //
  const columns = useMemo(
    () => getForwarderColumns(handleForwarderAction, handleDeactivateForwarder, handleActivateForwarder),
    [handleForwarderAction, handleDeactivateForwarder, handleActivateForwarder]
  );

  // ==============================|| FILTER HANDLERS ||============================== //
  // const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
  //   setFilters((prev) => {
  //     const newFilters = {
  //       ...prev,
  //       // Reset filter values first
  //       name: undefined,
  //       forwarderNameVn: undefined,
  //       forwarderNameEn: undefined,
  //       email: undefined,
  //       phone: undefined,
  //       address: undefined,
  //       taxCode: undefined,
  //       website: undefined,
  //       contactPerson: undefined,
  //       contactPhone: undefined,
  //       contactEmail: undefined,
  //       status: undefined,
  //       forwarderType: undefined,
  //       rating: undefined,
  //       region: undefined,
  //       province: undefined,
  //       district: undefined
  //     };

  //     // Apply new filter values
  //     Object.entries(filterValues).forEach(([key, value]) => {
  //       if (!value || String(value).trim() === '') return;

  //       switch (key) {
  //         case 'name':
  //           newFilters.name = String(value).trim() as any;
  //           break;
  //         case 'forwarderNameVn':
  //           newFilters.forwarderNameVn = String(value).trim() as any;
  //           break;
  //         case 'forwarderNameEn':
  //           newFilters.forwarderNameEn = String(value).trim() as any;
  //           break;
  //         case 'email':
  //           newFilters.email = String(value).trim() as any;
  //           break;
  //         case 'phone':
  //           newFilters.phone = String(value).trim() as any;
  //           break;
  //         case 'address':
  //           newFilters.address = String(value).trim() as any;
  //           break;
  //         case 'taxCode':
  //           newFilters.taxCode = String(value).trim() as any;
  //           break;
  //         case 'website':
  //           newFilters.website = String(value).trim() as any;
  //           break;
  //         case 'contactPerson':
  //           newFilters.contactPerson = String(value).trim() as any;
  //           break;
  //         case 'contactPhone':
  //           newFilters.contactPhone = String(value).trim() as any;
  //           break;
  //         case 'contactEmail':
  //           newFilters.contactEmail = String(value).trim() as any;
  //           break;
  //         case 'region':
  //           newFilters.region = String(value).trim() as any;
  //           break;
  //         case 'province':
  //           newFilters.province = String(value).trim() as any;
  //           break;
  //         case 'district':
  //           newFilters.district = String(value).trim() as any;
  //           break;
  //         case 'forwarderType':
  //           newFilters.forwarderType = String(value).trim() as any;
  //           break;
  //         case 'status':
  //           const statusValue = Number(value);
  //           if (!isNaN(statusValue)) {
  //             newFilters.status = statusValue as any;
  //           }
  //           break;
  //         case 'rating':
  //           const ratingValue = Number(value);
  //           if (!isNaN(ratingValue)) {
  //             newFilters.rating = ratingValue as any;
  //           }
  //           break;
  //       }
  //     });

  //     return newFilters;
  //   });
  // }, []);

  const handleFilterChange = useCallback((next: Record<string, any>) => {
    setFilters(next);
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
  if (forwardersError) {
    return <EmptyReactTable />;
  }

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <ForwarderTable
        data={lists}
        columns={columns}
        filters={filterProps}
        loading={forwardersLoading}
        onRefresh={refetch}
        onBeforeModalOpen={registerBeforeModalOpen}
      />
      {forwarderDeactivateId && (
        <AlertForwarderDeactivate
          open={open}
          handleClose={handleClose}
          id={forwarderDeactivateId}
          title={forwarderName}
          onDeactivateSuccess={handleDeactivateSuccess}
        />
      )}
      {forwarderActivateId && (
        <AlertForwarderActivate
          open={activateOpen}
          handleClose={handleActivateClose}
          id={forwarderActivateId}
          title={activateForwarderName}
          onActivateSuccess={handleActivateSuccess}
        />
      )}
    </>
  );
}
