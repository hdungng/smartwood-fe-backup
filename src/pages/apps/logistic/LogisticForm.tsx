import 'react-quill-new/dist/quill.snow.css';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useGlobal } from 'contexts/GlobalContext';
import { useConfiguration } from 'hooks/useConfiguration';

// @assets
import { PlusOutlined as AddIcon, CloseOutlined as CloseIcon, EditOutlined as EditIcon } from '@ant-design/icons';
import CircularLoader from 'components/CircularLoader';

// @components
import { Button, Paper, Box } from '@mui/material';
import { LogisticsShippingList, TLogisticsShippingList } from './components/logistics-ship-list';

// Local imports
import { LogisticFormProps, SelectedSaleContract } from './types';
import { useLogisticData, useLogisticForm } from './hooks';
import { ContractInfoSection, ShipInfoSection, GoodsInfoSection, NotesSection } from './components/sections';
import { getRegionFromExportPortCode } from './utils';

const LogisticForm = forwardRef<any, LogisticFormProps>(({ initialValues, editingId, onEditComplete }, ref) => {
  const intl = useIntl();
  const { getGoodNameById } = useGlobal();
  const { mapConfigObject } = useConfiguration();

  // State management
  const [selectedSaleContract, setSelectedSaleContract] = useState<SelectedSaleContract | null>(null);
  const [editingInitialContainerQuantity, setEditingInitialContainerQuantity] = useState<number>(0);

  // Data hooks
  const {
    initialLoading,
    forwardersLoading,
    shippingLinesLoading,
    goods,
    configList,
    saleContracts,
    forwarders,
    shippingLines,
    exportPortOptions,
    importPortOptions,
    regionOptions
  } = useLogisticData();

  // Calculate max container count
  const maxCount = useMemo(() => {
    const available = selectedSaleContract?.availableContainer || 0;
    return (available + (editingInitialContainerQuantity || 0));
  }, [selectedSaleContract,  editingInitialContainerQuantity]);

  // Calculate restricted export port options
  const calculatedRestrictedExportPortOptions = useMemo(() => {
    if (selectedSaleContract && Array.isArray(selectedSaleContract.transportInfo) && selectedSaleContract.transportInfo.length > 0) {
      const allowedCodes = Array.from(new Set(selectedSaleContract.transportInfo.map((t: any) => t.exportPort).filter(Boolean)));
      return exportPortOptions.filter((opt) => allowedCodes.includes(String(opt.value)));
    }
    return [];
  }, [selectedSaleContract?.transportInfo, exportPortOptions]);

  const callGetListShippingListRef = useRef<TLogisticsShippingList>(null);
  const callGetListShippingListFunc = () => {
    callGetListShippingListRef.current?.callGetListShippingList();
  };

  // Form management hook
  const { formik, loading, currentEditingId, handleEditItem, handleCancel, isLoadingCustomer, handleSaleContractChange, handleBookingNumberChange } = useLogisticForm({
    editingId,
    onEditComplete,
    selectedSaleContract,
    setSelectedSaleContract,
    editingInitialContainerQuantity,
    setEditingInitialContainerQuantity,
    goods,
    forwarders,
    shippingLines,
    saleContracts,
    configList,
    callGetListShippingListFunc
  });

  // Export port change handler with auto-fill logic
  const handleExportPortChange = (newValue: any) => {
    const newCode = newValue ? (newValue as any).value : '';
    formik.setFieldValue('exportPort', newCode);
    
    const regionCode = newCode ? getRegionFromExportPortCode(String(newCode), configList) : '';
    formik.setFieldValue('region', regionCode);
    console.log('selectedSaleContract', selectedSaleContract);
    if (selectedSaleContract?.transportInfo && newCode) {
      const matched = selectedSaleContract.transportInfo.find((t: any) => t.exportPort === newCode);
      console.log('matched', matched);
      formik.setFieldValue('importPort', matched?.importPort || '');
    } else if (!newCode) {
      formik.setFieldValue('importPort', '');
      formik.setFieldValue('region', '');
    }
  };

  // Auto-fill logic when sale contract transport info changes
  useEffect(() => {
    if (selectedSaleContract && Array.isArray(selectedSaleContract.transportInfo) && selectedSaleContract.transportInfo.length > 0) {
      const allowedCodes = Array.from(new Set(selectedSaleContract.transportInfo.map((t: any) => t.exportPort).filter(Boolean)));
      const currentExport = String(formik.values.exportPort || '');
      
      if (currentExport && !allowedCodes.includes(currentExport)) {
        formik.setFieldValue('exportPort', '');
        formik.setFieldValue('importPort', '');
        formik.setFieldValue('region', '');
      }

      if (calculatedRestrictedExportPortOptions.length === 1) {
        const code = String(calculatedRestrictedExportPortOptions[0].value);
        if (currentExport !== code) {
          formik.setFieldValue('exportPort', code);
        }
        const matched = selectedSaleContract.transportInfo.find((t: any) => t.exportPort === code);
        if (matched?.importPort) {
          formik.setFieldValue('importPort', matched.importPort);
        }
        const regionCode = getRegionFromExportPortCode(code, configList);
        if (regionCode) {
          formik.setFieldValue('region', regionCode);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSaleContract?.transportInfo, calculatedRestrictedExportPortOptions]);

  // Ensure containerQuantity does not exceed maxCount
  useEffect(() => {
    if (selectedSaleContract && maxCount > 0) {
      const current = Number(formik.values.containerQuantity || 0);
      if (current > maxCount) {
        formik.setFieldValue('containerQuantity', maxCount);
      }
    }
  }, [selectedSaleContract, maxCount]);

  if (initialLoading) {
    return <CircularLoader />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <form onSubmit={formik.handleSubmit}>
        {/* Contract Information Section */}
        <ContractInfoSection
          formik={formik}
          saleContracts={saleContracts}
          isLoadingCustomer={isLoadingCustomer}
          selectedSaleContract={selectedSaleContract}
          maxCount={maxCount}
          onSaleContractChange={handleSaleContractChange}
          onBookingNumberChange={handleBookingNumberChange}
        />

        {/* Ship Information Section */}
        <ShipInfoSection
          formik={formik}
          forwarders={forwarders}
          shippingLines={shippingLines}
          exportPortOptions={exportPortOptions}
          importPortOptions={importPortOptions}
          regionOptions={regionOptions}
          calculatedRestrictedExportPortOptions={calculatedRestrictedExportPortOptions}
          forwardersLoading={forwardersLoading}
          shippingLinesLoading={shippingLinesLoading}
          selectedSaleContract={selectedSaleContract}
          currentEditingId={currentEditingId}
          onExportPortChange={handleExportPortChange}
        />

        {/* Goods Information Section */}
        <GoodsInfoSection
          formik={formik}
          selectedSaleContract={selectedSaleContract}
          isLoadingCustomer={isLoadingCustomer}
          getGoodNameById={getGoodNameById}
          mapConfigObject={mapConfigObject}
        />

        {/* Notes Section */}
        <NotesSection
          formik={formik}
          isLoadingCustomer={isLoadingCustomer}
        />

        {/* Submit Button */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
            {currentEditingId && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<CloseIcon />}
                onClick={handleCancel}
                sx={{ 
                  minWidth: 120,
                  borderRadius: 2,
                  borderColor: 'grey.400',
                  color: 'grey.600',
                  '&:hover': {
                    borderColor: 'grey.600',
                    backgroundColor: 'grey.50'
                  }
                }}
              >
                {intl.formatMessage({ id: 'common_button_cancel' }) || 'Hủy'}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={currentEditingId ? <EditIcon /> : <AddIcon />}
              loading={loading}
              sx={{ 
                minWidth: 200,
                borderRadius: 2,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              {currentEditingId ? intl.formatMessage({ id: 'common_button_update' }) : intl.formatMessage({ id: 'add_more_shipping' })}
            </Button>
          </Box>
          
          <LogisticsShippingList
            ref={callGetListShippingListRef}
            purchaseContractId={saleContracts.find((item) => item.label === formik.values.codeBooking)?.value || 0}
            onEditItem={handleEditItem}
          />
        </Paper>
      </form>
    </Box>
  );
});

export default LogisticForm;