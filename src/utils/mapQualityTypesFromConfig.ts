export function mapQualityTypesFromConfig(configs: any[]): { value: string; label: string }[] {
  const config = configs.find((c: any) => c.code === 'QUALITY_TYPE');
  if (!config) return [];
  return config.data.map((item: any) => ({
    value: item.value,
    label: item.key
  }));
}
