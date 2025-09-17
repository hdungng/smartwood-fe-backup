export const handleAsync = async <T = any>(
  asyncOperation: () => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: any) => void,
  onFinal?: (result: T) => void
): Promise<T | null> => {
  let result: T | null = null;
  try {
    result = await asyncOperation();
    onSuccess?.(result);
    return result;
  } catch (err) {
    onError?.(err);
    return null;
  } finally {
    onFinal?.(result as T);
  }
};

export const formatWeight = (weight: number, type: string) => {
  return type === 'truck' ? `${weight} tấn` : `${weight} cont`;
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN').format(date);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
