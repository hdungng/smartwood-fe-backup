import { SelectionOption } from '../types/common';
import { ConfigCode, ConfigItem, ListConfigResponse } from 'services/config';

const transformHelper = {
  fromConfig(configCode: ConfigCode, configs?: ListConfigResponse[]): Record<string, string> {
    const configItems = (configs || [])?.find((item) => item.code === configCode)?.data ?? [];
    if (configItems.length === 0) {
      return {};
    }

    return configItems.reduce(
      (result, quality) => {
        result[quality.value] = quality.key;
        return result;
      },
      {} as Record<string, string>
    );
  },
  fromConfigSelection(
    configCode: ConfigCode,
    configs?: ListConfigResponse[],
    renderLabel?: (config: ConfigItem) => string
  ): SelectionOption[] {
    const configItems = (configs || [])?.find((item) => item.code === configCode)?.data ?? [];
    if (configItems.length === 0) {
      return [];
    }

    return configItems.map((config) => ({
      label: renderLabel?.(config) || config.key,
      value: config.value,
      metadata: config.metaData,
    }));
  }
};

export default transformHelper;
