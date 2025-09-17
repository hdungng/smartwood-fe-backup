import useTruckSchedule, { TruckScheduleData, TruckScheduleFormData } from 'api/truckSchedule';
import { CODE_VEHICLE_TYPE } from 'constants/code';
import { useGlobal } from 'contexts/GlobalContext';
import { useConfiguration } from 'hooks/useConfiguration';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { dateHelper } from 'utils';
import axiosServices from 'utils/axios';
import * as yup from 'yup';

export type SelectionOption = { value: string | number; label: string };

export interface TableRowData {
  id: number | null;
  shippingScheduleId: number;
  supplierId: number;
  transportUnit: string;
  vehicleType: string;
  loadingDate: string;
  totalCont: number | null;
  totalWeight: number | null;
  quantity: number | null;
  // UI fields for display
  bookingCode: string;
  factoryName: string;
  transportName: string;
  vehicleTypeName: string;
  isEdited?: boolean;
  isNew?: boolean;
}

const rowValidationSchema = yup.object({
  bookingCode: yup.string().required('Số booking không được bỏ trống!'),
  supplierId: yup.number().min(1, 'Vui lòng chọn xưởng').required('Tên xưởng không được bỏ trống!'),
  transportUnit: yup.string().required('Đơn vị vận chuyển không được bỏ trống!'),
  vehicleType: yup.string().required('Loại xe không được bỏ trống!'),
  loadingDate: yup.string().required('Ngày đóng hàng không được bỏ trống!'),
  quantity: yup.number().nullable().min(1, 'Số lượng xe phải lớn hơn 0').required('Số lượng xe không được bỏ trống!'),
  totalCont: yup.number().nullable().min(0.1, 'Số lượng cont phải lớn hơn 0').required('Số lượng cont không được bỏ trống!'),
  totalWeight: yup.number().nullable().min(0.01, 'Số lượng tấn phải lớn hơn 0').required('Số lượng tấn không được bỏ trống!')
});

export const useTruckScheduleLogic = () => {
  const global = useGlobal();
  const { shippingUnits, supplierOptions } = global;
  const { mapConfigSelection } = useConfiguration();

  // Options state
  const [bookingOptions, setBookingOptions] = useState<SelectionOption[]>([]);
  const [bookingMap, setBookingMap] = useState<Record<string, any>>({});
  const vehicleTypeOptions = useMemo(() => mapConfigSelection(CODE_VEHICLE_TYPE) || [], [mapConfigSelection]);
  const transportOptions = useMemo<SelectionOption[]>(
    () => (shippingUnits || []).map((u: any) => ({ value: u.code, label: u.fullName })),
    [shippingUnits]
  );

  // State for pagination and UI
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const [editedRows, setEditedRows] = useState<Set<number>>(new Set());
  const [localData, setLocalData] = useState<TableRowData[]>([]);
  
  // Booking filter
  const [selectedBooking, _setSelectedBooking] = useState<SelectionOption | null>(null);
  const [optionsLoaded, setOptionsLoaded] = useState<boolean>(false);
  
  // Warning dialog state
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // useSWR hook for data fetching
  const truckScheduleApi = useTruckSchedule();
  const {
    schedules,
    schedulesLoading,
    schedulesError,
    schedulesValidating,
    schedulesTotal,
    schedulesMeta,
    refetch
  } = truckScheduleApi.list({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    ShippingScheduleId: selectedBooking?.value ? bookingMap[selectedBooking.value]?.id : undefined
  });

  // Force refetch when pagination changes to ensure fresh data
  useEffect(() => {
    if (optionsLoaded) {
      // Small delay to ensure pagination state is updated before refetching
      const timer = setTimeout(() => {
        refetch();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pagination.pageIndex, pagination.pageSize, selectedBooking, optionsLoaded, refetch]);

  // Clear local data when pagination changes to ensure fresh data is loaded
  useEffect(() => {
    if (optionsLoaded) {
      // Only clear local data when pagination changes, not when booking filter changes
      // This prevents data loss when resetting filters
      if (pagination.pageIndex !== 0 || pagination.pageSize !== 50) {
        // Clear all local data including init row when changing pages
        setLocalData([]);
        setEditedRows(new Set());
      }
    }
  }, [pagination.pageIndex, pagination.pageSize, optionsLoaded]);

  // Handle booking filter changes separately to prevent data loss
  useEffect(() => {
    if (optionsLoaded) {
      if (selectedBooking !== null) {
        // When booking filter is applied, clear local data to show new filtered data
        setLocalData([]);
        setEditedRows(new Set());
      }
      // When selectedBooking is null (reset filter), don't clear data immediately
      // Let the schedules data update naturally
    }
  }, [selectedBooking, optionsLoaded]);



  // Load options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Booking options from shipping schedules using GET method
        const shipRes = await axiosServices.get('/api/purchasecontractshippingschedule/basic', {});
        const list: any[] = shipRes?.data?.data ?? [];
        const uniqueByCode: Record<string, any> = {};
        list.forEach((item) => {
          if (item?.codeBooking && !uniqueByCode[item.codeBooking]) uniqueByCode[item.codeBooking] = item;
        });
        const bookings: SelectionOption[] = Object.values(uniqueByCode).map((item: any) => ({
          value: item.codeBooking,
          label: item.codeBooking
        }));
        setBookingOptions(bookings);
        setBookingMap(uniqueByCode);
        setOptionsLoaded(true);
      } catch (err) {
        console.error('Failed to load options', err);
      }
    };

    loadOptions();
  }, []);


  // Helper: blank init row always present at top for quick input
  const createBlankRow = (): TableRowData => ({
    id: null,
    shippingScheduleId: 0,
    supplierId: 0,
    transportUnit: '',
    vehicleType: '',
    loadingDate: dateHelper.toLocalDateString(new Date()),
    totalCont: null,
    totalWeight: null,
    quantity: null,
    bookingCode: '',
    factoryName: '',
    transportName: '',
    vehicleTypeName: '',
    isEdited: true,
    isNew: true
  });



  // Transform SWR data to local format when data changes and ensure one init row on top
  useEffect(() => {
    if (schedules && optionsLoaded) {
      const transformedData: TableRowData[] = schedules.map((item: TruckScheduleData) => ({
        id: item.id,
        shippingScheduleId: item.shippingScheduleId,
        supplierId: item.supplierId,
        transportUnit: item.transportUnit,
        vehicleType: item.vehicleType,
        loadingDate: item.loadingDate ? item.loadingDate.split('T')[0] : '',
        totalCont: item.totalCont,
        totalWeight: item.totalWeight,
        quantity: item.quantity,
        bookingCode: findBookingCodeById(item.shippingScheduleId),
        factoryName: findSupplierNameById(item.supplierId),
        transportName: findTransportNameByCode(item.transportUnit),
        vehicleTypeName: findVehicleTypeNameByCode(item.vehicleType),
        isEdited: false,
        isNew: false
      }));

      // Always update local data when schedules change (pagination, filter, etc.)
      // This ensures data is always in sync with the current page/filter
      // Always create a fresh init row for new data
      const head = createBlankRow();
      
      setLocalData([head, ...transformedData]);
      
      // Mark the init row as edited only if it has meaningful data
      if (head.isNew) {
        const hasData = !!(
          head.bookingCode ||
          (head.supplierId && head.supplierId > 0) ||
          head.transportUnit ||
          head.vehicleType ||
          (head.quantity !== null && head.quantity !== undefined && String(head.quantity) !== '') ||
          (head.totalCont !== null && head.totalCont !== undefined && String(head.totalCont) !== '') ||
          (head.totalWeight !== null && head.totalWeight !== undefined && String(head.totalWeight) !== '')
        );
        
        if (hasData) {
          setEditedRows(new Set([0]));
        } else {
          setEditedRows(new Set());
        }
      } else {
        setEditedRows(new Set());
      }
    } else if (schedules && optionsLoaded && schedules.length === 0) {
      // Only clear data if we're not resetting a filter (i.e., if selectedBooking is not null)
      // This prevents data loss when resetting filters
      if (selectedBooking !== null) {
        const head = createBlankRow();
        setLocalData([head]);
        // Don't mark as edited since it's a fresh blank row
        setEditedRows(new Set());
      }
    }
  }, [schedules, optionsLoaded, bookingMap, supplierOptions, transportOptions, vehicleTypeOptions, selectedBooking]);

  // Helper functions to find display names
  const findBookingCodeById = (id: number): string => {
    const booking = Object.values(bookingMap).find((b: any) => b.id === id);
    return booking?.codeBooking || '';
  };

  const findSupplierNameById = (id: number): string => {
    const supplier = supplierOptions.find(s => s.value === id);
    return supplier?.label || '';
  };

  const findTransportNameByCode = (code: string): string => {
    const transport = transportOptions.find(t => t.value === code);
    return transport?.label || '';
  };

  const findVehicleTypeNameByCode = (code: string): string => {
    const vehicleType = vehicleTypeOptions.find(v => v.value === code);
    return vehicleType?.label || '';
  };

  // Handle page change with warning for unsaved changes
  const handlePageChange = (newPagination: any) => {
    // Only show warning if there are actual data changes in the init row
    if (editedRows.size > 0) {
      // Check if the init row has meaningful data
      const initRow = localData[0];
      const hasData = initRow && initRow.isNew && !!(
        initRow.bookingCode ||
        (initRow.supplierId && initRow.supplierId > 0) ||
        initRow.transportUnit ||
        initRow.vehicleType ||
        (initRow.quantity !== null && initRow.quantity !== undefined && String(initRow.quantity) !== '') ||
        (initRow.totalCont !== null && initRow.totalCont !== undefined && String(initRow.totalCont) !== '') ||
        (initRow.totalWeight !== null && initRow.totalWeight !== undefined && String(initRow.totalWeight) !== '')
      );
      
      if (hasData) {
        setPendingAction(() => () => setPagination(newPagination));
        setShowWarningDialog(true);
      } else {
        setPagination(newPagination);
        // Local data will be cleared by the useEffect above
      }
    } else {
      setPagination(newPagination);
      // Local data will be cleared by the useEffect above
    }
  };

  // Confirm pending action and lose unsaved changes
  const confirmPageChange = () => {
    if (pendingAction) {
      pendingAction();
      // Clear all local data when confirming page change
      setLocalData([]);
      setEditedRows(new Set());
      setPendingAction(null);
    }
    setShowWarningDialog(false);
  };

  // Cancel pending action
  const cancelPageChange = () => {
    setPendingAction(null);
    setShowWarningDialog(false);
  };

  // Ensure booking change resets pagination and refetches automatically with warning if edited
  const setSelectedBooking = (booking: SelectionOption | null) => {
    const apply = () => {
      _setSelectedBooking(booking);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      // Don't clear local data immediately - let the useEffect handle it when new data arrives
    };
    
    // If resetting filter (booking = null), don't show warning - just apply
    if (booking === null) {
      apply();
      return;
    }
    
    // Only show warning if there are actual data changes in the init row
    if (editedRows.size > 0) {
      // Check if the init row has meaningful data
      const initRow = localData[0];
      const hasData = initRow && initRow.isNew && !!(
        initRow.bookingCode ||
        (initRow.supplierId && initRow.supplierId > 0) ||
        initRow.transportUnit ||
        initRow.vehicleType ||
        (initRow.quantity !== null && initRow.quantity !== undefined && String(initRow.quantity) !== '') ||
        (initRow.totalCont !== null && initRow.totalCont !== undefined && String(initRow.totalCont) !== '') ||
        (initRow.totalWeight !== null && initRow.totalWeight !== undefined && String(initRow.totalWeight) !== '')
      );
      
      if (hasData) {
        setPendingAction(() => apply);
        setShowWarningDialog(true);
      } else {
        apply();
      }
    } else {
      apply();
    }
  };

  // Parse DD/MM/YYYY or ISO to ISO string for payload (YYYY-MM-DD or full ISO)
  const normalizeDateForPayload = (value: string): string => {
    if (!value) return '';
    // DD/MM/YYYY
    if (value.includes('/')) {
      const [dd, mm, yyyy] = value.split('/');
      if (dd && mm && yyyy) {
        const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T00:00:00`;
        return iso;
      }
    }
    // Already like YYYY-MM-DD
    if (value.length === 10 && value.includes('-')) return `${value}T00:00:00`;
    return value;
  };

  // Create a single row immediately when completing last cell
  const handleCreateRow = async (rowIndex: number) => {
    const row = localData[rowIndex];
    if (!row || !row.isNew) return;

    // Validate
    try {
      const validationData = {
        ...row,
        supplierId: Number(row.supplierId) || 0,
        quantity: row.quantity !== null && row.quantity !== undefined && String(row.quantity) !== '' ? Number(row.quantity) : null,
        totalCont: row.totalCont !== null && row.totalCont !== undefined && String(row.totalCont) !== '' ? Number(row.totalCont) : null,
        totalWeight: row.totalWeight !== null && row.totalWeight !== undefined && String(row.totalWeight) !== '' ? Number(row.totalWeight) : null
      };
      await rowValidationSchema.validate(validationData);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        enqueueSnackbar(error.message, { variant: 'error' });
        return;
      }
    }

    try {
      const shippingScheduleId = bookingMap[row.bookingCode]?.id || row.shippingScheduleId || 0;
      if (shippingScheduleId === 0 && row.bookingCode) {
        throw new Error(`Không tìm thấy thông tin booking cho mã: ${row.bookingCode}`);
      }

      const payload: TruckScheduleFormData = {
        id: null,
        shippingScheduleId,
        supplierId: Number(row.supplierId),
        transportUnit: row.transportUnit,
        vehicleType: row.vehicleType,
        loadingDate: normalizeDateForPayload(row.loadingDate),
        totalCont: row.totalCont !== null && row.totalCont !== undefined && String(row.totalCont) !== '' ? Number(row.totalCont) : null,
        totalWeight: row.totalWeight !== null && row.totalWeight !== undefined && String(row.totalWeight) !== '' ? Number(row.totalWeight) : null,
        quantity: row.quantity !== null && row.quantity !== undefined && String(row.quantity) !== '' ? Number(row.quantity) : null
      };

      const saved = await truckScheduleApi.bulkSave([payload]);
      const savedOne = saved && saved.length > 0 ? saved[0] : undefined;

      // Update current row with returned id and mark as not new/edited
      setLocalData((prev) => {
        const copy = [...prev];
        if (savedOne) {
          copy[rowIndex] = {
            ...copy[rowIndex],
            id: savedOne.id,
            shippingScheduleId: savedOne.shippingScheduleId,
            loadingDate: savedOne.loadingDate ? savedOne.loadingDate.split('T')[0] : copy[rowIndex].loadingDate,
            isNew: false,
            isEdited: false
          };
        } else {
          copy[rowIndex] = {
            ...copy[rowIndex],
            isNew: false,
            isEdited: false
          };
        }
        // Prepend a fresh blank row
        return [createBlankRow(), ...copy];
      });

      // Shift edited indices and clear edits
      setEditedRows(new Set());
      enqueueSnackbar('Tạo dòng thành công!', { variant: 'success' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Tạo dòng thất bại!';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Save edited rows (exclude newly created rows which are posted immediately)
  const handleSaveRows = async () => {
    const editedExisting = localData.filter((row, index) => editedRows.has(index) && !!row.id && !row.isNew);

    if (editedExisting.length === 0) {
      enqueueSnackbar('Không có dữ liệu nào để lưu!', { variant: 'warning' });
      return;
    }

    // Validate
    for (const row of editedExisting) {
      try {
        const validationData = {
          ...row,
          supplierId: Number(row.supplierId) || 0,
          quantity: row.quantity !== null && row.quantity !== undefined && String(row.quantity) !== '' ? Number(row.quantity) : null,
          totalCont: row.totalCont !== null && row.totalCont !== undefined && String(row.totalCont) !== '' ? Number(row.totalCont) : null,
          totalWeight: row.totalWeight !== null && row.totalWeight !== undefined && String(row.totalWeight) !== '' ? Number(row.totalWeight) : null
        };
        await rowValidationSchema.validate(validationData);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          enqueueSnackbar(error.message, { variant: 'error' });
          return;
        }
      }
    }

    try {
      const payload: TruckScheduleFormData[] = editedExisting.map((row) => {
        const shippingScheduleId = bookingMap[row.bookingCode]?.id || row.shippingScheduleId || 0;
        if (shippingScheduleId === 0 && row.bookingCode) {
          throw new Error(`Không tìm thấy thông tin booking cho mã: ${row.bookingCode}`);
        }
        return {
          id: row.id,
          shippingScheduleId,
          supplierId: Number(row.supplierId),
          transportUnit: row.transportUnit,
          vehicleType: row.vehicleType,
          loadingDate: normalizeDateForPayload(row.loadingDate),
          totalCont: row.totalCont !== null && row.totalCont !== undefined && String(row.totalCont) !== '' ? Number(row.totalCont) : null,
          totalWeight: row.totalWeight !== null && row.totalWeight !== undefined && String(row.totalWeight) !== '' ? Number(row.totalWeight) : null,
          quantity: row.quantity !== null && row.quantity !== undefined && String(row.quantity) !== '' ? Number(row.quantity) : null
        };
      });

      await truckScheduleApi.bulkSave(payload);
      enqueueSnackbar('Lưu dữ liệu thành công!', { variant: 'success' });
      setEditedRows(new Set());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lưu dữ liệu thất bại!';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Delete row
  const handleDeleteRow = async (rowData: TableRowData, deletedIndex: number) => {
    if (rowData.id && !rowData.isNew) {
      try {
        await truckScheduleApi.delete(rowData.id as number);
        enqueueSnackbar('Xóa dữ liệu thành công!', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Xóa dữ liệu thất bại!', { variant: 'error' });
        return;
      }
    }

    // Remove from local data - SWR will auto-revalidate for server data
    const updatedData = localData.filter((_, index) => index !== deletedIndex);
    setLocalData(updatedData);
    
    // Update edited rows indices
    setEditedRows(prev => {
      const newSet = new Set<number>();
      prev.forEach(index => {
        if (index < deletedIndex) {
          // Keep indices before deleted row
          newSet.add(index);
        } else if (index > deletedIndex) {
          // Shift indices after deleted row down by 1
          newSet.add(index - 1);
        }
        // Skip the deleted index
      });
      return newSet;
    });
  };

  return {
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
    handleDeleteRow,
    
    // Helper functions
    findBookingCodeById,
    findSupplierNameById,
    findTransportNameByCode,
    findVehicleTypeNameByCode
  };
};
