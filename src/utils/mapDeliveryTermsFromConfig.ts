import { CODE_DELIVERY_METHOD } from "constants/code";

interface DeliveryTerm {
  id: string;
  code: string;
  name: string;
}

export const deliveryTermNameMapping: Record<string, string> = {
  EXW: 'Ex Works',
  FCA: 'Free Carrier',
  CPT: 'Carriage Paid To',
  CIP: 'Carriage and Insurance Paid To',
  DAP: 'Delivered At Place',
  DPU: 'Delivered at Place Unloaded',
  DDP: 'Delivered Duty Paid',
  FAS: 'Free Alongside Ship',
  FOB: 'Free On Board',
  CFR: 'Cost and Freight',
  CIF: 'Cost, Insurance and Freight',
  DDU: 'Delivered Duty Unpaid'
  // Thêm nếu backend có code mới
};
export function mapDeliveryTermsFromConfig(configs: any[]): DeliveryTerm[] {
  const config = configs.find((c: any) => c.code === CODE_DELIVERY_METHOD);
  if (!config) return [];
  return config.data.map((item: any, idx: number) => ({
    id: String(idx + 1),
    code: item.value,
    name: deliveryTermNameMapping[item.value] || item.key || item.value
  }));
}
