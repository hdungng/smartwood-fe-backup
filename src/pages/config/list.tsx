import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// project imports
import ConfigTable from 'sections/apps/config/ConfigTable';
import useConfig from 'api/config';
import { ConfigParams } from 'types/config';
import { getConfigColumns } from './ConfigColumns';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import AlertConfigActivate from 'sections/apps/config/AlertConfigActivate';
import AlertConfigDeactivate from 'sections/apps/config/AlertConfigDeactivate';

// ==============================|| CONFIG LIST PAGE ||============================== //
function ConfigListPage() {
  const navigate = useNavigate();

  // ==============================|| STATE ||============================== //
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ConfigParams>({
    search: '',
    status: undefined,
    code: undefined,
    name: undefined,
    codeType: undefined,
    screenName: undefined
  });

  // ==============================|| MODAL STATE ||============================== //
  const [activateOpen, setActivateOpen] = useState<boolean>(false);
  const [deactivateOpen, setDeactivateOpen] = useState<boolean>(false);
  const [configActivateId, setConfigActivateId] = useState<number | null>(null);
  const [configDeactivateId, setConfigDeactivateId] = useState<number | null>(null);
  const [activateConfigName, setActivateConfigName] = useState<string>('');
  const [deactivateConfigName, setDeactivateConfigName] = useState<string>('');

  // ==============================|| API HOOKS ||============================== //
  const { list } = useConfig();
  const { configs, configsLoading, configsError, refetch } = list({
    search,
    ...filters
  });

  // ==============================|| HANDLERS ||============================== //
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleFilterChange = useCallback((filterValues: Record<string, any>) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        // Reset filter values first
        code: undefined,
        name: undefined,
        codeType: undefined,
        screenName: undefined,
        status: undefined
      };

      // Apply new filter values
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value || String(value).trim() === '') return;

        switch (key) {
          case 'code':
            newFilters.code = String(value).trim() as any;
            break;
          case 'name':
            newFilters.name = String(value).trim() as any;
            break;
          case 'codeType':
            newFilters.codeType = String(value).trim() as any;
            break;
          case 'screenName':
            newFilters.screenName = String(value).trim() as any;
            break;
          case 'status':
            const statusValue = Number(value);
            if (!isNaN(statusValue)) {
              newFilters.status = statusValue as any;
            }
            break;
        }
      });

      return newFilters;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleConfigAction = useCallback(
    (action: 'create' | 'view' | 'edit' | 'detail', configId?: number) => {
      try {
        switch (action) {
          case 'create':
            navigate('/system/config/create');
            break;
          case 'view':
          case 'edit':
            if (!configId || configId <= 0) {
              throw new Error('Invalid config ID');
            }
            navigate(`/system/config/${action}/${configId}`);
            break;
          case 'detail':
            if (!configId || configId <= 0) {
              throw new Error('Invalid config ID');
            }
            navigate(`/system/config/detail/${configId}`);
            break;
          default:
            throw new Error('Invalid action');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        openSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Navigation failed',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      }
    },
    [navigate]
  );

  const handleActivateConfig = useCallback(
    (configId: number) => {
      const config = configs.find((c) => c.id === configId);
      if (config) {
        setConfigActivateId(configId);
        setActivateConfigName(config.name);
        setActivateOpen(true);
      }
    },
    [configs]
  );

  const handleDeactivateConfig = useCallback(
    (configId: number) => {
      const config = configs.find((c) => c.id === configId);
      if (config) {
        setConfigDeactivateId(configId);
        setDeactivateConfigName(config.name);
        setDeactivateOpen(true);
      }
    },
    [configs]
  );

  const handleActivateClose = useCallback(() => {
    setActivateOpen(false);
    setConfigActivateId(null);
    setActivateConfigName('');
  }, []);

  const handleDeactivateClose = useCallback(() => {
    setDeactivateOpen(false);
    setConfigDeactivateId(null);
    setDeactivateConfigName('');
  }, []);

  const handleActivateSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeactivateSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // ==============================|| MEMOIZED VALUES ||============================== //
  const columns = useMemo(
    () => getConfigColumns(handleConfigAction, handleDeactivateConfig, handleActivateConfig),
    [handleConfigAction, handleDeactivateConfig, handleActivateConfig]
  );

  const tableFilters = useMemo(
    () => ({
      search,
      onSearchChange: handleSearchChange,
      onFilterChange: handleFilterChange
    }),
    [search, handleSearchChange, handleFilterChange]
  );

  // ==============================|| RENDER ||============================== //
  return (
    <>
      <ConfigTable data={configs} columns={columns} loading={configsLoading} filters={tableFilters} onRefresh={handleRefresh} />
      <AlertConfigActivate
        id={configActivateId ?? 0}
        title={activateConfigName}
        open={activateOpen}
        handleClose={handleActivateClose}
        onActivateSuccess={() => {}}
      />
      <AlertConfigDeactivate
        id={configDeactivateId ?? 0}
        title={deactivateConfigName}
        open={deactivateOpen}
        handleClose={handleDeactivateClose}
        onDeactivateSuccess={() => {}}
      />
    </>
  );
}

export default ConfigListPage;
