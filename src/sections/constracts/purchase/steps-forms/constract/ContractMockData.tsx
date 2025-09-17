// Mock data for sellers and buyers
export interface SellerInfo {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  representative: string;
  phone: string;
}

export interface BuyerInfo {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  representative: string;
  phone: string;
}

export const sellers: SellerInfo[] = [
  {
    id: 'SW001',
    name: 'SmartWood Co., Ltd',
    taxCode: '0318950116',
    address: '54, 6th Street, CityLand Residential Area, Ward 5, Go Vap District, Ho Chi Minh City, Vietnam',
    representative: 'Nguyễn Văn A',
    phone: '0909090909'
  },
  {
    id: 'SW002',
    name: 'SmartWood North',
    taxCode: '0318950117',
    address: '123, Nguyen Van Linh Street, District 7, Ho Chi Minh City, Vietnam',
    representative: 'Trần Thị B',
    phone: '0909090908'
  },
  {
    id: 'SW003',
    name: 'SmartWood South',
    taxCode: '0318950118',
    address: '456, Le Van Viet Street, District 9, Ho Chi Minh City, Vietnam',
    representative: 'Lê Văn C',
    phone: '0909090907'
  }
];

export const buyers: BuyerInfo[] = [
  {
    id: 'CM001',
    name: 'Cellmark AB',
    taxCode: 'SE556170-1234',
    address: 'Box 100, SE-431 22 Mölndal, Sweden',
    representative: 'John Smith',
    phone: '+46 31 65 65 00'
  },
  {
    id: 'CM002',
    name: 'Cellmark UK',
    taxCode: 'GB123456789',
    address: 'Unit 1, The Business Centre, 1-7 Commercial Road, Southampton, SO15 1GA, UK',
    representative: 'Jane Doe',
    phone: '+44 23 8022 2222'
  },
  {
    id: 'CM003',
    name: 'Cellmark USA',
    taxCode: 'US123456789',
    address: '123 Business Street, Suite 100, New York, NY 10001, USA',
    representative: 'Robert Johnson',
    phone: '+1 212 555 0123'
  }
];

export interface GoodsType {
  id: string;
  name: string;
}

export interface PaymentTerm {
  id: string;
  code: string;
  name: string;
}

export interface DeliveryTerm {
  id: string;
  code: string;
  name: string;
}

export const goodsTypes: GoodsType[] = [
  { id: '1', name: 'Dăm gỗ' },
  { id: '2', name: 'Viên gỗ' },
  { id: '3', name: 'Hàng khác' }
];

export const paymentTerms: PaymentTerm[] = [
  { id: '1', code: 'LC', name: 'Letter of Credit' },
  { id: '2', code: 'TT', name: 'Telegraphic Transfer' },
  { id: '3', code: 'CAD', name: 'Cash Against Documents' },
  { id: '4', code: 'DP', name: 'Documents Against Payment' },
  { id: '5', code: 'DA', name: 'Documents Against Acceptance' }
];

export const deliveryTerms: DeliveryTerm[] = [
  { id: '1', code: 'EXW', name: 'Ex Works' },
  { id: '2', code: 'FCA', name: 'Free Carrier' },
  { id: '3', code: 'CPT', name: 'Carriage Paid To' },
  { id: '4', code: 'CIP', name: 'Carriage and Insurance Paid To' },
  { id: '5', code: 'DAP', name: 'Delivered At Place' },
  { id: '6', code: 'DPU', name: 'Delivered at Place Unloaded' },
  { id: '7', code: 'DDP', name: 'Delivered Duty Paid' },
  { id: '8', code: 'FAS', name: 'Free Alongside Ship' },
  { id: '9', code: 'FOB', name: 'Free On Board' },
  { id: '10', code: 'CFR', name: 'Cost and Freight' },
  { id: '11', code: 'CIF', name: 'Cost, Insurance and Freight' }
];

export interface Port {
  id: string;
  code: string;
  name: string;
  country: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
}

export const ports: Port[] = [
  { id: '1', code: 'SGN', name: 'Cảng Sài Gòn', country: 'Việt Nam' },
  { id: '2', code: 'HCM', name: 'Cảng Hồ Chí Minh', country: 'Việt Nam' },
  { id: '3', code: 'DAD', name: 'Cảng Đà Nẵng', country: 'Việt Nam' },
  { id: '4', code: 'HPH', name: 'Cảng Hải Phòng', country: 'Việt Nam' },
  { id: '5', code: 'HAN', name: 'Cảng Hà Nội', country: 'Việt Nam' },
  { id: '6', code: 'SIN', name: 'Singapore Port', country: 'Singapore' },
  { id: '7', code: 'HKG', name: 'Hong Kong Port', country: 'China' },
  { id: '8', code: 'SHA', name: 'Shanghai Port', country: 'China' }
];

export const currencies: Currency[] = [
  { id: '1', code: 'USD', name: 'US Dollar', symbol: '$' },
  { id: '2', code: 'EUR', name: 'Euro', symbol: '€' },
  { id: '3', code: 'GBP', name: 'British Pound', symbol: '£' },
  { id: '4', code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { id: '5', code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { id: '6', code: 'VND', name: 'Vietnamese Dong', symbol: '₫' }
];

export const units: Unit[] = [
  { id: '1', code: 'TON', name: 'Tấn' },
  { id: '2', code: 'QUINTAL', name: 'Tạ' },
  { id: '3', code: 'KG', name: 'Kg' },
  { id: '4', code: 'm3', name: 'm3' }
];
export const status: Unit[] = [
  { id: '0', code: 'unactive', name: 'Không hoạt động' },
  { id: '1', code: 'active', name: 'Đang hoạt động' }
];

export interface BankBeneficiary {
  id: string;
  name: string;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  swiftCode: string;
}

export const sellerBeneficiaries: BankBeneficiary[] = [
  {
    id: 'SB001',
    name: 'SmartWood Co., Ltd',
    bankName: 'Vietcombank - Chi nhánh Hồ Chí Minh',
    bankAddress: '29 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    accountNumber: '0071001234567',
    swiftCode: 'BFTVVNVX'
  },
  {
    id: 'SB002',
    name: 'SmartWood North',
    bankName: 'Techcombank - Chi nhánh Hà Nội',
    bankAddress: '191 Bà Triệu, Quận Hai Bà Trưng, Hà Nội',
    accountNumber: '19028886666001',
    swiftCode: 'VTCBVNVX'
  },
  {
    id: 'SB003',
    name: 'SmartWood South',
    bankName: 'ACB - Chi nhánh Đà Nẵng',
    bankAddress: '218 Bạch Đằng, Quận Hải Châu, Đà Nẵng',
    accountNumber: '123456789',
    swiftCode: 'ASCBVNVX'
  }
];

export const buyerBeneficiaries: BankBeneficiary[] = [
  {
    id: 'BB001',
    name: 'Cellmark AB',
    bankName: 'SEB Bank',
    bankAddress: 'Kungsträdgårdsgatan 8, 106 40 Stockholm, Sweden',
    accountNumber: 'SE1234567890123456789012',
    swiftCode: 'ESSESESS'
  },
  {
    id: 'BB002',
    name: 'Cellmark UK',
    bankName: 'Barclays Bank',
    bankAddress: '1 Churchill Place, London E14 5HP, United Kingdom',
    accountNumber: 'GB29BARC20040155667788',
    swiftCode: 'BARCGB22'
  },
  {
    id: 'BB003',
    name: 'Cellmark USA',
    bankName: 'JPMorgan Chase',
    bankAddress: '383 Madison Avenue, New York, NY 10179, USA',
    accountNumber: 'US1234567890123456789012',
    swiftCode: 'CHASUS33'
  }
];

export interface ExistingContract {
  id: string;
  contractNumber: string;
  contractDate: Date;
  buyerName: string;
  sellerName: string;
  hasLC: boolean;
}

export const existingContracts: ExistingContract[] = [
  {
    id: 'C001',
    contractNumber: '2505/SW-MKS/01',
    contractDate: new Date('2024-05-25'),
    buyerName: 'Cellmark AB',
    sellerName: 'SmartWood Co., Ltd',
    hasLC: false
  },
  {
    id: 'C002',
    contractNumber: '2505/SW-MKS/02',
    contractDate: new Date('2024-05-26'),
    buyerName: 'Cellmark UK',
    sellerName: 'SmartWood North',
    hasLC: false
  },
  {
    id: 'C003',
    contractNumber: '2505/SW-MKS/03',
    contractDate: new Date('2024-05-27'),
    buyerName: 'Cellmark USA',
    sellerName: 'SmartWood South',
    hasLC: true
  }
];
