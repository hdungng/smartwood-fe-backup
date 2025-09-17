/**
 * Utility function to remove null/undefined values from payload
 * @param payload - The payload object to clean
 * @returns Cleaned payload without null/undefined values
 */
export const cleanPayload = (payload: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};

  Object.keys(payload).forEach((key) => {
    const value = payload[key];

    // Skip null, undefined, empty strings, and empty arrays
    if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

