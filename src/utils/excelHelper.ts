export const excelDateToJSDate = (serial: any) => {
  const utc_days = Math.floor(serial - 25569);
  const date_info = new Date(utc_days * 86400 * 1000);
  return date_info.toLocaleDateString('en-GB');
};