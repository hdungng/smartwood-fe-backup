// accounting types

export enum TransactionStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Pending = 'pending',
  PaidIn = 'paid_in',
  PaidOut = 'paid_out',
}

export enum TransactionDirection {
  Income = 'income',
  Expense = 'expense',
}

export enum TransactionType {
  Sale = 'sale',
  Purchase = 'purchase',
  Payment = 'payment',
  Receipt = 'receipt',
  Expense = 'expense',
  Other = 'other',
}

// Request tạo mới/cập nhật giao dịch kế toán
export interface AccountingTransactionCreate {
  requestPaymentId?: string;
  contractId?: string;
  supplierId?: string;
  transactionDate: string;
  transactionDirection: string;
  transactionType: string;
  category: string;
  amount: number;
  currency: string;
  note?: string;
}

// Response chi tiết giao dịch kế toán
export interface AccountingTransactionDetail extends AccountingTransaction {
  // Có thể bổ sung các trường mở rộng nếu backend trả về
}

// Kết quả phân trang danh sách kế toán
export interface AccountingTransactionListResponse {
  data: AccountingTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

// Kết quả tổng hợp kế toán
export interface AccountingSummaryResponse {
  summary: AccountingSummary;
}

export enum PaymentMethod {
  Cash = 'cash',
  BankTransfer = 'bank_transfer',
  CreditCard = 'credit_card',
  EWallet = 'e_wallet',
  Other = 'other',
}

export enum Currency {
  VND = 'VND',
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  Other = 'other',
}

export interface AccountingTransaction {
  id: string;
  requestPaymentId: string;
  requestPaymentCode?: string; // Thêm dòng này để FE nhận đúng mã đề nghị
  contractId: string;
  supplierId: string;
  transactionDate: string;
  transactionDirection: string;
  transactionType: string;
  category: string;
  amount: number;
  currency: string;
  note: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  accountingStatus?: string;
  paymentCode?: string;
  contractType?: string;
  reason?: string;
  serviceType?: string;
}

export interface AccountingFilters {
  supplierId?: string;
  transactionType?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  accountingStatus?: TransactionStatus;
}

export interface AccountingSummary {
  totalTransactions: number;
  totalAmount: number;
  totalSales: number;
  totalPurchases: number;
  totalPayments: number;
  totalReceipts: number;
}
