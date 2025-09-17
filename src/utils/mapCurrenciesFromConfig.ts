import { CODE_PAYMENT_CURRENCY } from "constants/code";

export const CURRENCIES: Record<string, { name: string; symbol: string; locale: string }> = {
  USD: { name: 'Đô la Mỹ', symbol: '$', locale: 'en-US' },
  VND: { name: 'Việt Nam Đồng', symbol: '₫', locale: 'vi-VN' },
  EUR: { name: 'Euro', symbol: '€', locale: 'de-DE' },
  JPY: { name: 'Yên Nhật', symbol: '¥', locale: 'ja-JP' },
  GBP: { name: 'Bảng Anh', symbol: '£', locale: 'en-GB' },
  CNY: { name: 'Nhân dân tệ', symbol: '¥', locale: 'zh-CN' },
  KRW: { name: 'Won Hàn Quốc', symbol: '₩', locale: 'ko-KR' },
  SGD: { name: 'Đô la Singapore', symbol: 'S$', locale: 'en-SG' },
  AUD: { name: 'Đô la Australia', symbol: 'A$', locale: 'en-AU' }
};


export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export function mapCurrenciesFromConfig(configs: any[]): Currency[] {
  const config = configs.find((c) => c.code === CODE_PAYMENT_CURRENCY);
  if (!config) return [];
  return config.data.map((item: any, idx: number) => {
    const { name, symbol } = CURRENCIES[item.value] || { name: item.value, symbol: '' };
    return {
      id: String(idx + 1),
      code: item.value,
      name,
      symbol: symbol || ''
    };
  });
}
