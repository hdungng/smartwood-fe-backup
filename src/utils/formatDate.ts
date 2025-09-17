export const formatDate = (dateStr: Date | string | undefined) => {
  if (!dateStr) return null;
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return null;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};