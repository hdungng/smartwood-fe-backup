import { SnackbarProps } from 'types/snackbar';
import { openSnackbar } from 'api/snackbar';
import { PURCHASE_CONTRACT_SHIPPING_SCHEDULE, SALE_CONTRACT_API } from 'api/constants';
import axiosServices from 'utils/axios';
import { CodeBooking, SaleContractDataItem } from './models';

export const startDataImport = async (
  contractId: number,
  saleContractId: number,
  fetchData: () => void,
  saleContractToUpdate: SaleContractDataItem,
  purchaseContractShippingData: CodeBooking,
  poId?: any,
  syntheticId?: number // Thêm tham số syntheticId
) => {
  try {
    const requestId = Math.random().toString(36).substring(7);
    const BACKEND_URL = 'http://10.0.1.25:8000/api/v1';
    const callbackUrl = `${BACKEND_URL}/callback/${requestId}`;
    // console.log('callbackUrl: ', callbackUrl);

    // Gửi request đến BE để bắt đầu import
    const response = await fetch(`${BACKEND_URL}/export_contract_data_internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          sale_contract_id: saleContractId,
          contract_id: contractId,
          code_booking_id: poId,
          synthetic_id: syntheticId // Truyền thêm syntheticId nếu có
        },
        callback: callbackUrl
      })
    });

    if (!response.ok) throw new Error('Failed to start import');

    // console.log('Đã gửi yêu cầu bắt đầu import dữ liệu!');

    // console.log('Đang đợi phản hồi từ BE...');

    // Tạo kết nối SSE
    const es = new EventSource(`${BACKEND_URL}/events/${requestId}`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log('Received SSE message:', data);

      switch (data.type) {
        case 'callback_received':
          // console.log('Processing callback:', data);

          if (data.success) {
            openSnackbar({
              open: true,
              message: 'Import dữ liệu thành công!',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'success', severity: 'success' }
            } as SnackbarProps);
            // console.log('Dữ liệu import:', data);
            // console.log('Import thành công, cập nhật sale contract...');
            const updatedSaleContract = { ...saleContractToUpdate, status: 0 };
            const updatedPurchaseContractShipping = { ...purchaseContractShippingData, status: 3 };
            // const payload = {
            //   ...saleContractToUpdate,
            //   status: 3,
            //   lastUpdatedProgram: updatedSaleContract.lastUpdatedProgram || 'Client Update',
            //   lcDate: updatedSaleContract.lcDate || new Date().toISOString(),
            //   paymentDeadline: updatedSaleContract.paymentDeadline || new Date().toISOString()
            // };
            const payload = updatedPurchaseContractShipping;

            axiosServices
              .put(`${PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON}/${poId}`, payload)
              .then(() => {
                fetchData();
                // console.log('Cập nhật contract thành công!');
              })
              .catch((err) => {
                console.error('Lỗi khi update contract:', err);
              });
          } else {
            openSnackbar({
              open: true,
              message: `Lỗi khi import dữ liệu: ${data.message || 'Không xác định'}`,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'error', severity: 'error' }
            } as SnackbarProps);
            const updatedSaleContract = { ...saleContractToUpdate, status: 0 };

            const updatedPurchaseContractShipping = { ...purchaseContractShippingData, status: 4 };

            // const payload = {
            //   ...saleContractToUpdate,
            //   status: 4,
            //   lastUpdatedProgram: updatedSaleContract.lastUpdatedProgram || 'Client Update',
            //   lcDate: updatedSaleContract.lcDate || new Date().toISOString(),
            //   paymentDeadline: updatedSaleContract.paymentDeadline || new Date().toISOString()
            // };

            const payload = updatedPurchaseContractShipping;

            axiosServices
              .put(`${PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON}/${poId}`, payload)
              .then(() => {
                fetchData();
                // console.log('Cập nhật contract thành công!');
              })
              .catch((err) => {
                console.error('Lỗi khi update contract:', err);
              });
          }

          es.close();
          break;

        case 'completed':
          es.close();
          break;

        case 'error':
          console.error('SSE error:', data.message);
          es.close();
          break;
      }
    };

    es.onerror = (err) => {
      console.error('EventSource error:', err);
      es.close();
      openSnackbar({
        open: true,
        message: 'Lỗi kết nối SSE',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error', severity: 'error' }
      } as SnackbarProps);
    };
    window.addEventListener(
      'beforeunload',
      () => {
        es.close();
      },
      { once: true }
    );
  } catch (error) {
    openSnackbar({
      open: true,
      message: `Lỗi khi bắt đầu import: ${error instanceof Error ? error.message : String(error)}`,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: { color: 'error', severity: 'error' }
    } as SnackbarProps);
  }
};