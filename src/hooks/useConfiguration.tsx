import { useCallback } from 'react';
import { transformHelper } from 'utils';
import { useGlobal } from 'contexts';
import { ConfigCode, ConfigItem, ListConfigResponse } from 'services/config';

type MapCustomFunction<T> = (configs: ListConfigResponse[]) => T[];

export const useConfiguration = () => {
  const { configs } = useGlobal();

  const mapConfigObject = useCallback(
    (code: ConfigCode, key?: string) => {
      if (!key) return key;

      return transformHelper.fromConfig(code, configs)[key];
    },
    [configs]
  );

  const mapConfigSelection = useCallback(
    (code: ConfigCode, renderLabel?: (config: ConfigItem) => string) => transformHelper.fromConfigSelection(code, configs, renderLabel),
    [configs]
  );

  const mapConfigCustom = <T,>(func: MapCustomFunction<T>) => (func?.(configs) || []) as T[];

  return {
    configs,
    mapConfigObject,
    mapConfigSelection,
    mapConfigCustom
  };
};
