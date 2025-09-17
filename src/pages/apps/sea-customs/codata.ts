import { excelDateToJSDate } from 'utils/excelHelper';
import { SaleContractDataItem, CodeBooking } from './models';
import { formatDate } from 'utils/formatDate';

export const COData = (filename: string, saleContractData: SaleContractDataItem, booking: CodeBooking | undefined) => {
  const totalAmount = saleContractData.totalAmount || 0;

  return [
    { TT: 1, 'Danh mục': 'Số tờ khai hải quan', 'Giá trị': '', 'Tham chiếu': '', 'Ghi chú': 'Lấy từ hải quan sang' },
    { TT: 2, 'Danh mục': 'ngày tờ khai', 'Giá trị': '', 'Tham chiếu': '', 'Ghi chú': 'Lấy từ hải quan sang' },
    {
      TT: 3,
      'Danh mục': 'Tên khách hàng',
      'Giá trị': `${saleContractData.customerName} (${saleContractData.customerCode})` || '',
      'Tham chiếu': filename,
      'Ghi chú': ''
    },
    {
      TT: 4,
      'Danh mục': 'Địa chỉ khách hàng',
      'Giá trị': `${saleContractData.customerAddress} - ${saleContractData.customerPhone}` || '',
      'Tham chiếu': filename,
      'Ghi chú': ''
    },
    ,
    { TT: 4, 'Danh mục': 'Địa chỉ khách hàng', 'Giá trị': saleContractData.customerAddress || '', 'Tham chiếu': filename, 'Ghi chú': '' },
    { TT: 5, 'Danh mục': 'Cảng đi', 'Giá trị': booking?.exportPort || '', 'Tham chiếu': filename, 'Ghi chú': '' },
    { TT: 6, 'Danh mục': 'Cảng đến', 'Giá trị': booking?.importPort || '', 'Tham chiếu': filename, 'Ghi chú': '' },
    { TT: 7, 'Danh mục': 'Tên tàu', 'Giá trị': booking?.shipName || '', 'Tham chiếu': filename, 'Ghi chú': '' },
    {
      TT: 8,
      'Danh mục': 'Ngày tàu chạy',
      'Giá trị': formatDate(saleContractData?.contractDate) || '',
      'Tham chiếu': filename,
      'Ghi chú': ''
    },
    { TT: 9, 'Danh mục': 'Thông tin nước thứ 3', 'Giá trị': '', 'Tham chiếu': '', 'Ghi chú': '' },
    {
      TT: 10,
      'Danh mục': 'Net weight',
      'Giá trị':
        saleContractData.weightTickets
          .map((wt) => wt.weightNet)
          .reduce((sum, wt) => sum + wt, 0)
          .toString() ||
        '0' ||
        '',
      'Tham chiếu': filename,
      'Ghi chú': ''
    },

    {
      TT: 11,
      'Danh mục': 'Gross Weight',
      'Giá trị':
        saleContractData.weightTickets
          .map((wt) => wt.weightGross)
          .reduce((sum, wt) => sum + wt, 0)
          .toString() ||
        '0' ||
        '',
      'Tham chiếu': filename,
      'Ghi chú': ''
    },
    { TT: 12, 'Danh mục': 'Total Amount', 'Giá trị': totalAmount.toString() || '', 'Tham chiếu': filename, 'Ghi chú': '' },
    { TT: 13, 'Danh mục': 'Số LC', 'Giá trị': saleContractData?.lcNumber || '', 'Tham chiếu': filename, 'Ghi chú': '' },
    {
      TT: 14,
      'Danh mục': 'Ngày LC',
      'Giá trị': saleContractData?.lcDate ? formatDate(saleContractData.lcDate) : '',
      'Tham chiếu': filename,
      'Ghi chú': ''
    },
    { TT: 15, 'Danh mục': 'Số Invoice', 'Giá trị': saleContractData?.code || '', 'Tham chiếu': filename, 'Ghi chú': '' },
    {
      TT: 16,
      'Danh mục': 'Ngày Invoice',
      'Giá trị': saleContractData?.createdAt ? formatDate(saleContractData.createdAt) : '',
      'Tham chiếu': filename,
      'Ghi chú': ''
    }
  ];
};
