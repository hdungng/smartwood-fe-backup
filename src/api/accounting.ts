import { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';
import { AccountingTransaction, TransactionDirection, TransactionType } from 'types/accounting';

// Lấy danh sách tất cả giao dịch kế toán
export const getAccountingTransactions = async (searchTerm?: string): Promise<AccountingTransaction[]> => {
  // Nếu có searchTerm thì thêm query param
  const url = searchTerm ? `/api/accounting?search=${encodeURIComponent(searchTerm)}` : `/api/accounting`;

  const res = await fetcher(url);
  let records: any[] = [];

  if (Array.isArray(res)) {
    records = res;
  } else if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
    records = res.data;
  }

  const normalize = (val: any) => {
    if (val === null || val === undefined || val === '' || val === 'null') return '';
    return String(val);
  };

  const mapped: AccountingTransaction[] = records.map((item: any) => {
    let direction = '';
    if (['income', 'expense'].includes(String(item.transactionDirection).toLowerCase())) {
      direction = String(item.transactionDirection).toLowerCase();
    } else if (['income', 'expense'].includes(String(item.transaction_direction).toLowerCase())) {
      direction = String(item.transaction_direction).toLowerCase();
    }

    return {
      id: normalize(item.id),
      requestPaymentId: normalize(item.requestPaymentId || item.request_payment_id),
      requestPaymentCode: normalize(item.requestPaymentCode || item.request_payment_code),
      contractId: normalize(item.contractId || item.contract_id),
      supplierId: normalize(item.supplierId || item.supplier_id),
      transactionDate: item.transactionDate || item.transaction_date || '',
      transactionDirection: direction,
      transactionType: item.transactionType || item.transaction_type || '',
      category: item.category || item.serviceType || '',
      amount: item.amount,
      currency: item.currency,
      note: item.note,
      createdAt: item.createdAt || item.created_at || '',
      createdBy: normalize(item.createdBy || item.created_by),
      lastUpdatedAt: item.lastUpdatedAt || item.last_updated_at || '',
      accountingStatus: item.accountingStatus || item.status || 'draft',
      paymentCode: normalize(item.paymentCode || item.payment_code),
      contractType: normalize(item.contractType || item.transaction_type),
      reason: item.reason || item.note || '',
      serviceType: item.serviceType || item.category || '',
    };
  });

  return mapped;
};


// Lấy chi tiết 1 giao dịch kế toán
export const getAccountingTransactionById = async (id: string): Promise<AccountingTransaction> => {
  const res = await fetcher(`/api/accounting/${id}`);
  return {
    id: String(res.id),
    requestPaymentId: String(res.requestPaymentId),
    contractId: String(res.contractId),
    supplierId: String(res.supplierId),
    transactionDate: res.transactionDate,
    transactionDirection: res.transactionDirection,
    transactionType: res.transactionType,
    category: res.category,
    amount: res.amount,
    currency: res.currency,
    note: res.note,
    createdAt: res.createdAt,
    createdBy: String(res.createdBy),
    lastUpdatedAt: res.lastUpdatedAt,
  };
};



// Cập nhật giao dịch kế toán
export const updateAccountingTransaction = async (id: string, data: Partial<AccountingTransaction>) => {
  const res = await axiosServices.put(`/api/accounting/${id}`, data);
  const item = res.data;
  // Chuẩn hóa giống getAccountingTransactions, bổ sung kiểm tra số và ngày
  const normalize = (val: any) => {
    if (val === null || val === undefined || val === '' || val === 'null') return '';
    return String(val);
  };
  const normalizeNumber = (val: any) => {
    if (val === null || val === undefined || val === '' || isNaN(Number(val))) return 0;
    return Number(val);
  };
  const normalizeDate = (val: any) => {
    if (!val || val === 'null' || val === '') return '';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : val;
  };
  return {
    id: normalize(item.id),
    requestPaymentId: normalize(item.requestPaymentId || item.request_payment_id),
    requestPaymentCode: normalize(item.requestPaymentCode || item.request_payment_code),
    contractId: normalize(item.contractId || item.contract_id),
    supplierId: normalize(item.supplierId || item.supplier_id),
    transactionDate: normalizeDate(item.transactionDate || item.transaction_date),
    transactionDirection: item.transactionDirection || item.transaction_direction || '',
    transactionType: item.transactionType || item.transaction_type || '',
    category: item.category || item.serviceType || '',
    amount: normalizeNumber(item.amount),
    currency: item.currency,
    note: item.note,
    createdAt: normalizeDate(item.createdAt || item.created_at),
    createdBy: normalize(item.createdBy || item.created_by),
    lastUpdatedAt: normalizeDate(item.lastUpdatedAt || item.last_updated_at),
    accountingStatus: item.accountingStatus || item.status || 'draft',
    paymentCode: normalize(item.paymentCode || item.payment_code),
    contractType: normalize(item.contractType || item.transaction_type),
    reason: item.reason || item.note || '',
    serviceType: item.serviceType || item.category || '',
  };
};

// // Xóa giao dịch kế toán
// export const deleteAccountingTransaction = async (id: string) => {
//   const res = await axiosServices.delete(`/api/accounting/${id}`);
//   return res.data;
// };

