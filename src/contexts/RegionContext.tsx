import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import useAuth from 'hooks/useAuth';
import { useConfiguration } from 'hooks';
import { SelectionOption } from 'types/common';
import { CODE_REGION } from '../constants/code';

export type RegionContextType = {
  currentRegion: SelectionOption | null;
  onChangeCurrentRegion: (region: SelectionOption) => void;
  availableRegions: SelectionOption[];
};

const REGION_STORAGE_KEY = 'region';

const RegionContext = createContext<RegionContextType | null>(null);

export const RegionProvider = ({ children }: { children: React.ReactElement }) => {
  const { user } = useAuth();
  const { mapConfigSelection } = useConfiguration();
  const prevSelectedRegionRef = React.useRef<SelectionOption | null>(null);

  const configRegions = mapConfigSelection(CODE_REGION);

  const defaultRegion = useMemo(() => {
    if (user?.regions?.length === 0 || configRegions.length === 0) return null;

    const storageValue = localStorage.getItem(REGION_STORAGE_KEY);
    if (storageValue) {
      const checkIncludeRegion = user?.regions?.includes(storageValue);
      if (checkIncludeRegion) {
        return mapConfigSelection(CODE_REGION).find((r) => r.value === storageValue) || null;
      }
    }

    const userRegion = user?.regions?.[0] || null;
    return mapConfigSelection(CODE_REGION).find((r) => r.value === userRegion) || null;
  }, [user?.regions, configRegions]);

  useEffect(() => {
    if (defaultRegion) {
      handleChangeRegion(defaultRegion);
    }
  }, [defaultRegion]);

  const [selectedRegion, setSelectedRegion] = useState<SelectionOption | null>(null);

  const availableRegions = useMemo(
    () => mapConfigSelection(CODE_REGION).filter((region) => (user?.regions || []).includes(region.value as string)),
    [mapConfigSelection, user?.regions]
  );

  const handleChangeRegion = (selectionOption: SelectionOption, reload?: boolean) => {
    if (!selectionOption || prevSelectedRegionRef.current?.value === selectionOption.value) return;

    setSelectedRegion(selectionOption);
    prevSelectedRegionRef.current = selectionOption;

    if (reload) {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (selectedRegion) {
      localStorage.setItem(REGION_STORAGE_KEY, selectedRegion.value.toString());
    }
  }, [selectedRegion]);

  return (
    <RegionContext.Provider
      value={{
        availableRegions,
        currentRegion: selectedRegion || defaultRegion,
        onChangeCurrentRegion: (region: SelectionOption) => handleChangeRegion(region, true)
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
