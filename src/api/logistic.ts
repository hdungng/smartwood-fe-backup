import axiosServices from 'utils/axios';
import { SALE_CONTRACT } from 'api/CommonAPI/Contract';
import { FORWARDER, SHIPPING_LINE, PURCHASE_CONTRACT_SHIPPING_SCHEDULE } from 'api/constants';
import { SaleContract, SaleContractOption } from 'types/sale-contract';
import { Forwarder } from 'types/forwarder.types';
import { ShippingLine } from 'types/shipping-line';

// New API request payload interface based on the required structure
export interface LogisticFormSubmitData {
  containerQuantity: number;
  availableContainerQuantity: number; // Set to 0 as default or editable
  etaDate: string; // ISO 8601 format 
  etdDate: string; // ISO 8601 format
  shipName: string;
  forwarderName: string;
  shippingLine: string;
  firstContainerDropDate: string; // ISO 8601 format
  cutoffDate: string; // ISO 8601 format
  region: string;
  exportPort: string; // Changed from departurePort to exportPort
  importPort?: string | null; // Changed from arrivalPort to importPort
  goodType: string; // Name of the good
  goodId: number; // ID of the good
  vesselCapacity?: number;
  notes: string;
  saleContractId: number; // Changed from purchaseContractId to saleContractId
  bookingNumber?: string | null;
  codeBooking?: string | null; // Code booking riêng biệt
}

// Get sale contracts
export const getSaleContracts = async (): Promise<SaleContractOption[]> => {
  const response = await axiosServices.get(SALE_CONTRACT.COMMON);
  
  if (response.status === 200 || response.status === 201) {
    return response.data.data.filter((contract: SaleContract) => contract.saleContractCode != null).map((contract: SaleContract) => ({
      label: contract.saleContractCode || contract.code,
      value: contract.id,
    }));
    
  }
  
  throw new Error('Failed to fetch sale contracts');
};

// Get forwarders
export const getForwarders = async (): Promise<{ key: string; value: string }[]> => {
  const response = await axiosServices.get(FORWARDER.COMMON);
  
  if (response.status === 200 || response.status === 201) {
    return response.data.data.map((forwarder: Forwarder) => ({
      key: forwarder.forwarderNameEn,
      value: forwarder.id.toString()
    }));
  }
  
  throw new Error('Failed to fetch forwarders');
};

// Get shipping lines
export const getShippingLines = async (): Promise<{ key: string; value: string }[]> => {
  const response = await axiosServices.get(SHIPPING_LINE.COMMON);
  
  if (response.status === 200 || response.status === 201) {
    return response.data.data.map((line: ShippingLine) => ({
      key: line.name,
      value: line.id.toString()
    }));
  }
  
  throw new Error('Failed to fetch shipping lines');
};

// Get all initial data for logistic form
export const getLogisticFormInitialData = async () => {
  const [contractRes, forwarderRes, shippingLineRes] = await Promise.all([
    getSaleContracts(),
    getForwarders(),
    getShippingLines()
  ]);

  return {
    saleContracts: contractRes,
    forwarders: forwarderRes,
    shippingLines: shippingLineRes
  };
};

// Create purchase contract shipping
export const createPurchaseContractShipping = async (payload: LogisticFormSubmitData) => {
  const response = await axiosServices.post(PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON, payload);
  
  if (response.status === 200 || response.status === 201) {
    return response.data;
  }
  
  throw new Error('Failed to create purchase contract shipping');
}; 