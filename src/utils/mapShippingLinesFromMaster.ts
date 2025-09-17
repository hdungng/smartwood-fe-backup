import { SelectionOption } from 'types/common';
import { TShippingLine } from 'types/shipping-line';

/**
 * Maps shipping line data from master API to SelectionOption format
 * @param shippingLines - Array of shipping line data from master API
 * @returns Array of SelectionOption for use in dropdowns
 */
export const mapShippingLinesFromMaster = (shippingLines: TShippingLine[]): SelectionOption[] => {
  if (!Array.isArray(shippingLines)) {
    return [];
  }

  return shippingLines
    .filter(line => line.status === 1) // Only active shipping lines
    .map(line => ({
      label: line.name,
      value: line.id.toString(),
      metadata: {
        code: line.code,
        name: line.name
      }
    }));
};
