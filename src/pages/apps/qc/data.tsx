// Mock data for QC contracts

export interface Contract {
  id: number;
  contractNumber: string;
  customerName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  currency: string;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  status: 'Active' | 'Pending' | 'Completed';
  sellerName: string;
  products: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
  updatedAt: string;
}

export const mockContracts: Contract[] = [
  {
    id: 1,
    contractNumber: 'CO001',
    customerName: 'Công ty TNHH ABC',
    orderDate: '2024-03-10',
    expectedDeliveryDate: '2024-03-25',
    totalAmount: 50000000,
    currency: 'VND',
    paymentStatus: 'Paid',
    status: 'Active',
    sellerName: 'Nguyễn Văn A',
    products: [
      {
        name: 'Viên nén gỗ',
        quantity: 25,
        unit: 'tấn',
        price: 2000000
      }
    ],
    description: 'Đơn hàng viên nén gỗ xuất khẩu sang Nhật Bản',
    priority: 'High',
    createdAt: '2024-03-10T08:00:00',
    updatedAt: '2024-03-15T10:30:00'
  },
  {
    id: 2,
    contractNumber: 'CO002',
    customerName: 'Tập đoàn XYZ',
    orderDate: '2024-03-12',
    expectedDeliveryDate: '2024-03-28',
    totalAmount: 75000000,
    currency: 'VND',
    paymentStatus: 'Partial',
    status: 'Pending',
    sellerName: 'Trần Thị B',
    products: [
      {
        name: 'Dăm gỗ',
        quantity: 30,
        unit: 'tấn',
        price: 2500000
      }
    ],
    description: 'Đơn hàng dăm gỗ cho thị trường châu Âu',
    priority: 'Medium',
    createdAt: '2024-03-12T09:15:00',
    updatedAt: '2024-03-14T14:20:00'
  },
  {
    id: 3,
    contractNumber: 'CO003',
    customerName: 'Công ty Cổ phần DEF',
    orderDate: '2024-03-14',
    expectedDeliveryDate: '2024-03-30',
    totalAmount: 120000000,
    currency: 'VND',
    paymentStatus: 'Pending',
    status: 'Completed',
    sellerName: 'Lê Văn C',
    products: [
      {
        name: 'Viên nén mùn cưa',
        quantity: 40,
        unit: 'tấn',
        price: 3000000
      }
    ],
    description: 'Đơn hàng viên nén mùn cưa chất lượng cao',
    priority: 'Low',
    createdAt: '2024-03-14T11:00:00',
    updatedAt: '2024-03-16T16:45:00'
  },
  {
    id: 4,
    contractNumber: 'CO004',
    customerName: 'DN Tư nhân GHI',
    orderDate: '2024-03-16',
    expectedDeliveryDate: '2024-04-01',
    totalAmount: 85000000,
    currency: 'VND',
    paymentStatus: 'Paid',
    status: 'Active',
    sellerName: 'Phạm Thị D',
    products: [
      {
        name: 'Gỗ phế liệu',
        quantity: 35,
        unit: 'tấn',
        price: 2428571
      }
    ],
    description: 'Đơn hàng gỗ phế liệu tái chế',
    priority: 'High',
    createdAt: '2024-03-16T13:30:00',
    updatedAt: '2024-03-17T09:15:00'
  },
  {
    id: 5,
    contractNumber: 'CO005',
    customerName: 'Công ty TNHH JKL',
    orderDate: '2024-03-18',
    expectedDeliveryDate: '2024-04-05',
    totalAmount: 95000000,
    currency: 'VND',
    paymentStatus: 'Partial',
    status: 'Pending',
    sellerName: 'Hoàng Văn E',
    products: [
      {
        name: 'Viên nén cao su',
        quantity: 32,
        unit: 'tấn',
        price: 2968750
      }
    ],
    description: 'Đơn hàng viên nén từ gỗ cao su',
    priority: 'Medium',
    createdAt: '2024-03-18T10:45:00',
    updatedAt: '2024-03-19T12:00:00'
  }
];
