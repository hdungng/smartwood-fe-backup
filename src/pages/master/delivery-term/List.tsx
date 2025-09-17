import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Grid, Stack } from '@mui/material';

// project import
import { DeliveryTermTable, AlertDeliveryTermDeactivate, AlertDeliveryTermActivate } from 'sections/apps/delivery-term';
import useDeliveryTerm from 'api/delivery-term';
import { TDeliveryTerm } from 'types/delivery-term';
import DeliveryTermColumns from './DeliveryTermColumns';

// ==============================|| DELIVERY TERM - LIST ||============================== //

export default function DeliveryTermList() {
  const navigate = useNavigate();

  // ==============================|| STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filterParams, setFilterParams] = useState<Record<string, any>>({});

  // Modal states
  const [selectedDeliveryTerm, setSelectedDeliveryTerm] = useState<TDeliveryTerm | null>(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);

  // ==============================|| API ||============================== //
  const { list } = useDeliveryTerm();
  const { deliveryTerms, deliveryTermsLoading, refetch } = list({
    search,
    ...filterParams
  });

  // ==============================|| HANDLERS ||============================== //
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterParams(filters);
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setFilterParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: order
    }));
  };

  const handleEdit = (deliveryTerm: TDeliveryTerm) => {
    navigate(`/master/delivery-term/edit/${deliveryTerm.id}`);
  };

  const handleView = (deliveryTerm: TDeliveryTerm) => {
    navigate(`/master/delivery-term/view/${deliveryTerm.id}`);
  };

  const handleActivate = (deliveryTerm: TDeliveryTerm) => {
    setSelectedDeliveryTerm(deliveryTerm);
    setActivateModalOpen(true);
  };

  const handleDeactivate = (deliveryTerm: TDeliveryTerm) => {
    setSelectedDeliveryTerm(deliveryTerm);
    setDeactivateModalOpen(true);
  };

  const handleCloseActivateModal = () => {
    setActivateModalOpen(false);
    setSelectedDeliveryTerm(null);
  };

  const handleCloseDeactivateModal = () => {
    setDeactivateModalOpen(false);
    setSelectedDeliveryTerm(null);
  };

  const handleActivateSuccess = () => {
    refetch();
    handleCloseActivateModal();
  };

  const handleDeactivateSuccess = () => {
    refetch();
    handleCloseDeactivateModal();
  };

  // ==============================|| COLUMNS ||============================== //
  const columns = useMemo(
    () =>
      DeliveryTermColumns({
        onEdit: handleEdit,
        onView: handleView,
        onActivate: handleActivate,
        onDeactivate: handleDeactivate
      }),
    []
  );

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack spacing={3}>
            <DeliveryTermTable
              data={deliveryTerms}
              columns={columns}
              loading={deliveryTermsLoading}
              filters={{
                search,
                onSearchChange: handleSearch,
                onSortChange: handleSortChange,
                onFilterChange: handleFilterChange
              }}
              onRefresh={refetch}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Modals */}
      {selectedDeliveryTerm && (
        <>
          <AlertDeliveryTermActivate
            id={selectedDeliveryTerm.id}
            title={selectedDeliveryTerm.name}
            open={activateModalOpen}
            handleClose={handleCloseActivateModal}
            onActivateSuccess={() => {}}
          />
          <AlertDeliveryTermDeactivate
            id={selectedDeliveryTerm.id}
            title={selectedDeliveryTerm.name}
            open={deactivateModalOpen}
            handleClose={handleCloseDeactivateModal}
            onDeactivateSuccess={() => {}}
          />
        </>
      )}
    </>
  );
}
