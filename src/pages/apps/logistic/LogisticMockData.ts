// Mock data for loading plans
export interface LoadingPlan {
  id: string;
  bookingCode: string;
  goodsName: string;
  factoryName: string;
  quantity: number;
  price: number;
  qualityType: string;
  loadingTimeFrom: Date;
  loadingTimeTo: Date;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface Factory {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  capacity: number;
  status: 'active' | 'inactive';
}

export interface Goods {
  id: string;
  name: string;
  type: string;
  unit: string;
  specifications: string;
  minQuantity: number;
  maxQuantity: number;
}

// Mock data for loading plans
export const loadingPlans: LoadingPlan[] = [
  {
    id: 'lp001',
    bookingCode: 'BK2024001',
    goodsName: 'Viên gỗ nén Premium',
    factoryName: 'Nhà máy Gỗ nén Đông Bắc',
    quantity: 5000,
    price: 2500000,
    qualityType: 'Loại A - Chất lượng cao',
    loadingTimeFrom: new Date('2024-03-01'),
    loadingTimeTo: new Date('2024-03-05'),
    status: 'pending',
    notes: 'Đóng hàng theo lịch trình'
  },
  {
    id: 'lp002',
    bookingCode: 'BK2024002',
    goodsName: 'Dăm gỗ sấy',
    factoryName: 'Nhà máy Dăm gỗ Tây Nguyên',
    quantity: 3000,
    price: 1800000,
    qualityType: 'Loại B - Chất lượng trung bình',
    loadingTimeFrom: new Date('2024-03-10'),
    loadingTimeTo: new Date('2024-03-15'),
    status: 'in_progress',
    notes: 'Đang trong quá trình đóng hàng'
  },
  {
    id: 'lp003',
    bookingCode: 'BK2024003',
    goodsName: 'Mùn cưa khô',
    factoryName: 'Nhà máy Mùn cưa Nam Bộ',
    quantity: 2000,
    price: 1500000,
    qualityType: 'Loại C - Chất lượng thường',
    loadingTimeFrom: new Date('2024-03-20'),
    loadingTimeTo: new Date('2024-03-25'),
    status: 'completed',
    notes: 'Đã hoàn thành đóng hàng'
  }
];

// Mock data for factories
export const factories: Factory[] = [
  {
    id: 'f001',
    name: 'Nhà máy Gỗ nén Đông Bắc',
    address: 'Khu công nghiệp Đông Bắc, Bắc Giang',
    contactPerson: 'Nguyễn Văn A',
    phone: '0912345678',
    email: 'contact@dongbac.com',
    capacity: 10000,
    status: 'active'
  },
  {
    id: 'f002',
    name: 'Nhà máy Dăm gỗ Tây Nguyên',
    address: 'Khu công nghiệp Tây Nguyên, Đắk Lắk',
    contactPerson: 'Trần Văn B',
    phone: '0987654321',
    email: 'info@taynguyen.com',
    capacity: 8000,
    status: 'active'
  },
  {
    id: 'f003',
    name: 'Nhà máy Mùn cưa Nam Bộ',
    address: 'Khu công nghiệp Nam Bộ, Bình Dương',
    contactPerson: 'Lê Văn C',
    phone: '0978123456',
    email: 'contact@nambo.com',
    capacity: 6000,
    status: 'active'
  }
];

// Mock data for goods
export const goods: Goods[] = [
  {
    id: 'g001',
    name: 'Viên gỗ nén Premium',
    type: 'Viên gỗ nén',
    unit: 'Tấn',
    specifications: 'Đường kính 6-8mm, độ ẩm < 10%, nhiệt trị > 4500 kcal/kg',
    minQuantity: 1000,
    maxQuantity: 10000
  },
  {
    id: 'g002',
    name: 'Viên gỗ nén Standard',
    type: 'Viên gỗ nén',
    unit: 'Tấn',
    specifications: 'Đường kính 8-10mm, độ ẩm < 12%, nhiệt trị > 4000 kcal/kg',
    minQuantity: 1000,
    maxQuantity: 8000
  },
  {
    id: 'g003',
    name: 'Dăm gỗ sấy',
    type: 'Dăm gỗ',
    unit: 'Tấn',
    specifications: 'Kích thước 2-5cm, độ ẩm < 15%',
    minQuantity: 1000,
    maxQuantity: 5000
  },
  {
    id: 'g004',
    name: 'Mùn cưa khô',
    type: 'Mùn cưa',
    unit: 'Tấn',
    specifications: 'Độ ẩm < 20%, không lẫn tạp chất',
    minQuantity: 1000,
    maxQuantity: 3000
  }
];

// Mock data for shipping status
export const shippingStatus = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
];

// Mock data for quality types
export const qualityTypes = [
  { value: 'type_a', label: 'Loại A - Chất lượng cao (Độ ẩm < 10%)' },
  { value: 'type_b', label: 'Loại B - Chất lượng trung bình (Độ ẩm < 15%)' },
  { value: 'type_c', label: 'Loại C - Chất lượng thường (Độ ẩm < 20%)' }
];

// Mock data for cargo types
export const cargoTypes = [
  { value: 'wood_pellets', label: 'Viên gỗ nén' },
  { value: 'wood_chips', label: 'Dăm gỗ' },
  { value: 'sawdust', label: 'Mùn cưa' },
  { value: 'wood_waste', label: 'Phế liệu gỗ' }
];

// QC (Quality Control) Interfaces and Data
export interface QCInspection {
  id: string;
  bookingCode: string;
  goodsName: string;
  factoryName: string;
  inspectionDate: Date;
  inspector: string;
  qualityType: string;
  testResults: {
    moisture: number;
    ash: number;
    sulfur: number;
    calorificValue: number;
  };
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
}

export const qcInspections: QCInspection[] = [
  {
    id: 'qc001',
    bookingCode: 'BK2024001',
    goodsName: 'Viên gỗ nén Premium',
    factoryName: 'Nhà máy Gỗ nén Đông Bắc',
    inspectionDate: new Date('2024-03-01'),
    inspector: 'Nguyễn Văn D',
    qualityType: 'Loại A - Chất lượng cao',
    testResults: {
      moisture: 8.5,
      ash: 2.3,
      sulfur: 0.1,
      calorificValue: 4600
    },
    status: 'passed',
    notes: 'Đạt tiêu chuẩn xuất khẩu'
  },
  {
    id: 'qc002',
    bookingCode: 'BK2024002',
    goodsName: 'Dăm gỗ sấy',
    factoryName: 'Nhà máy Dăm gỗ Tây Nguyên',
    inspectionDate: new Date('2024-03-10'),
    inspector: 'Trần Văn E',
    qualityType: 'Loại B - Chất lượng trung bình',
    testResults: {
      moisture: 12.2,
      ash: 3.1,
      sulfur: 0.2,
      calorificValue: 3800
    },
    status: 'pending',
    notes: 'Đang chờ kết quả phân tích cuối cùng'
  },
  {
    id: 'qc003',
    bookingCode: 'BK2024003',
    goodsName: 'Mùn cưa khô',
    factoryName: 'Nhà máy Mùn cưa Nam Bộ',
    inspectionDate: new Date('2024-03-20'),
    inspector: 'Lê Văn F',
    qualityType: 'Loại C - Chất lượng thường',
    testResults: {
      moisture: 18.5,
      ash: 4.2,
      sulfur: 0.3,
      calorificValue: 3200
    },
    status: 'failed',
    notes: 'Không đạt tiêu chuẩn về độ ẩm'
  }
];

// Customs Interfaces and Data
export interface CustomsDeclaration {
  id: string;
  bookingCode: string;
  declarationNumber: string;
  goodsName: string;
  quantity: number;
  value: number;
  portOfEntry: string;
  declarationDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  customsOfficer: string;
  notes?: string;
}

export const customsDeclarations: CustomsDeclaration[] = [
  {
    id: 'cd001',
    bookingCode: 'BK2024001',
    declarationNumber: 'CD2024001',
    goodsName: 'Viên gỗ nén Premium',
    quantity: 5000,
    value: 12500000000,
    portOfEntry: 'Cảng Hải Phòng',
    declarationDate: new Date('2024-03-02'),
    status: 'approved',
    customsOfficer: 'Phạm Văn G',
    notes: 'Đã thông quan'
  },
  {
    id: 'cd002',
    bookingCode: 'BK2024002',
    declarationNumber: 'CD2024002',
    goodsName: 'Dăm gỗ sấy',
    quantity: 3000,
    value: 5400000000,
    portOfEntry: 'Cảng Đà Nẵng',
    declarationDate: new Date('2024-03-11'),
    status: 'pending',
    customsOfficer: 'Hoàng Văn H',
    notes: 'Đang chờ xét duyệt'
  },
  {
    id: 'cd003',
    bookingCode: 'BK2024003',
    declarationNumber: 'CD2024003',
    goodsName: 'Mùn cưa khô',
    quantity: 2000,
    value: 3000000000,
    portOfEntry: 'Cảng Sài Gòn',
    declarationDate: new Date('2024-03-21'),
    status: 'rejected',
    customsOfficer: 'Vũ Văn I',
    notes: 'Thiếu giấy tờ chứng minh nguồn gốc gỗ'
  }
];

// Advance Payment Interfaces and Data
export interface AdvancePayment {
  id: string;
  bookingCode: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  bankName: string;
  accountNumber: string;
  beneficiary: string;
  notes?: string;
}

export const advancePayments: AdvancePayment[] = [
  {
    id: 'ap001',
    bookingCode: 'BK2024001',
    amount: 3750000000,
    currency: 'VND',
    paymentDate: new Date('2024-02-25'),
    paymentMethod: 'Chuyển khoản',
    status: 'completed',
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    beneficiary: 'Công ty TNHH Gỗ nén Đông Bắc',
    notes: 'Đã thanh toán 30% giá trị hợp đồng'
  },
  {
    id: 'ap002',
    bookingCode: 'BK2024002',
    amount: 1620000000,
    currency: 'VND',
    paymentDate: new Date('2024-03-05'),
    paymentMethod: 'Chuyển khoản',
    status: 'pending',
    bankName: 'Techcombank',
    accountNumber: '0987654321',
    beneficiary: 'Công ty TNHH Dăm gỗ Tây Nguyên',
    notes: 'Đang chờ xác nhận từ ngân hàng'
  },
  {
    id: 'ap003',
    bookingCode: 'BK2024003',
    amount: 900000000,
    currency: 'VND',
    paymentDate: new Date('2024-03-15'),
    paymentMethod: 'Chuyển khoản',
    status: 'cancelled',
    bankName: 'MB Bank',
    accountNumber: '1122334455',
    beneficiary: 'Công ty TNHH Mùn cưa Nam Bộ',
    notes: 'Hủy do không đạt yêu cầu chất lượng'
  }
];

// Additional status options
export const qcStatus = [
  { value: 'pending', label: 'Chờ kiểm tra' },
  { value: 'passed', label: 'Đạt' },
  { value: 'failed', label: 'Không đạt' }
];

export const customsStatus = [
  { value: 'pending', label: 'Chờ thông quan' },
  { value: 'approved', label: 'Đã thông quan' },
  { value: 'rejected', label: 'Từ chối thông quan' }
];

export const paymentStatus = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'completed', label: 'Đã thanh toán' },
  { value: 'cancelled', label: 'Đã hủy' }
];

export const paymentMethods = [
  { value: 'bank_transfer', label: 'Chuyển khoản' },
  { value: 'letter_of_credit', label: 'Thư tín dụng' },
  { value: 'cash', label: 'Tiền mặt' }
];

export const currencies = [
  { value: 'VND', label: 'Việt Nam Đồng' },
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' }
];
