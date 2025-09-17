import { CODE_UNIT_OF_MEASURE } from 'constants/code';
import { ConfigItem, ListConfigResponse } from 'services/config';
import { EntityWithName } from '../services/core';

type Unit = EntityWithName<string> & {
  code: string;
};

export function mapUnitsFromConfig(configs: ListConfigResponse[]): Unit[] {
  const config = configs.find((c) => c.code === CODE_UNIT_OF_MEASURE);
  if (!config) return [];

  // Nếu muốn thêm "QUINTAL" và "Tạ", bạn phải xử lý thủ công vì không có trong configs.
  // Nếu chỉ lấy theo data API:
  return config.data.map((item: ConfigItem, idx: number) => ({
    id: String(idx + 1),
    code: item.value,
    name: item.key
  }));
}
