import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { PAGE_LIMIT } from '../../../constants';
// material-ui
import Grid from '@mui/material/Grid';
// third-party
import { SALE_CONTRACT_API } from 'api/constants';
// project imports
import { openSnackbar } from 'api/snackbar';
import AlertColumnDelete from 'sections/apps/kanban/Board/AlertColumnDelete';
// types
import { SnackbarProps } from 'types/snackbar';
import axiosServices from 'utils/axios';
// assets
import { columns } from './columns';
import { SaleContractDataItem, TabCounts, TableRowData } from './models';
import { ReactTable } from './table';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import SyntheticForm, { SyntheticFormData } from './syntheticform';
import { PURCHASE_CONTRACT_SHIPPING_SCHEDULE } from 'api/constants';
import { CodeBooking } from './models';
import { startDataImport } from './callback';

export default function CustomSeaList() {
  const navigation = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = parseInt(searchParams.get('size') || PAGE_LIMIT.toString(), 10);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiData, setApiData] = useState<SaleContractDataItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabCounts, setTabCounts] = useState<TabCounts | null>(null);
  const [openSyntheticDialog, setOpenSyntheticDialog] = useState(false);
  const [currentApprovalData, setCurrentApprovalData] = useState<TableRowData | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'status', desc: false }]);
  const [newSyntheticId, setNewSyntheticId] = useState(0); // State để lưu ID mới tạo
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    if (typeof updater === 'function') {
      setSorting(updater);
    } else {
      setSorting(updater);
    }
  };
  const handleOpenDialog = (data: TableRowData) => {
    setCurrentApprovalData(data);
    setOpenSyntheticDialog(true); // Sử dụng state mới này
  };

  const handleCloseDialog = () => {
    setOpenSyntheticDialog(false); // Đóng dialog từ state chính
    setCurrentApprovalData(null);
  };

  const handleSubmitSynthetic = async (formData: SyntheticFormData) => {
    if (!currentApprovalData) return;

    try {
      const payload = {
        code: formData.code || '',
        status: formData.status || 1,
        lastUpdatedProgram: formData.lastUpdatedProgram || 'CustomSeaList',
        locationCode: formData.locationCode || '',
        endLocationCode: formData.endLocationCode || '',
        totalTaxableValue: formData.totalTaxableValue || null,
        estimatedDepartureDate: formData.estimatedDepartureDate ? formData.estimatedDepartureDate.toISOString() : '',
        shippingDepartureDate: formData.shippingDepartureDate ? formData.shippingDepartureDate.toISOString() : '',
        shippingScheduleId: currentApprovalData.idPo
      };

      // const syntheticResponse = await axiosServices.post(
      //       'your-api-endpoint', 
      //       payload
      //     );

      const response = await fetch('https://localhost:44364/api/synthetic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('serviceToken') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      // Lấy ID từ response
      const syntheticId = responseData.data.id;
      setNewSyntheticId(syntheticId);

      // Bây giờ thực hiện logic phê duyệt (tương tự code comment)
      if (!currentApprovalData.bookingNumber) {
        openSnackbar({
          open: true,
          message: 'Chức năng này chỉ dành cho Booking.',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: { color: 'warning', severity: 'warning' }
        } as SnackbarProps);
        return;
      }

      const saleContractId = currentApprovalData.saleContractId;
      const saleContractResponse = await axiosServices.get(`${SALE_CONTRACT_API.GET_BY_ID}/${saleContractId}`);

      const saleContractData: SaleContractDataItem = saleContractResponse.data.data;

      const saleContractToUpdate = saleContractData;
      if (!saleContractToUpdate) throw new Error('Không tìm thấy hợp đồng bán tương ứng.');

      const poId = currentApprovalData.idPo;
      const purchaseContractShippingResponse = await axiosServices.get(
        `${PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON}/${poId}`
      );
      const purchaseContractShippingData: CodeBooking = purchaseContractShippingResponse.data.data;
      if (!purchaseContractShippingData) throw new Error('Không tìm thấy hợp đồng mua tương ứng.');

      // Gọi startDataImport với thêm syntheticId
      await startDataImport(
        saleContractToUpdate.contractId,
        saleContractToUpdate.id,
        fetchData,
        saleContractToUpdate,
        purchaseContractShippingData,
        poId,
        syntheticId
      );

      handleCloseDialog();
      // Your API call here
      console.log('Submitting synthetic data:', payload);

      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting synthetic data:', error);
    }
  };
  const buildParamsForFetchData = () => {
    const params = new URLSearchParams();
    params.append('page', (page + 1).toString());
    params.append('size', size.toString());
    // if (sorting.length > 0) {
    //   const { id, desc } = sorting[0];
    //   params.append('SortBy', id);
    //   params.append('SortDirection', desc ? 'desc' : 'asc');
    // }
    if (sorting && sorting.length > 0) {
      const sort = sorting[0];
      params.append('SortBy', sort.id);
      params.append('SortDirection', sort.desc ? 'desc' : 'asc');
    }
    if (searchQuery) {
      params.append('SaleContractCode', searchQuery.trim().replace(/\s/g, ''));
    }

    const tabConfigMap: { [key: string]: number } = {
      'Hoàn thành': 3,
      'Chờ duyệt': 2,
      'Thất bại': 4
    };

    if (activeTab && activeTab !== 'All') {
      const status = tabConfigMap[activeTab];
      if (status !== undefined) {
        params.append('Status', status.toString());
      }
    }

    return params;
  };

  const buildParamsForFetchCount = () => {
    const paramsForCount = new URLSearchParams();
    if (searchQuery) {
      paramsForCount.append('SaleContractCode', searchQuery.trim().replace(/\s/g, ''));
    }
    return paramsForCount;
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const { data, status } = await axiosServices.get(SALE_CONTRACT_API.GET_PAGE + `?${buildParamsForFetchData()}`);
      if (!(status === 200 || status === 201)) {
        throw new Error('Network response was not ok');
      }
      setApiData(data.data || []);
      // console.log('data: ', data.data || []);
      setMeta(data.meta || { page: 1, size: 10, total: 0, totalPages: 1 });
    } catch (error) {
      setError('Failed to fetch data');
      setApiData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabCounts = async () => {
    try {
      const { data, status } = await axiosServices.get(SALE_CONTRACT_API.GET_COUNT + `?${buildParamsForFetchCount()}`);
      if (status === 200) {
        // console.log('Tab Counts from API:', data.data);
        setTabCounts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tab counts:', error);
      setTabCounts({
        activeCount: 0,
        inactiveCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        requestApproveCount: 0,
        totalCount: 0
      });
    }
  };

  useEffect(() => {
    fetchTabCounts();
    fetchData();
  }, [page, size, searchQuery, activeTab, sorting]);

  const transformToTableRowData = (item: SaleContractDataItem): TableRowData => {
    const getStatusCode = (status: number) => {
      switch (status) {
        case 3:
          return 'Hoàn thành';
        case 2:
          return 'Chờ duyệt';
        case 4:
          return 'Thất bại';
        default:
          return 'Không xác định';
      }
    };

    const bookingRows: TableRowData[] = (item.codeBookings || []).map((booking) => ({
      id: `booking-${booking?.id}`,
      idPo: booking?.id,
      saleContractId: item?.id || 0,
      type: 'codeBooking',
      bookingType: 'Xuất khẩu',
      bookingNumber: booking?.bookingNumber || 'N/A',
      productName: item?.goodName || 'N/A',
      ETADate: booking?.etaDate || 'N/A',
      customer: 'N/A', // Will be filled from parent
      customerId: item?.customerId || 0,
      totalAmount: item?.totalAmount || 0,
      quantity: item?.totalWeight || 0,
      status: getStatusCode(booking?.status || 0),
      contractId: item?.contractId || 0,
      customerCode: item?.customerCode || 'N/A',
      customerAddress: item?.customerAddress || 'N/A',
      customerPhone: item?.customerPhone || 'N/A',
      customerName: item?.customerName || 'N/A',
      goodName: item?.goodName || 'N/A',
      goodDescription: item?.goodDescription || 'N/A',
      paymentTerm: item?.paymentTerm || 'N/A',
      deliveryTerm: item?.deliveryTerm || 'N/A',
      unitPrice: item?.unitPrice || 0,
      totalWeight: item?.totalWeight || 0,
      lcNumber: item?.lcNumber || 'N/A',
      lcDate: item?.lcDate || 'N/A',

      goodId: item?.goodId || 0,
      goodType: item?.goodType || 'N/A',
      shipName: booking?.shipName || 'N/A',
      exportPort: booking?.exportPort || 'N/A',
      importPort: booking?.importPort || 'N/A',
      containerQuantity: booking?.containerQuantity || 0
    }));

    const TotalAmount = item?.totalAmount || 0;

    const mainRow: TableRowData = {
      id: `saleContract-${item?.id}`,
      type: 'saleContract',
      saleContractCode: item?.saleContractCode || 'N/A',
      saleContractName: item?.goodName || 'N/A',
      contractType: 'Hợp đồng bán',
      ContractDate: item?.contractDate || 'N/A',
      customer: item?.customerName || 'N/A',
      status: getStatusCode(item?.status || 0),
      notes: item?.notes || 'N/A',
      TotalAmount,
      subRows: bookingRows,
      customerCode: item?.customerCode || 'N/A',
      customerAddress: item?.customerAddress || 'N/A',
      customerPhone: item?.customerPhone || 'N/A',
      customerId: item?.customerId || 0,
      goodId: item?.goodId || 0,
      goodName: item?.goodName || 'N/A',
      goodDescription: item?.goodDescription || 'N/A',
      paymentTerm: item?.paymentTerm || 'N/A',
      deliveryTerm: item?.deliveryTerm || 'N/A',
      unitPrice: item?.unitPrice || 0,
      totalWeight: item?.totalWeight || 0,
      lcNumber: item?.lcNumber || 'N/A',
      lcDate: item?.lcDate || 'N/A'
    };

    return mainRow;
  };

  const list = useMemo(() => {
    if (!apiData) return [];
    return apiData.map((item) => transformToTableRowData(item));
  }, [apiData]);

  const [contractId, setContractId] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleClose = (status: boolean) => {
    if (status) {
      openSnackbar({
        open: true,
        message: 'Contract deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
    setAlertOpen(false);
  };
  // const tableColumns = columns(navigation, fetchData);
  const tableColumns = columns(navigation, fetchData, handleOpenDialog, newSyntheticId);

  return (
    <>
      <Grid spacing={2}>
        <ReactTable
          {...{
            data: list,
            columns: tableColumns,
            meta,
            page,
            size,
            activeTab,
            setActiveTab,
            searchQuery,
            setSearchQuery,
            tabCounts,
            loading,
            error,
            sorting,
            setSorting: handleSortingChange
          }}
        />
        <AlertColumnDelete title={`Contract #${contractId}`} open={alertOpen} handleClose={handleClose} />
      </Grid>
      <SyntheticForm
        open={openSyntheticDialog}
        onClose={handleCloseDialog}
        data={currentApprovalData}
        onSubmit={handleSubmitSynthetic}
      />
    </>
  );
}