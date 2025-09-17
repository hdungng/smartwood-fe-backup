import { CODE_DESTINATION } from "constants/code";

interface Port {
  id: string;
  code: string;
  name: string;
  country: string;
}

export function mapPortDestination(configs: any[]): Port[] {
  const portConfig = configs.find((c: any) => c.code === CODE_DESTINATION);
  
  if (!portConfig) return [];

  return portConfig.data.map((item: any, idx: number) => {
    return {
      id: String(idx + 1),
      code: item.value,
      name: item.key.trim(),
    };
  });
}
