import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ColumnDef } from '@tanstack/react-table';
import { CODEDELTAIL_API, PURCHASE_CONTRACT_SHIPPING_SCHEDULE, SALE_CONTRACT_API } from 'api/constants';
import { openSnackbar } from 'api/snackbar';
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { useEffect, useMemo, useState } from 'react';
import { SnackbarProps } from 'types/snackbar';
import axiosServices from 'utils/axios';
import { EllipsisText } from 'utils/ellipsisText';
import { formatDate } from 'utils/formatDate';
import { handleDownloadExcel } from 'utils/handleDownloadExcel';
import { COData } from './codata';
import { CodeBooking, SaleContractDataItem, TableRowData } from './models';
import { startDataImport } from './callback';
import dayjs from 'dayjs';
import { LabelKeyObject } from 'react-csv/lib/core';

const handleDownloadInputExcel = async (data: TableRowData) => {
  try {
    const poId = data?.idPo;
    const saleContractId = data?.saleContractId;

    let replacements: { [key: string]: string } = {
                        '1': '',
                        '2': data.bookingNumber || '',
                        '3': '',
                        '4': '',
                        '5': '',
                        '6': '',
                        '7': '',
                        '8': '',
                        '9': '',
                        '10': '',
                        '11': '',
                        '12': '',
                        '13': '',
                        '14': '',
                        '15': '',
                        '16': '',
                        '17': 'Vietnam',
                        '18': '',
                        '19': '',
                        '20': '',
                        '21': '',
                        '22': '',
                        '23': '',
                        '24': '',
                        '25': '',
                        '26': data.notes || '',
                        DPL: '[]',
                        CSHT: '[]'
                      };

    const { data: apiData } = await axiosServices.get(`${SALE_CONTRACT_API.GET_BY_ID}/${saleContractId}`);
    const saleContractData: SaleContractDataItem = apiData.data;



    const codeGetHSCODE = await axiosServices.get(`${CODEDELTAIL_API.COMMON}/190`);
    const hscode = codeGetHSCODE.data.data;
    console.log('HSCODE:', hscode?.value);
    
    const purchaseContractShippingResponse = await axiosServices.get(
      `${PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON}/${poId}`
    );
    const booking: CodeBooking = purchaseContractShippingResponse.data.data;
    
    // build replacements ở đây...
    if(booking) replacements = {
      ...replacements,
      '1': 'INPUT ' + (saleContractData.goodDescription || '').toUpperCase(),
                            '2': saleContractData.saleContractCode || data.bookingNumber || '',
                            '3': formatDate(saleContractData.createdAt) || '',
                            '4': saleContractData.customerName || '',
                            '5': saleContractData.customerAddress || '',
                            '6': saleContractData.customerName || '',
                            '7': saleContractData.customerPhone || '',
                            '8': saleContractData.saleContractCode || data.bookingNumber || '',
                            '9': saleContractData.paymentTerm || '',
                            '10': saleContractData.deliveryTerm || '',
                            '11': booking.exportPort || '',
                            '12': booking.importPort || '',
                            '13': booking.shipName || '',
                            '14': formatDate(saleContractData.contractDate) || '',
                            '15': '',
                            '16': saleContractData.goodName || '',
                            '18': hscode?.value || '44013100',
                            '19': saleContractData.deliveryTerm || '',
                            '20': saleContractData.unitPrice?.toString() || '0',
                            '21':
                              booking?.weightTicketExport
                                ?.map((wt) => wt.weightNet)
                                .reduce((sum, wt) => sum + wt, 0)
                                .toString() ||
                              '0' ||
                              saleContractData.weightTickets
                                .map((wt) => wt.weightNet)
                                .reduce((sum, wt) => sum + wt, 0)
                                .toString() ||
                              '0',
                            // saleContractData.totalWeight?.toString() || '0',
                            '22':
                              booking?.weightTicketExport
                                ?.map((wt) => wt.weightGross)
                                .reduce((sum, wt) => sum + wt, 0)
                                .toString() ||
                              '0' ||
                              saleContractData.weightTickets
                                .map((wt) => wt.weightGross)
                                .reduce((sum, wt) => sum + wt, 0)
                                .toString() ||
                              '0',
                            // ((saleContractData.totalWeight || 0) * (saleContractData.unitPrice || 0)).toString(),
                            '23': booking.containerQuantity?.toString() || '0',
                            '24': saleContractData.lcNumber || '',
                            '25': formatDate(saleContractData.lcDate) || '',
                            '26': saleContractData.notes || '',
                            DPL: JSON.stringify(booking?.weightTicketExport || saleContractData.weightTickets || []),
                            CSHT: JSON.stringify(
                              (booking?.weightTicketExport || saleContractData.weightTickets || []).map((item) => ({
                                ...item,
                                bookingNumber: booking?.bookingNumber
                              }))
                            )
    };

    const response = await fetch('http://20.195.15.250:6060/excel/generate-excel/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replacements })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INPUT ${data.bookingNumber || 'UNKNOWN BOOKING'}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    openSnackbar({
      open: true,
      message: error.message || 'Failed to download INPUT Excel.',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: { color: 'error', severity: 'error' }
    } as SnackbarProps);
  }
};
const handleDownloadCOExcel = async (data: TableRowData) => {
  try {
    const saleContractId = data?.saleContractId;
    const { data: apiData } = await axiosServices.get(`${SALE_CONTRACT_API.GET_BY_ID}/${saleContractId}`);
    const saleContractData: SaleContractDataItem = apiData.data;

    // booking có thể lấy tương tự trên hoặc lấy từ FE nếu đã load
    //const booking = saleContractData.codeBookings.find((cb) => cb.bookingNumber === data.bookingNumber);
    const poId = data?.idPo;

    const purchaseContractShippingResponse = await axiosServices.get(
      `${PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON}/${poId}`
    );
    const booking: CodeBooking = purchaseContractShippingResponse.data.data;
    const fileChecking = `INPUT ${data.bookingNumber}`
    const filename = `CO_${data.bookingNumber || 'UNKNOWN'}.xlsx`;
    handleDownloadExcel(COData(fileChecking, saleContractData, booking), filename);
  } catch (error: any) {
    openSnackbar({
      open: true,
      message: error.message || 'Failed to download CO Excel.',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: { color: 'error', severity: 'error' }
    } as SnackbarProps);
  }
};
export const getCsvHeaders = (): LabelKeyObject[] => [
  { label: 'Số Hợp đồng', key: 'saleContractCode' },
  { label: 'Tên Hợp đồng', key: 'saleContractName' },
  { label: 'Số Booking', key: 'bookingNumber' },
  { label: 'Tên Sản phẩm/Hàng hóa', key: 'productName' },
  { label: 'Loại Hợp đồng', key: 'contractType' },
  { label: 'Loại Booking', key: 'bookingType' },
  { label: 'Ngày Ký HĐ / ETA', key: 'transactionDate' },
  { label: 'Đối tác', key: 'customerName' },
  { label: 'Mã khách hàng', key: 'customerCode' },
  { label: 'Địa chỉ khách hàng', key: 'customerAddress' },
  { label: 'Số điện thoại khách hàng', key: 'customerPhone' },
  { label: 'Tổng giá trị', key: 'totalAmountFormatted' },
  { label: 'Tổng số lượng/Trọng lượng', key: 'totalQuantityWeight' },
  { label: 'Đơn giá', key: 'unitPrice' },
  { label: 'Tổng trọng lượng', key: 'totalWeight' },
  { label: 'Số LC', key: 'lcNumber' },
  { label: 'Ngày LC', key: 'lcDate' },
  { label: 'Điều khoản thanh toán', key: 'paymentTerm' },
  { label: 'Điều khoản giao hàng', key: 'deliveryTerm' },
  { label: 'Tên tàu', key: 'shipName' },
  { label: 'Cảng xuất', key: 'exportPort' },
  { label: 'Cảng nhập', key: 'importPort' },
  { label: 'Số lượng container', key: 'containerQuantity' },
  { label: 'Trạng thái', key: 'status' },
  { label: 'Ghi chú', key: 'notes' }
];

export const columns = (navigation: any, fetchData: () => void, handleOpenDialog: (data: TableRowData) => void, newSyntheticId: number) =>
  useMemo<ColumnDef<TableRowData>[]>(
    () => [
      {
        id: 'expander',
        header: '',
        meta: { csvCanGetValue: false },
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton
              onClick={row.getToggleExpandedHandler()}
              size="small"
              sx={{
                p: 0.5,
                ml: row.depth * 2,
                color: 'primary.main'
              }}
            >
              {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
            </IconButton>
          ) : null;
        }
      },
      {
        id: 'select',
        meta: { csvCanGetValue: false },

        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: 'Thông tin hợp đồng',
        accessorKey: 'saleContractCode',
        meta: { csvLabel: 'Thông tin hợp đồng', csvCanGetValue: true },
        cell: ({ row }) => {
          const original = row.original;
          const depth = row.depth;

          if (depth === 0) {
            return (
              <Box sx={{ pl: depth * 2 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      flexShrink: 0
                    }}
                  />
                  <Box>
                    <EllipsisText
                      text={`${original?.saleContractCode}`}
                      variant="subtitle1"
                      maxWidth={250}
                      sx={{ fontWeight: 600, color: 'primary.main' }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {original?.saleContractName}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          } else {
            return (
              <Box sx={{ pl: depth * 4 + 2 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      flexShrink: 0
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'secondary.main' }}>
                      {original?.bookingNumber}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {original?.productName}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          }
        }
      },
      {
        header: 'Loại',
        accessorKey: 'contractType',
        meta: { className: 'cell-center', csvLabel: 'Loại', csvCanGetValue: true },
        cell: ({ row }) => {
          const original = row.original;
          const depth = row.depth;
          const type = depth === 0 ? original?.contractType : original?.bookingType;
          const color = depth === 0 ? 'info' : 'secondary';

          return <Chip label={type} size="small" variant="outlined" color={color} sx={{ fontWeight: 500 }} />;
        }
      },
      {
        header: 'Ngày',
        accessorKey: 'ContractDate',
        meta: { className: 'cell-center', csvLabel: 'Ngày', csvCanGetValue: true },
        cell: ({ row }) => {
          const original = row.original;
          const depth = row.depth;
          const date = depth === 0 ? original?.ContractDate : original?.ETADate;
          const label = depth === 0 ? 'Ký' : 'Giao';

          const formattedDate = formatDate(date);

          return formattedDate ? (
            <Box textAlign={'center'}>
              <Box width={'max-content'} p={'2px'} sx={{ margin: 'auto' }}>
                <Typography variant="body2">{formattedDate}</Typography>
                <Typography color="textSecondary" textAlign={'left'}>
                  {label}
                </Typography>
              </Box>
            </Box>
          ) : null;
        }
      },

      {
        header: 'Ngày còn lại',
        accessorKey: 'ETADate',
        meta: { className: 'cell-center', csvLabel: 'Thời gian còn lại', csvCanGetValue: true },
        cell: ({ row, getValue }) => {
          const ETADate = getValue() as string;
          const original = row.original;
          const depth = row.depth;
          if (!ETADate) return null;

          const remainingDays = dayjs(ETADate).diff(dayjs(), 'day');

          if (remainingDays < 0 && original?.status !== 'Hoàn thành') {
            return <Chip label={`Quá hạn ${Math.abs(remainingDays)} ngày`} size="small" color="error" variant="outlined" />;
          }

          return <Chip label={`${remainingDays} ngày`} size="small" color="success" variant="outlined" />;
        }
      },
      {
        header: 'Đối tác',
        accessorKey: 'CustomerName',
        meta: { csvLabel: 'Đối tác', csvCanGetValue: true },
        cell: ({ row }) => {
          const original = row.original;
          const depth = row.depth;

          let partner, label, customerCode, customerAddress, customerPhone;
          if (depth === 0) {
            partner = original?.customer ? original?.customer : original?.customerName ? original?.customerName : 'N/A';
            label = 'Khách hàng';
            // customerCode = original?.customerCode;
            // customerAddress = original?.customerAddress;
            // customerPhone = original?.customerPhone;
          } else {
            partner = null;
            label = null;
          }

          return partner ? (
            <Box sx={{ display: 'grid' }}>
              <EllipsisText text={partner} maxWidth={100} variant="body2" sx={{ fontWeight: 500 }} />
              <Typography variant="caption" color="textSecondary">
                {label}
              </Typography>
              {/* {partner} {customerCode && `(${customerCode})`} */}

              {/* <Typography variant="caption" color="textSecondary">
                {customerAddress}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                {customerPhone}
              </Typography> */}
            </Box>
          ) : null;
        }
      },
      {
        header: 'Giá trị',
        accessorKey: 'TotalAmount',
        meta: { className: 'cell-right', csvLabel: 'Giá trị', csvCanGetValue: true },
        cell: ({ row }) => {
          const original = row.original;
          const depth = row.depth;
          let value, quantity;

          if (depth === 0) {
            value = original?.TotalAmount ? original?.TotalAmount : 0;
          } else {
            value = original?.totalAmount ? original?.totalAmount : 0;
            quantity = original?.quantity ? original?.quantity : 0;
          }

          return value ? (
            <Box sx={{ textAlign: 'right' }}>
              {depth === 0 ? (
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                </Typography>
              ) : null}
              {quantity && depth === 0 && (
                <Typography variant="caption" color="textSecondary">
                  SL: {quantity.toLocaleString()}
                </Typography>
              )}
            </Box>
          ) : null;
        }
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        meta: { className: 'cell-center', csvLabel: 'Trạng thái', csvCanGetValue: true },
        cell: ({ getValue }) => {
          const statusValue = getValue() as string;

          let color: 'success' | 'warning' | 'error' | 'default';
          switch (statusValue) {
            case 'Hoàn thành':
              color = 'success';
              break;
            case 'Chờ duyệt':
              color = 'warning';
              break;
            case 'Thất bại':
              color = 'error';
              break;
            default:
              color = 'default';
          }

          return <Chip color={color} label={statusValue} size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
        }
      },
      {
        header: 'Thao tác',
        meta: {
          className: 'cell-center',
          csvCanGetValue: false
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const data = row.original;

          if (row.depth > 0) {
            return (
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <Tooltip title="Tải xuống">
                  <IconButton
                    color="primary"
                    size="small"
                     onClick={() => handleDownloadInputExcel(data)}
                    // onClick={async (e: any) => {
                    //   e.stopPropagation();
                    //   // console.log('Downloading data for Booking:', data.bookingNumber);
                    //   const poId = data?.idPo;
                    //   // console.log('PO ID:', poId);
                    //   const saleContractId = data?.saleContractId;
                    //   let replacements: { [key: string]: string } = {
                    //     '1': '',
                    //     '2': data.bookingNumber || '',
                    //     '3': '',
                    //     '4': '',
                    //     '5': '',
                    //     '6': '',
                    //     '7': '',
                    //     '8': '',
                    //     '9': '',
                    //     '10': '',
                    //     '11': '',
                    //     '12': '',
                    //     '13': '',
                    //     '14': '',
                    //     '15': '',
                    //     '16': '',
                    //     '17': 'Vietnam',
                    //     '18': '',
                    //     '19': '',
                    //     '20': '',
                    //     '21': '',
                    //     '22': '',
                    //     '23': '',
                    //     '24': '',
                    //     '25': '',
                    //     '26': data.notes || '',
                    //     DPL: '[]',
                    //     CSHT: '[]'
                    //   };

                    //   try {
                    //     const { data: apiData, status } = await axiosServices.get(`${SALE_CONTRACT_API.GET_BY_ID}/${saleContractId}`);
                    //     if (!(status === 200 || status === 201)) {
                    //       throw new Error('Network response was not ok');
                    //     }

                    //     const purchaseContractShippingResponse = await axiosServices.get(
                    //       `${PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON}/${poId}`
                    //     );
                    //     const purchaseContractShippingData: CodeBooking = purchaseContractShippingResponse.data.data;
                    //     if (!purchaseContractShippingData) throw new Error('Không tìm thấy hợp đồng mua tương ứng.');

                    //     const saleContractData: SaleContractDataItem = apiData.data;
                    //     const booking =
                    //       purchaseContractShippingResponse.status !== 200 && purchaseContractShippingResponse.status !== 201
                    //         ? saleContractData.codeBookings.find((cb) => cb.bookingNumber === data.bookingNumber)
                    //         : purchaseContractShippingData;

                    //     if (booking) {
                    //       replacements = {
                    //         ...replacements,
                    //         '1': 'INPUT ' + (saleContractData.goodDescription || '').toUpperCase(),
                    //         '2': saleContractData.saleContractCode || data.bookingNumber || '',
                    //         '3': formatDate(saleContractData.createdAt) || '',
                    //         '4': saleContractData.customerName || '',
                    //         '5': saleContractData.customerAddress || '',
                    //         '6': saleContractData.customerName || '',
                    //         '7': saleContractData.customerPhone || '',
                    //         '8': saleContractData.saleContractCode || data.bookingNumber || '',
                    //         '9': saleContractData.paymentTerm || '',
                    //         '10': saleContractData.deliveryTerm || '',
                    //         '11': booking.exportPort || '',
                    //         '12': booking.importPort || '',
                    //         '13': booking.shipName || '',
                    //         '14': formatDate(saleContractData.contractDate) || '',
                    //         '15': '',
                    //         '16': saleContractData.goodName || '',
                    //         '18': '44013100',
                    //         '19': saleContractData.deliveryTerm || '',
                    //         '20': saleContractData.unitPrice?.toString() || '0',
                    //         '21':
                    //           booking?.weightTicketExport
                    //             ?.map((wt) => wt.weightNet)
                    //             .reduce((sum, wt) => sum + wt, 0)
                    //             .toString() ||
                    //           '0' ||
                    //           saleContractData.weightTickets
                    //             .map((wt) => wt.weightNet)
                    //             .reduce((sum, wt) => sum + wt, 0)
                    //             .toString() ||
                    //           '0',
                    //         // saleContractData.totalWeight?.toString() || '0',
                    //         '22':
                    //           booking?.weightTicketExport
                    //             ?.map((wt) => wt.weightGross)
                    //             .reduce((sum, wt) => sum + wt, 0)
                    //             .toString() ||
                    //           '0' ||
                    //           saleContractData.weightTickets
                    //             .map((wt) => wt.weightGross)
                    //             .reduce((sum, wt) => sum + wt, 0)
                    //             .toString() ||
                    //           '0',
                    //         // ((saleContractData.totalWeight || 0) * (saleContractData.unitPrice || 0)).toString(),
                    //         '23': booking.containerQuantity?.toString() || '0',
                    //         '24': saleContractData.lcNumber || '',
                    //         '25': formatDate(saleContractData.lcDate) || '',
                    //         '26': saleContractData.notes || '',
                    //         DPL: JSON.stringify(booking?.weightTicketExport || saleContractData.weightTickets || []),
                    //         CSHT: JSON.stringify(
                    //           (booking?.weightTicketExport || saleContractData.weightTickets || []).map((item) => ({
                    //             ...item,
                    //             bookingNumber: booking?.bookingNumber
                    //           }))
                    //         )
                    //       };
                    //     }
                    //     // console.log('Replacements for Excel:', replacements);
                    //     const response = await fetch('http://20.195.15.250:6060/excel/generate-excel/', {
                    //       method: 'POST',
                    //       headers: {
                    //         'Content-Type': 'application/json'
                    //       },
                    //       body: JSON.stringify({ replacements })
                    //     });

                    //     if (!response.ok) {
                    //       const errorText = await response.text();
                    //       throw new Error(`Server error: ${response.status} - ${errorText}`);
                    //     }

                    //     const contentDisposition = response.headers.get('Content-Disposition');
                    //     let filename = `INPUT ${data.bookingNumber || 'UNKNOWN BOOKING'}.xlsx`;
                    //     if (contentDisposition) {
                    //       const match = contentDisposition.match(/filename="([^"]+)"/);
                    //       if (match && match[1]) {
                    //         filename = match[1];
                    //       }
                    //     }

                    //     const blob = await response.blob();
                    //     const url = window.URL.createObjectURL(blob);
                    //     const a = document.createElement('a');
                    //     a.href = url;
                    //     a.download = filename;
                    //     document.body.appendChild(a);
                    //     a.click();
                    //     a.remove();
                    //     window.URL.revokeObjectURL(url);
                    //     // console.log('Excel file downloaded successfully!');
                    //     // handleDownloadExcel(COData(filename, saleContractData, booking), filename);
                    //   } catch (error: any) {
                    //     console.error('Error downloading Excel file:', error);
                    //     openSnackbar({
                    //       open: true,
                    //       message: error.message || 'Failed to download Excel file.',
                    //       anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    //       variant: 'alert',
                    //       alert: { color: 'error', severity: 'error' }
                    //     } as SnackbarProps);
                    //   }
                    // }}
                  >
                    <DownloadOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xuất CO">
                    <IconButton
                      color="primary"
                      size="small"
                      // onClick={() => handleDownloadExcel(COData(filename, saleContractData, booking), filename)}
                      onClick={() => handleDownloadCOExcel(data)}
                    >
                      <DownloadOutlined />
                    </IconButton>
                </Tooltip>
                <Tooltip title="ECUS">
                  <IconButton
                    color="success"
                    size="small"
                    onClick={
                      () => handleOpenDialog(data)
                      //   async (e: any) => {
                      //   e.stopPropagation();
                      //   // console.log('Approving contract for Booking:', data.bookingNumber);
                      //   const poId = data?.idPo;
                      //   // console.log('PO ID for approval:', poId);
                      //   if (!data.bookingNumber) {
                      //     openSnackbar({
                      //       open: true,
                      //       message: 'Chức năng này chỉ dành cho Booking.',
                      //       anchorOrigin: { vertical: 'top', horizontal: 'right' },
                      //       variant: 'alert',
                      //       alert: { color: 'warning', severity: 'warning' }
                      //     } as SnackbarProps);
                      //     return;
                      //   }

                      //   try {
                      //     const saleContractId = data?.saleContractId;
                      //     const saleContractResponse = await axiosServices.get(`${SALE_CONTRACT_API.GET_BY_ID}/${saleContractId}`);

                      //     const saleContractData: SaleContractDataItem = saleContractResponse.data.data;

                      //     const saleContractToUpdate = saleContractData;
                      //     if (!saleContractToUpdate) throw new Error('Không tìm thấy hợp đồng bán tương ứng.');

                      //     const purchaseContractShippingResponse = await axiosServices.get(
                      //       `${PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON}/${poId}`
                      //     );
                      //     const purchaseContractShippingData: CodeBooking = purchaseContractShippingResponse.data.data;
                      //     if (!purchaseContractShippingData) throw new Error('Không tìm thấy hợp đồng mua tương ứng.');

                      //     await startDataImport(
                      //       saleContractToUpdate.contractId,
                      //       saleContractToUpdate.id,
                      //       fetchData,
                      //       saleContractToUpdate,
                      //       purchaseContractShippingData,
                      //       poId
                      //     );
                      //   } catch (error: any) {
                      //     console.error('Lỗi khi duyệt hợp đồng:', error);
                      //     openSnackbar({
                      //       open: true,
                      //       message: error.message || 'Đã xảy ra lỗi khi duyệt hợp đồng.',
                      //       anchorOrigin: { vertical: 'top', horizontal: 'right' },
                      //       variant: 'alert',
                      //       alert: { color: 'error', severity: 'error' }
                      //     } as SnackbarProps);
                      //   }
                      // }
                    }
                  >
                    <CheckCircleOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          }
          return null;
        }
      }
    ],
    [navigation, fetchData]
  );