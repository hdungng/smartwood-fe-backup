// Mock data for contracts and purchase orders

// Define the Contract type based on the fields in the form
export interface Contract {
  id: number;
  declarationNumber: string;
  declarationType: string;
  registrationDate: string;
  declarant: string;
  businessCode: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'New';
  notes?: string;
}

// Define PO (Purchase Order) type
export interface PurchaseOrder {
  id: number;
  poNumber: string;
  poType: 'Nhập khẩu' | 'Xuất khẩu' | 'Nội địa';
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  deliveryDate: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
}

// Define Contract with POs
export interface ContractWithPOs {
  id: number;
  contractNumber: string;
  contractName: string;
  contractType: 'Hợp đồng mua' | 'Hợp đồng bán' | 'Hợp đồng vận chuyển';
  signDate: string;
  validFrom: string;
  validTo: string;
  totalValue: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Expired';
  customer: string;
  notes?: string;
  purchaseOrders: PurchaseOrder[];
}

// Mock data for wood product export contracts
export const mockContractsWithPOs: ContractWithPOs[] = [
  {
    id: 1,
    contractNumber: 'XK-GỖ-001',
    contractName: 'Hợp đồng xuất khẩu sản phẩm gỗ sang Nhật Bản',
    contractType: 'Hợp đồng bán',
    signDate: '2024-01-15',
    validFrom: '2024-01-15',
    validTo: '2024-12-31',
    totalValue: 2500000000,
    status: 'Active',
    customer: 'Nippon Wood Import Co., Ltd',
    notes: 'Hợp đồng xuất khẩu sản phẩm gỗ sang thị trường Nhật Bản',
    purchaseOrders: [
      {
        id: 101,
        poNumber: 'PO-MC-001',
        poType: 'Xuất khẩu',
        productName: 'Mùn cưa gỗ thông',
        quantity: 500,
        unitPrice: 800000,
        totalAmount: 400000000,
        supplier: 'Công ty Gỗ Việt Nam',
        deliveryDate: '2024-03-15',
        status: 'Active',
        notes: 'Mùn cưa gỗ thông xuất khẩu, độ ẩm < 12%'
      },
      {
        id: 102,
        poNumber: 'PO-MC-002',
        poType: 'Xuất khẩu',
        productName: 'Mùn cưa gỗ cao su',
        quantity: 300,
        unitPrice: 900000,
        totalAmount: 270000000,
        supplier: 'Công ty Cao Su Đồng Nai',
        deliveryDate: '2024-03-20',
        status: 'Pending',
        notes: 'Chờ kiểm định chất lượng - Mùn cưa gỗ cao su'
      },
      {
        id: 103,
        poNumber: 'PO-DG-001',
        poType: 'Xuất khẩu',
        productName: 'Dăm gỗ thông size 3-8mm',
        quantity: 800,
        unitPrice: 1200000,
        totalAmount: 960000000,
        supplier: 'Công ty Chế biến Gỗ Bình Dương',
        deliveryDate: '2024-04-01',
        status: 'Active',
        notes: 'Dăm gỗ thông chất lượng cao, phục vụ sản xuất giấy'
      },
      {
        id: 104,
        poNumber: 'PO-VNG-001',
        poType: 'Xuất khẩu',
        productName: 'Viên nén gỗ thông 6mm',
        quantity: 200,
        unitPrice: 3500000,
        totalAmount: 700000000,
        supplier: 'Công ty Viên Nén Sinh Khối',
        deliveryDate: '2024-04-15',
        status: 'Completed',
        notes: 'Hoàn thành - Viên nén gỗ chất lượng premium'
      },
      {
        id: 105,
        poNumber: 'PO-VNG-002',
        poType: 'Xuất khẩu',
        productName: 'Viên nén gỗ hỗn hợp 8mm',
        quantity: 150,
        unitPrice: 4000000,
        totalAmount: 600000000,
        supplier: 'Công ty Năng Lượng Xanh',
        deliveryDate: '2024-04-25',
        status: 'Active',
        notes: 'Viên nén gỗ hỗn hợp, nhiệt lượng cao'
      }
    ]
  },
  {
    id: 2,
    contractNumber: 'XK-GỖ-002',
    contractName: 'Hợp đồng xuất khẩu sản phẩm gỗ sang Hàn Quốc',
    contractType: 'Hợp đồng bán',
    signDate: '2024-02-01',
    validFrom: '2024-02-01',
    validTo: '2024-11-30',
    totalValue: 1800000000,
    status: 'Active',
    customer: 'Korea Wood Trading Ltd',
    notes: 'Hợp đồng xuất khẩu sản phẩm gỗ sang thị trường Hàn Quốc',
    purchaseOrders: [
      {
        id: 201,
        poNumber: 'PO-DG-002',
        poType: 'Xuất khẩu',
        productName: 'Dăm gỗ eucalyptus',
        quantity: 600,
        unitPrice: 1100000,
        totalAmount: 660000000,
        supplier: 'Công ty Gỗ Keo An Giang',
        deliveryDate: '2024-05-10',
        status: 'Active',
        notes: 'Dăm gỗ keo xuất khẩu, độ ẩm 10-15%'
      },
      {
        id: 202,
        poNumber: 'PO-MC-003',
        poType: 'Xuất khẩu',
        productName: 'Mùn cưa gỗ keo',
        quantity: 400,
        unitPrice: 750000,
        totalAmount: 300000000,
        supplier: 'Công ty Lâm Nghiệp Tây Ninh',
        deliveryDate: '2024-05-15',
        status: 'Pending',
        notes: 'Chờ xử lý thủ tục xuất khẩu'
      },
      {
        id: 203,
        poNumber: 'PO-VNG-003',
        poType: 'Xuất khẩu',
        productName: 'Viên nén gỗ keo 6mm',
        quantity: 120,
        unitPrice: 3200000,
        totalAmount: 384000000,
        supplier: 'Công ty Biomass Việt Nam',
        deliveryDate: '2024-05-20',
        status: 'Active',
        notes: 'Viên nén gỗ keo chất lượng xuất khẩu'
      },
      {
        id: 204,
        poNumber: 'PO-DG-003',
        poType: 'Xuất khẩu',
        productName: 'Dăm gỗ thông size 5-15mm',
        quantity: 350,
        unitPrice: 1300000,
        totalAmount: 455000000,
        supplier: 'Công ty Chế biến Gỗ Nghệ An',
        deliveryDate: '2024-05-25',
        status: 'Completed',
        notes: 'Hoàn thành - Dăm gỗ thông size lớn'
      }
    ]
  },
  {
    id: 3,
    contractNumber: 'XK-GỖ-003',
    contractName: 'Hợp đồng xuất khẩu biomass sang EU',
    contractType: 'Hợp đồng bán',
    signDate: '2024-02-15',
    validFrom: '2024-02-15',
    validTo: '2024-12-31',
    totalValue: 3200000000,
    status: 'Active',
    customer: 'European Biomass Import GmbH',
    notes: 'Hợp đồng xuất khẩu biomass gỗ sang thị trường châu Âu',
    purchaseOrders: [
      {
        id: 301,
        poNumber: 'PO-VNG-004',
        poType: 'Xuất khẩu',
        productName: 'Viên nén gỗ premium 6mm',
        quantity: 400,
        unitPrice: 4500000,
        totalAmount: 1800000000,
        supplier: 'Công ty Viên Nén Premium',
        deliveryDate: '2024-06-01',
        status: 'Active',
        notes: 'Viên nén gỗ chất lượng cao theo tiêu chuẩn EU'
      },
      {
        id: 302,
        poNumber: 'PO-VNG-005',
        poType: 'Xuất khẩu',
        productName: 'Viên nén gỗ industrial 8mm',
        quantity: 300,
        unitPrice: 3800000,
        totalAmount: 1140000000,
        supplier: 'Công ty Năng Lượng Sinh Khối',
        deliveryDate: '2024-06-15',
        status: 'Pending',
        notes: 'Chờ chứng nhận FSC - Viên nén công nghiệp'
      },
      {
        id: 303,
        poNumber: 'PO-DG-004',
        poType: 'Xuất khẩu',
        productName: 'Dăm gỗ mixed hardwood',
        quantity: 200,
        unitPrice: 1300000,
        totalAmount: 260000000,
        supplier: 'Công ty Gỗ Cứng Miền Trung',
        deliveryDate: '2024-06-20',
        status: 'Active',
        notes: 'Dăm gỗ cứng hỗn hợp xuất khẩu'
      }
    ]
  },
  {
    id: 4,
    contractNumber: 'XK-GỖ-004',
    contractName: 'Hợp đồng xuất khẩu sản phẩm gỗ sang Trung Quốc',
    contractType: 'Hợp đồng bán',
    signDate: '2024-03-01',
    validFrom: '2024-03-01',
    validTo: '2024-10-31',
    totalValue: 1500000000,
    status: 'Pending',
    customer: 'China Wood Import Corporation',
    notes: 'Hợp đồng xuất khẩu sản phẩm gỗ sang thị trường Trung Quốc',
    purchaseOrders: [
      {
        id: 401,
        poNumber: 'PO-MC-004',
        poType: 'Xuất khẩu',
        productName: 'Mùn cưa gỗ hỗn hợp',
        quantity: 800,
        unitPrice: 650000,
        totalAmount: 520000000,
        supplier: 'Công ty Gỗ Đồng Tháp',
        deliveryDate: '2024-07-01',
        status: 'Pending',
        notes: 'Chờ duyệt hợp đồng - Mùn cưa gỗ hỗn hợp'
      },
      {
        id: 402,
        poNumber: 'PO-DG-005',
        poType: 'Xuất khẩu',
        productName: 'Dăm gỗ acacia',
        quantity: 500,
        unitPrice: 1000000,
        totalAmount: 500000000,
        supplier: 'Công ty Gỗ Keo Bình Phước',
        deliveryDate: '2024-07-10',
        status: 'Pending',
        notes: 'Dăm gỗ keo xuất khẩu chất lượng tốt'
      },
      {
        id: 403,
        poNumber: 'PO-VNG-006',
        poType: 'Xuất khẩu',
        productName: 'Viên nén gỗ standard 6mm',
        quantity: 150,
        unitPrice: 3200000,
        totalAmount: 480000000,
        supplier: 'Công ty Pellet Miền Nam',
        deliveryDate: '2024-07-15',
        status: 'Pending',
        notes: 'Viên nén gỗ tiêu chuẩn xuất khẩu'
      }
    ]
  },
  {
    id: 5,
    contractNumber: 'XK-GỖ-005',
    contractName: 'Hợp đồng xuất khẩu sản phẩm gỗ sang Malaysia',
    contractType: 'Hợp đồng bán',
    signDate: '2024-03-15',
    validFrom: '2024-03-15',
    validTo: '2024-09-30',
    totalValue: 1200000000,
    status: 'Expired',
    customer: 'Malaysia Timber Industries Sdn Bhd',
    notes: 'Hợp đồng hết hạn - Cần gia hạn hoặc làm mới',
    purchaseOrders: [
      {
        id: 501,
        poNumber: 'PO-DG-006',
        poType: 'Xuất khẩu',
        productName: 'Dăm gỗ thông size nhỏ 2-5mm',
        quantity: 600,
        unitPrice: 1100000,
        totalAmount: 660000000,
        supplier: 'Công ty Chế biến Gỗ Lâm Đồng',
        deliveryDate: '2024-08-01',
        status: 'Cancelled',
        notes: 'Đã hủy do hết hạn hợp đồng'
      },
      {
        id: 502,
        poNumber: 'PO-MC-005',
        poType: 'Xuất khẩu',
        productName: 'Mùn cưa gỗ thông mịn',
        quantity: 400,
        unitPrice: 700000,
        totalAmount: 280000000,
        supplier: 'Công ty Gỗ Gia Lai',
        deliveryDate: '2024-08-10',
        status: 'Cancelled',
        notes: 'Đã hủy - Mùn cưa gỗ thông mịn'
      },
      {
        id: 503,
        poNumber: 'PO-VNG-007',
        poType: 'Xuất khẩu',
        productName: 'Viên nén gỗ thông 8mm',
        quantity: 100,
        unitPrice: 2600000,
        totalAmount: 260000000,
        supplier: 'Công ty Biomass Tây Nguyên',
        deliveryDate: '2024-08-15',
        status: 'Cancelled',
        notes: 'Đã hủy do hết hạn hợp đồng'
      }
    ]
  }
];

// Mock data for original contracts (keep for backward compatibility)
export const mockContracts: Contract[] = [
  {
    id: 1,
    declarationNumber: 'TK001',
    declarationType: 'Nhập khẩu',
    registrationDate: '2024-03-20',
    declarant: 'Nguyễn Văn A',
    businessCode: '1234567890',
    status: 'Pending',
    notes: 'Chờ duyệt'
  },
  {
    id: 2,
    declarationNumber: 'TK002',
    declarationType: 'Xuất khẩu',
    registrationDate: '2024-03-19',
    declarant: 'Trần Thị B',
    businessCode: '0987654321',
    status: 'Approved',
    notes: 'Đã duyệt'
  },
  {
    id: 3,
    declarationNumber: 'TK003',
    declarationType: 'Nhập khẩu',
    registrationDate: '2024-03-18',
    declarant: 'Lê Văn C',
    businessCode: '1122334455',
    status: 'Rejected',
    notes: 'Từ chối'
  }
];

// Export functions
export const getContractById = (id: number): Contract | undefined => {
  return mockContracts.find((contract) => contract.id === id);
};

export const getContractWithPOsById = (id: number): ContractWithPOs | undefined => {
  return mockContractsWithPOs.find((contract) => contract.id === id);
};

// Helper function to get all POs from all contracts
export const getAllPurchaseOrders = (): PurchaseOrder[] => {
  return mockContractsWithPOs.flatMap((contract) => contract.purchaseOrders);
};
