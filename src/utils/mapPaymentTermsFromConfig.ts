import { CODE_PAYMENT_METHOD } from "constants/code";

interface PaymentTerm {
  id: string;
  code: string;
  name: string;
}

export function mapPaymentTermsFromConfig(configs: any[]): PaymentTerm[] {
  const paymentTermConfig = configs.find((c: any) => c.code === CODE_PAYMENT_METHOD);
  if (!paymentTermConfig) return [];


  return paymentTermConfig.data.map((item: any, idx: number) => ({
    id: String(idx + 1),
    code: item.value,
    name: item.key || item.value
  }));
}
