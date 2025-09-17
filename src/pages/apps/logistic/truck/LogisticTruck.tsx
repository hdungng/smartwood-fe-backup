import { Box } from '@mui/system';

// Project imports
import {
  TruckScheduleFilter,
  TruckScheduleTable,
  TruckScheduleWarningDialog
} from './components';
import { useTruckScheduleLogic } from './hooks/useTruckScheduleLogic';

const LogisticTruck = () => {
  const {
    // Data
    localData,
    setLocalData,
    editedRows,
    setEditedRows,
    
    // Options
    bookingOptions,
    bookingMap,
    supplierOptions,
    transportOptions,
    vehicleTypeOptions,
    optionsLoaded,
    
    // Filter
    selectedBooking,
    setSelectedBooking,
    
    // Pagination
    pagination,
    handlePageChange,
    
    // Loading states
    schedulesLoading,
    schedulesValidating,
    schedulesTotal,
    
    // Dialog
    showWarningDialog,
    confirmPageChange,
    cancelPageChange,
    
    // Actions
    handleCreateRow,
    handleSaveRows,
    handleDeleteRow
  } = useTruckScheduleLogic();

  return (
    <Box>
      {/* Filters */}
      <TruckScheduleFilter
        bookingOptions={bookingOptions}
        selectedBooking={selectedBooking}
        setSelectedBooking={setSelectedBooking}
      />

      {/* MUI Table */}
      <TruckScheduleTable
        localData={localData}
        setLocalData={setLocalData}
        editedRows={editedRows}
        setEditedRows={setEditedRows}
        bookingOptions={bookingOptions}
        bookingMap={bookingMap}
        supplierOptions={supplierOptions}
        transportOptions={transportOptions}
        vehicleTypeOptions={vehicleTypeOptions}
        optionsLoaded={optionsLoaded}
        pagination={pagination}
        handlePageChange={handlePageChange}
        schedulesTotal={schedulesTotal}
        schedulesValidating={schedulesValidating}
        schedulesLoading={schedulesLoading}
        handleCreateRow={handleCreateRow}
        handleSaveRows={handleSaveRows}
        handleDeleteRow={handleDeleteRow}
      />

      {/* Warning Dialog */}
      <TruckScheduleWarningDialog
        open={showWarningDialog}
        onCancel={cancelPageChange}
        onConfirm={confirmPageChange}
      />
    </Box>
  );
};

export default LogisticTruck;
