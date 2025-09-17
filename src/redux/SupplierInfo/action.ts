export const SET_SUPPLIER_INFO_FORM = 'SET_SUPPLIER_INFO_FORM';
export const UPDATE_SUPPLIER_INFO_FIELD = 'UPDATE_SUPPLIER_INFO_FIELD';
export const RESET_SUPPLIER_INFO_FORM = 'RESET_SUPPLIER_INFO_FORM';

export const setSupplierInfoForm = (data: any) => ({
  type: SET_SUPPLIER_INFO_FORM,
  payload: data
});

export const updateSupplierInfoForm = (field: string, value: any) => ({
  type: UPDATE_SUPPLIER_INFO_FIELD,
  payload: { field, value }
});

export const resetSupplierInfoForm = () => ({
  type: RESET_SUPPLIER_INFO_FORM
});
