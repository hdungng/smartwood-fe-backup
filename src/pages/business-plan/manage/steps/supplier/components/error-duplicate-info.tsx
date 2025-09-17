import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../schema';
import Alert from '@mui/material/Alert';
import { useEffect } from 'react';

const ErrorDuplicateInfo = () => {
  const { control, setValue } = useFormContext<SupplierFormProps>();
  const watchedSuppliers = useWatch<SupplierFormProps>({
    control,
    name: 'suppliers'
  }) as SupplierFormProps['suppliers'];

  const hasDuplicateInfo = watchedSuppliers?.some((supplier, index) => {
    return watchedSuppliers.some((otherSupplier, otherIndex) => {
      if (index === otherIndex) return false; // Skip comparing with itself
      return (
        supplier.good?.value === otherSupplier.good?.value &&
        supplier.region === otherSupplier.region &&
        supplier.exportPort === otherSupplier.exportPort &&
        supplier.goodType === otherSupplier.goodType
      );
    });
  });

  useEffect(() => {
    setValue('hasDuplicateRow', !!hasDuplicateInfo);
  }, [hasDuplicateInfo]);

  if ((watchedSuppliers || []).length === 0 || !hasDuplicateInfo) return null;

  return (
    <Alert severity="error" color="error" sx={{ height: 60, display: 'flex', alignItems: 'center' }}>
      Phát hiện có nhà cung cấp trùng thông tin. Vui lòng kiểm tra lại
    </Alert>
  );
};

export default ErrorDuplicateInfo;
