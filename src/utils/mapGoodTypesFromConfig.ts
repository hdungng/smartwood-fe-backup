import { CODE_QUALITY_TYPE } from 'constants/code';

export function mapGoodTypesFromConfig(configs: any[]): { value: string; label: string }[] {
  const config = configs.find((c: any) => c.code === CODE_QUALITY_TYPE);
  if (!config) return [];
  return config.data.map((item: any) => ({
    value: item.value,
    label: item.key
  }));
}
