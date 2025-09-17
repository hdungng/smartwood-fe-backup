import { FieldArray, Formik, FormikErrors } from 'formik';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router';
import axiosServices from 'utils/axios';

// @components
import { DeleteOutlined } from '@ant-design/icons';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

// @constants
import { SALE_CONTRACT_GOOD } from 'api/CommonAPI/Contract';

// @utils
import { getGoodValidationSchema } from 'validations/form-validation/good-form';

// @types
import { CODE_DESTINATION, CODE_EXPORT_PORT, CODE_PAYMENT_CURRENCY, CODE_UNIT_OF_MEASURE } from 'constants/code';
import { useConfiguration } from 'hooks/useConfiguration';
import { SelectionOption } from 'types/common';
import { ContractDetailsRow, FormValues, GoodItem } from 'types/contracts/sell';
import { mapUnitsFromConfig } from 'utils/mapUnitsFromConfig';
import { useGlobal } from '../../../../../contexts';

export interface ListGoodTableRef {
  getFormValues: () => FormValues | null;
}

export const ListGoodTable = forwardRef<
  ListGoodTableRef,
  {
    saleContractId: number | null | undefined;
    onCallParent?: () => void;
    isViewMode?: boolean;
    transportInfo?: any[];
    businessPlanDetail?: any;
  }
>(({ saleContractId, onCallParent, isViewMode = false, transportInfo = [], businessPlanDetail }, ref) => {
  const intl = useIntl();
  const location = useLocation();
  const { configs: configList } = useGlobal();
  const unitsData = useMemo(() => (configList && configList.length > 0 ? mapUnitsFromConfig(configList) : []), [configList]);

  // Check if we're in edit mode (not view mode)
  const isEditMode = useMemo(() => {
    // Edit/View mode is determined by the presence of a saleContractId
    return Boolean(saleContractId);
  }, [saleContractId]);

  const isViewModeFinal = isViewMode;
  const [loading, setLoading] = useState<boolean>(false);
  const [listGood, setListGood] = useState<GoodItem[]>([]);
  const [config, setConfig] = useState<{
    exportPort: { key: string; value: string }[];
    importPort: { key: string; value: string }[];
    unit: { key: string; value: string }[];
    code: { key: string; value: string }[];
  }>({
    exportPort: [],
    importPort: [],
    unit: [],
    code: []
  });
  const { mapConfigObject } = useConfiguration();

  // Add state to store current form values
  const [currentFormValues, setCurrentFormValues] = useState<FormValues | null>(null);
  const [formKey, setFormKey] = useState<number>(0);
  const deliveryLocationCode = businessPlanDetail?.draftPo?.deliveryLocation;
  // All export ports from config; default value will come from Business Plan item per row
  const exportPortOptions: SelectionOption[] = useMemo(
    () => {
      const options = (config.exportPort || []).map((opt: any) => ({ label: opt.key, value: opt.value }));
      return options;
    },
    [config.exportPort]
  );

  // Convert delivery location code to the Select's stored value using config
  const deliveryImportPortValue = useMemo(() => {
    if (!deliveryLocationCode || !config.importPort?.length) return '';
    const found = config.importPort.find((opt) => opt.key === deliveryLocationCode);
    return found?.value || '';
  }, [deliveryLocationCode, config.importPort]);

  // Memoize validation schema to prevent infinite re-creation
  const validationSchema = useMemo(() => {
    return getGoodValidationSchema(intl);
  }, [intl]);

  // All import ports from config
  const importPortOptions: SelectionOption[] = useMemo(
    () => {
      const options = (config.importPort || []).map((opt: any) => ({ label: opt.key, value: opt.value }));
      return options;
    },
    [config.importPort]
  );

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getFormValues: () => {
      return currentFormValues;
    }
  }));

  useEffect(() => {
    if (configList && configList.length > 0) {
      fetchGetConfig();
    }
  }, [configList]); // Add configList as dependency to ensure config is loaded when available

  useEffect(() => {
    if (saleContractId) {
      // In edit/view, always fetch the actual list from API
      fetchGetTransportInfo();
    } else {
      // In create, there is no saleContractId yet
      setListGood([]);
    }
  }, [saleContractId, config.exportPort.length]);

  // Update form when listGood or config changes
  useEffect(() => {
    if (config.exportPort.length > 0) {
      setFormKey((prev) => prev + 1);
    }
  }, [listGood, config]);

  // Auto-create rows on create screen based on businessPlanSupplierItems
  useEffect(() => {
    if (isEditMode) return; // skip in edit
    if (!businessPlanDetail) return;
    if (!config.exportPort.length) return; // Wait for exportPort config to be loaded
    const supplierItems = businessPlanDetail?.businessPlanSupplierItems || [];
    if (!supplierItems.length) return;
    
    const rows: GoodItem[] = supplierItems.map((supplierItem: any) => {
      const exportPortKey = supplierItem?.exportPort || '';
      
      return {
        id: 0,
        saleContractId: 0,
        // Prefill export port by supplier item (key). It will be mapped to display value in initialValues
        exportPort: exportPortKey, // Keep as key, will be mapped in initialValues
        importPort: deliveryImportPortValue,
        unit: '',
        unitPrice: 0,
        currency: ''
      };
    });
    setListGood(rows);
    setFormKey((prev) => prev + 1);
  }, [businessPlanDetail, config.exportPort, isEditMode, deliveryImportPortValue]);

  const initialValues: FormValues = {
    contractDetailsRows:
      listGood && listGood.length > 0
        ? listGood.map((item: any) => {
            // Map from API values to display values for exportPort and importPort only
            // For exportPort: if item.exportPort is a key (like "HAI_PHONG"), find the corresponding value
            const exportPortConfig = config.exportPort.find(
              (configItem: any) => configItem.key === item.exportPort
            );
            const importPortConfig = config.importPort.find(
              (configItem: any) => configItem.key === item.importPort || configItem.value === item.importPort
            );



            // Different logic for edit mode vs create mode
            let mappedItem;

            if (isEditMode) {
              // EDIT MODE: Use actual saved values from transportInfo/database
              // In edit mode, item.exportPort from API is usually a key (like "HAI_PHONG")
              // We need to convert it to value for display
              let exportPortValue = item.exportPort;
              
              // First try to find by key (most common case in edit mode)
              const foundByKey = config.exportPort.find((configItem: any) => configItem.key === item.exportPort);
              if (foundByKey) {
                exportPortValue = foundByKey.value;
              } else {
                // If not found by key, check if it's already a value
                const foundByValue = config.exportPort.find((configItem: any) => configItem.value === item.exportPort);
                if (!foundByValue) {
                  // If not found at all, keep original value
                  exportPortValue = item.exportPort;
                }
              }

              mappedItem = {
                id: item.id,
                saleContractId: item.saleContractId,
                exportPort: exportPortValue,
                importPort: importPortConfig?.value || item.importPort || '',
                unit: item.unit || '', // Use actual saved unit value
                unitPrice: item.unitPrice || 0, // Use actual saved unitPrice value
                currency: item.currency || '' // Use actual saved currency value
              };
            } else {
              // CREATE MODE: Use default values from PAKD (businessPlanDetail)
              mappedItem = {
                id: item.id,
                saleContractId: item.saleContractId,
                exportPort: exportPortConfig?.value || item.exportPort || '',
                importPort: deliveryImportPortValue || importPortConfig?.value || item.importPort || '',
                unit: '', // Readonly field, displayed from businessPlanDetail
                unitPrice: 0, // Readonly field, displayed from businessPlanDetail
                currency: '' // Readonly field, displayed from businessPlanDetail
              };
            }

            return mappedItem;
          })
        : [
            {
              id: 0,
              saleContractId: 0,
              exportPort: '',
              importPort: '',
              unit: '',
              unitPrice: 0,
              currency: ''
            }
          ]
  };



  const createHeaderCell = (label: string, widthPercent: number = 16.67, colSpan?: number) => (
    <TableCell
      sx={{
        width: `${widthPercent}%`,
        minWidth: '60px',
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
        padding: '8px 4px',
        ...(colSpan && { textAlign: 'center' })
      }}
      {...(colSpan && { colSpan })}
    >
      {intl.formatMessage({ id: label })}
    </TableCell>
  );

  const getFieldError = (errors: FormikErrors<FormValues>, touched: any, fieldPath: string) => {
    const fieldErrors = errors.contractDetailsRows;
    if (fieldErrors && Array.isArray(fieldErrors)) {
      const index = parseInt(fieldPath.split('.')[1]);
      const field = fieldPath.split('.')[2];
      const rowErrors = fieldErrors[index] as FormikErrors<ContractDetailsRow>;
      return rowErrors?.[field as keyof ContractDetailsRow] as string;
    }
    return undefined;
  };

  const isFieldTouched = (touched: any, fieldPath: string) => {
    const fieldTouched = touched.contractDetailsRows;
    if (fieldTouched && Array.isArray(fieldTouched)) {
      const index = parseInt(fieldPath.split('.')[1]);
      const field = fieldPath.split('.')[2];
      const rowTouched = fieldTouched[index];
      return rowTouched?.[field as keyof ContractDetailsRow];
    }
    return false;
  };

  const fetchGetTransportInfo = async () => {
    if (!saleContractId) return;
    try {
      const { data, status } = await axiosServices.get(SALE_CONTRACT_GOOD.COMMON + `?saleContractId=${saleContractId}`);
      if (status === 200 || status === 201) {
        const transportData = data?.data || [];
        setListGood(transportData);
      }
    } catch (error) {
      console.error('Error fetching transport info:', error);
    }
  };

  const fetchGetConfig = () => {
    try {
      // Use configs from global context instead of fetching from API
      const listExportPort = configList?.find((item: any) => item.code === CODE_EXPORT_PORT)?.data;
      const listImportPort = configList?.find((item: any) => item.code === CODE_DESTINATION)?.data;
      const listUnit = configList?.find((item: any) => item.code === CODE_UNIT_OF_MEASURE)?.data;
      const listCurrency = configList?.find((item: any) => item.code === CODE_PAYMENT_CURRENCY)?.data;
      
      setConfig((prev) => {
        const newConfig = {
          ...prev,
          exportPort: listExportPort || [],
          importPort: listImportPort || [],
          unit: listUnit || [],
          code: listCurrency || []
        };
        return newConfig;
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'get_list_of_export_destination_port_unsuccessfully' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const handleSubmit = (values: FormValues) => {
    if (!saleContractId) {
      enqueueSnackbar(intl.formatMessage({ id: 'sale_contract_id_empty' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
      return;
    }

    if (isEditMode) {
      // SCREEN UPDATE
      // Filter array are not exist on listGood
      // Create record which is added and updated all record in list
      const filterRecord = values.contractDetailsRows.slice((listGood as GoodItem[]).length);
      if (filterRecord && filterRecord.length > 0) {
        onCreateGoodRecord(filterRecord, () => {
          onUpdateGoodRecord(listGood as GoodItem[], () => onCallParent && onCallParent(), values.contractDetailsRows);
        });
        return;
      } else {
        onUpdateGoodRecord(listGood as GoodItem[], undefined, values.contractDetailsRows);
        return;
      }
    } else {
      // SCREEN CREATE
      const { contractDetailsRows } = values || {};
      onCreateGoodRecord(contractDetailsRows);
    }
  };

  const onUpdateGoodRecord = async (arr: GoodItem[] = [], func?: () => void, arrForm: GoodItem[] = []) => {
    try {
      setLoading(true);
      await Promise.allSettled(
        arr.map((supplier, index) => {
          // Get form values for this specific row
          const formRow = arrForm[index];
          if (!formRow) {
            return;
          }

          const { id, saleContractId, exportPort, importPort } = formRow;

          // In edit mode, use actual saved values; in create mode, use PAKD defaults
          let unitOfMeasure, unitPrice, paymentCurrency;

          if (isEditMode && formRow.unit && formRow.unitPrice && formRow.currency) {
            // EDIT MODE: Use actual saved values from form/database
            unitOfMeasure = formRow.unit;
            unitPrice = formRow.unitPrice;
            paymentCurrency = formRow.currency;
          } else {
            // CREATE MODE: Use default values from PAKD (businessPlanDetail)
            unitOfMeasure = businessPlanDetail?.draftPo?.unitOfMeasure;
            unitPrice = businessPlanDetail?.draftPo?.unitPrice;
            paymentCurrency = businessPlanDetail?.draftPo?.paymentCurrency;
          }

          const payload = {
            id: id,
            saleContractId: saleContractId,
            exportPort: config.exportPort.find((item) => item.value === exportPort)?.key,
            importPort: config.importPort.find((item) => item.value === importPort)?.key,
            unit: unitOfMeasure,
            unitPrice: unitPrice,
            currency: paymentCurrency
          };
          if (!supplier?.id) return;
          return axiosServices.put(SALE_CONTRACT_GOOD.COMMON + `/${supplier?.id}`, { ...payload });
        })
      );
      enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'success'
      });
      func && func();
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const onCreateGoodRecord = async (arr: GoodItem[], func?: () => void) => {
    try {
      setLoading(true);
      const response = await Promise.all(
        arr.map((supplier) => {
          const { id, saleContractId, exportPort, importPort } = supplier || {};

          // In edit mode, use actual saved values; in create mode, use PAKD defaults
          let unitOfMeasure, unitPrice, paymentCurrency;

          if (isEditMode && supplier.unit && supplier.unitPrice && supplier.currency) {
            // EDIT MODE: Use actual saved values from form/database
            unitOfMeasure = supplier.unit;
            unitPrice = supplier.unitPrice;
            paymentCurrency = supplier.currency;
          } else {
            // CREATE MODE: Use default values from PAKD (businessPlanDetail)
            unitOfMeasure = businessPlanDetail?.draftPo?.unitOfMeasure;
            unitPrice = businessPlanDetail?.draftPo?.unitPrice;
            paymentCurrency = businessPlanDetail?.draftPo?.paymentCurrency;
          }

          const payload = {
            id: id,
            saleContractId: saleContractId,
            exportPort: config.exportPort.find((item) => item.value === exportPort)?.key,
            importPort: config.importPort.find((item) => item.value === importPort)?.key,
            unit: unitOfMeasure,
            unitPrice: unitPrice,
            currency: paymentCurrency
          };
          return axiosServices.post(SALE_CONTRACT_GOOD.COMMON, { ...payload });
        })
      );
      if (response.every((item) => item.status === 200 || item.status === 201)) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_create_success_text' }), {
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
          variant: 'success'
        });
        func && func();
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' },
        variant: 'error'
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid size={12}>
      <Box sx={{ mt: 3 }}>
        <Formik
          key={formKey}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isValid, submitForm }: any) => {
            // Update current form values whenever they change
            useEffect(() => {
              setCurrentFormValues(values);
            }, [values]);

            return (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                    {intl.formatMessage({ id: 'transport_details_title' })}
                  </Typography>
                  {!isViewModeFinal && (
                    <FieldArray name="contractDetailsRows">
                      {({ push, remove }) => (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            push({
                              exportPort: '',
                              importPort: '',
                              unit: '',
                              unitPrice: null,
                              currency: '',
                              totalWeight: null
                            });
                          }}
                        >
                          {intl.formatMessage({ id: 'add_row_button' })}
                        </Button>
                      )}
                    </FieldArray>
                  )}
                </Stack>

                <TableContainer component={Paper} sx={{ maxHeight: 400, overflowX: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {createHeaderCell('export_port_header', 45)}
                        {createHeaderCell('receiving_port_header', 45)}
                        {createHeaderCell('actions_header', 10)}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <FieldArray name="contractDetailsRows">
                        {({ push, remove }) => (
                          <>
                            {values.contractDetailsRows.map((row: any, index: number) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  {isViewModeFinal ? (
                                    <TextField
                                      value={(() => {
                                        // In view mode, row.exportPort should be a value (like "HAI_PHONG_001")
                                        // We need to find the corresponding label
                                        const foundOption = exportPortOptions.find((item) => item.value === row.exportPort);
                                        if (foundOption) {
                                          return foundOption.label;
                                        }
                                        // If not found by value, try to find by key (fallback)
                                        const foundByKey = config.exportPort.find((configItem: any) => configItem.key === row.exportPort);
                                        if (foundByKey) {
                                          return foundByKey.key;
                                        }
                                        // If still not found, return original value
                                        return row.exportPort || '';
                                      })()}
                                      fullWidth
                                      InputProps={{
                                        readOnly: true,
                                        style: { backgroundColor: '#f5f5f5', color: 'text.secondary', textAlign: 'center' }
                                      }}
                                      sx={{
                                        '& .MuiInputBase-root': {
                                          backgroundColor: '#f5f5f5',
                                          '&:hover': { backgroundColor: '#f0f0f0' }
                                        },
                                        '& .MuiInputBase-input': {
                                          color: 'text.secondary',
                                          cursor: 'default',
                                          textAlign: 'center'
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Autocomplete
                                      options={exportPortOptions}
                                      getOptionLabel={(option) => option.label || ''}
                                      isOptionEqualToValue={(option, value) => option.value === value.value}
                                      value={exportPortOptions.find((item) => item.value === row.exportPort) || null}
                                      onChange={(_, newValue) => {
                                        setFieldValue(`contractDetailsRows.${index}.exportPort`, newValue?.value || '');
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          name={`contractDetailsRows.${index}.exportPort`}
                                          placeholder={intl.formatMessage({ id: 'select_export_port' })}
                                          error={
                                            isFieldTouched(touched, `contractDetailsRows.${index}.exportPort`) &&
                                            Boolean(getFieldError(errors, touched, `contractDetailsRows.${index}.exportPort`))
                                          }
                                          helperText={
                                            isFieldTouched(touched, `contractDetailsRows.${index}.exportPort`) &&
                                            getFieldError(errors, touched, `contractDetailsRows.${index}.exportPort`)
                                              ? getFieldError(errors, touched, `contractDetailsRows.${index}.exportPort`)
                                              : undefined
                                          }
                                          sx={{
                                            '& .MuiInputBase-input': {
                                              textAlign: 'center'
                                            }
                                          }}
                                        />
                                      )}
                                    />
                                  )}
                                </TableCell>
                                <TableCell sx={{ padding: '8px 4px' }}>
                                  <TextField
                                    value={mapConfigObject(CODE_DESTINATION, deliveryLocationCode) || ''}
                                    fullWidth
                                    InputProps={{
                                      readOnly: true,
                                      style: { backgroundColor: '#f5f5f5', color: 'text.secondary', textAlign: 'center' }
                                    }}
                                    sx={{
                                      '& .MuiInputBase-root': {
                                        backgroundColor: '#f5f5f5',
                                        '&:hover': { backgroundColor: '#f0f0f0' }
                                      },
                                      '& .MuiInputBase-input': {
                                        color: 'text.secondary',
                                        cursor: 'default',
                                        textAlign: 'center'
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                  {!isViewModeFinal && (
                                    <IconButton
                                      color="error"
                                      onClick={() => {
                                        remove(index);
                                      }}
                                      disabled={values.contractDetailsRows.length === 0}
                                    >
                                      <DeleteOutlined />
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        )}
                      </FieldArray>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          }}
        </Formik>
      </Box>
    </Grid>
  );
});
