import { ColumnDef } from '@tanstack/react-table';
import { Status } from 'config';

export interface OrderProps {
  modal: boolean;
}

export interface OrderList {
  id?: number;
  // From TransactionInformation.tsx
  customerName: string;
  deliveryLocation: string;
  importCountry: string;
  productName: string;
  deliveryMethod: string;
  paymentMethod: string;
  currency: string;
  unitPrice: number;
  weight: number;
  status: Status;

  // From SupplierInformation.tsx and SupplierInfoTable.tsx
  suppliers: {
    supplierName: string;
    transportCompanyName: string;
    coatingCompanyName: string;
    area: number;
    mass: number;
    purchasePrice: number;
    totalPrice: number;
    expectedDelivery: string;
  }[];

  // From Costs.tsx
  seaFreight: number;
  factoryToPort: number;
  portStorage: number;
  trucking: number;
  localCharge: number;

  // From AnalysisSummary.tsx
  totalRevenue: number;
  breakEvenPoint: number;
  actualProfit: number;
  profitMargin: number;
}

export const mockColumns: ColumnDef<OrderList>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: (info) => info.getValue()
  },
  {
    accessorKey: 'customerName',
    header: 'Customer Name',
    cell: (info) => info.getValue()
  },
  {
    accessorKey: 'productName',
    header: 'Product Name',
    cell: (info) => info.getValue()
  },
  {
    accessorKey: 'deliveryLocation',
    header: 'Delivery Location',
    cell: (info) => info.getValue()
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: (info) => `$${info.getValue()}`
  },
  {
    accessorKey: 'totalRevenue',
    header: 'Total Revenue',
    cell: (info) => `$${info.getValue()}`
  },
  {
    accessorKey: 'profitMargin',
    header: 'Profit Margin (%)',
    cell: (info) => `${info.getValue()}%`
  }
];

export const mockData: OrderList[] = [
  {
    id: 1,
    customerName: 'John Doe',
    deliveryLocation: 'New York, USA',
    importCountry: 'China',
    productName: 'Steel Rods',
    deliveryMethod: 'Air Freight',
    paymentMethod: 'Credit Card',
    currency: 'USD',
    unitPrice: 500,
    weight: 1000,
    status: Status.PENDING,
    suppliers: [
      {
        supplierName: 'ABC Supplies',
        transportCompanyName: 'XYZ Logistics',
        coatingCompanyName: 'CoatPro',
        area: 200,
        mass: 500,
        purchasePrice: 450,
        totalPrice: 225000,
        expectedDelivery: '2025-05-20'
      }
    ],
    seaFreight: 2000,
    factoryToPort: 500,
    portStorage: 300,
    trucking: 400,
    localCharge: 150,
    totalRevenue: 300000,
    breakEvenPoint: 250000,
    actualProfit: 50000,
    profitMargin: 16.67
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    deliveryLocation: 'London, UK',
    importCountry: 'India',
    productName: 'Copper Wires',
    deliveryMethod: 'Sea Freight',
    paymentMethod: 'Bank Transfer',
    currency: 'GBP',
    unitPrice: 700,
    weight: 800,
    status: Status.VERIFIED,
    suppliers: [
      {
        supplierName: 'Global Metals',
        transportCompanyName: 'FastShip',
        coatingCompanyName: 'MetalCoat',
        area: 150,
        mass: 400,
        purchasePrice: 600,
        totalPrice: 240000,
        expectedDelivery: '2025-05-25'
      }
    ],
    seaFreight: 3000,
    factoryToPort: 700,
    portStorage: 400,
    trucking: 600,
    localCharge: 200,
    totalRevenue: 400000,
    breakEvenPoint: 350000,
    actualProfit: 50000,
    profitMargin: 12.5
  }
];
