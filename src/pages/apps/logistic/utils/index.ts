import { LogisticFormSubmitData } from 'api/logistic';
import { CODE_EXPORT_PORT, CODE_SHIPPING_LINE } from 'constants/code';
import moment from 'moment';
import { SelectionOption } from 'types/common';
import { LogisticFormValues } from '../types';

// Helper function to find code by display name (reverse lookup)
export const findCodeByDisplayName = (configList: any[], configCode: string, displayName: string) => {
  const config = configList?.find((item) => item.code === configCode);
  if (!config) return displayName;
  
  const configItem = config.data?.find((item: any) => item.key === displayName);
  return configItem?.value || displayName;
};

// Helper function to parse port string to object
export const parsePortString = (portString: string) => {
  if (!portString) return null;
  // Format: "code - name (country)"
  const match = portString.match(/^(.+?) - (.+?) \((.+?)\)$/);
  if (match) {
    return {
      code: match[1].trim(),
      name: match[2].trim(),
      country: match[3].trim()
    };
  }
  return null;
};

// Helper to get region code from export port code via config meta
export const getRegionFromExportPortCode = (code: string, configList: any[]) => {
  const exportPortConfig: any = configList?.find((item) => item.code === CODE_EXPORT_PORT);
  const found = (exportPortConfig?.data as any[])?.find((d: any) => d.value === code);
  return found?.metaData?.region || '';
};

// Create payload for API submission
export const createPayload = (
  values: LogisticFormValues,
  selectedSaleContract: any,
  goods: any[],
  forwarders: SelectionOption[],
  shippingLines: SelectionOption[],
  configList: any[]
): LogisticFormSubmitData => {
  const {
    cutoffDate,
    exportPort,
    importPort,
    etaDate,
    etdDate,
    firstContainerDropDate,
    goodId,
    goodType,
    forwarderName,
    shippingLine,
    containerQuantity,
    availableContainerQuantity,
    region,
    bookingNumber,
    codeBooking,
    shipName,
    notes,
    saleContractId
  } = values;

  const containerQty = Number(containerQuantity) || 0;
  const availableContainerQty = Number(availableContainerQuantity) || 0;
  const computedGoodId = (goodId ?? selectedSaleContract?.goodId) as number | undefined;
  const selectedGood = goods.find((item) => item.id === computedGoodId);

  return {
    containerQuantity: containerQty,
    availableContainerQuantity: availableContainerQty,
    etaDate: etaDate ? moment(etaDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
    etdDate: etdDate ? moment(etdDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
    shipName: shipName || '',
    forwarderName: forwarders.find((item) => item.value === forwarderName)?.label || '',
    shippingLine: (() => {
      const selectedShippingLine = shippingLines.find((item) => item.value === shippingLine);
      if (selectedShippingLine?.metadata?.code) {
        return selectedShippingLine.metadata.code;
      }
      return findCodeByDisplayName(configList, CODE_SHIPPING_LINE, selectedShippingLine?.label || '') || selectedShippingLine?.label || '';
    })(),
    firstContainerDropDate: firstContainerDropDate ? moment(firstContainerDropDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
    cutoffDate: cutoffDate ? moment(cutoffDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
    region: typeof region === 'string' ? region : String(region || ''),
    exportPort: typeof exportPort === 'string' ? exportPort : (exportPort as any)?.code || '',
    goodType: goodType || '',
    goodId: selectedGood?.id || computedGoodId || 0,
    notes: notes || '',
    saleContractId: Number(saleContractId),
    importPort: typeof importPort === 'string' ? importPort : (importPort as any)?.code || '',
    vesselCapacity: 0,
    bookingNumber: bookingNumber || null,
    codeBooking: codeBooking || null,
  };
};