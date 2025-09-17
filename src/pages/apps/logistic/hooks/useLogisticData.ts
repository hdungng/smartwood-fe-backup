import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { enqueueSnackbar } from 'notistack';
import { useGlobal } from 'contexts/GlobalContext';
import { useConfiguration } from 'hooks/useConfiguration';
import useForwarder from 'api/forwarder';
import useShippingLine from 'api/shipping-line';
import { getSaleContracts } from 'api/logistic';
import { CODE_DESTINATION, CODE_EXPORT_PORT, CODE_REGION } from 'constants/code';
import { SelectionOption } from 'types/common';
import { SaleContractOption } from 'types/sale-contract';
import { mapForwardersFromMaster } from 'utils/mapForwardersFromMaster';
import { mapShippingLinesFromMaster } from 'utils/mapShippingLinesFromMaster';

export const useLogisticData = () => {
  const intl = useIntl();
  const { goods } = useGlobal();
  const { mapConfigSelection, configs: configList } = useConfiguration();

  // State
  const [initialLoading, setInitialLoading] = useState(true);
  const [saleContracts, setSaleContracts] = useState<SaleContractOption[]>([]);

  // Fetch data from master APIs
  const { forwarders: forwardersData, forwardersLoading } = useForwarder().list();
  const { shippingLines: shippingLinesData, shippingLinesLoading } = useShippingLine().list();

  // Build selection options from configuration
  const exportPortOptions = useMemo(() => mapConfigSelection(CODE_EXPORT_PORT as any), [mapConfigSelection]);
  const importPortOptions = useMemo(() => mapConfigSelection(CODE_DESTINATION as any), [mapConfigSelection]);
  const regionOptions = useMemo(() => mapConfigSelection(CODE_REGION as any), [mapConfigSelection]);

  // Map master API data to SelectionOption format
  const forwarders: SelectionOption[] = useMemo(() => mapForwardersFromMaster(forwardersData || []), [forwardersData]);
  const shippingLines: SelectionOption[] = useMemo(() => mapShippingLinesFromMaster(shippingLinesData || []), [shippingLinesData]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        const saleContracts = await getSaleContracts();
        setSaleContracts(saleContracts);
      } catch (error: any) {
        console.log('FETCH FAIL!', error);
        enqueueSnackbar(error?.meta?.message || intl.formatMessage({ id: 'get_list_data_fail' }), {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [intl]);

  return {
    // Loading states
    initialLoading,
    forwardersLoading,
    shippingLinesLoading,
    
    // Data
    goods,
    configList,
    saleContracts,
    forwarders,
    shippingLines,
    exportPortOptions,
    importPortOptions,
    regionOptions,
    
    // Setters
    setSaleContracts
  };
};