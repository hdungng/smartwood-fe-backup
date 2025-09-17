import { SelectionOption } from 'types/common';
import { TForwarder } from 'types/forwarder.types';

/**
 * Maps forwarder data from master API to SelectionOption format
 * @param forwarders - Array of forwarder data from master API
 * @returns Array of SelectionOption for use in dropdowns
 */
export const mapForwardersFromMaster = (forwarders: TForwarder[]): SelectionOption[] => {
  if (!Array.isArray(forwarders)) {
    return [];
  }

  return forwarders
    .filter(forwarder => forwarder.status === 1) // Only active forwarders
    .map(forwarder => ({
      label: forwarder.forwarderNameVn || forwarder.forwarderNameEn || forwarder.code,
      value: forwarder.id.toString(),
      metadata: {
        code: forwarder.code,
        nameVn: forwarder.forwarderNameVn,
        nameEn: forwarder.forwarderNameEn,
        taxCode: forwarder.taxCode,
        address: forwarder.address
      }
    }));
};
