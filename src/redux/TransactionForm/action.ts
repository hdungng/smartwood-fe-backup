export const SET_TRANSACTION_INFO = 'SET_TRANSACTION_INFO';
export const UPDATE_TRANSACTION_FIELD = 'UPDATE_TRANSACTION_FIELD';
export const RESET_TRANSACTION_INFO = 'RESET_TRANSACTION_INFO';
export const SAVE_TRANSACTION_INFO = 'SAVE_TRANSACTION_INFO';
export const SAVE_TRANSACTION_INFO_SUCCESS = 'SAVE_TRANSACTION_INFO_SUCCESS';
export const SAVE_TRANSACTION_INFO_FAILURE = 'SAVE_TRANSACTION_INFO_FAILURE';

export const setTransactionInfo = (data: any) => ({
  type: SET_TRANSACTION_INFO,
  payload: data
});

export const updateTransactionField = (field: string, value: any) => ({
  type: UPDATE_TRANSACTION_FIELD,
  payload: { field, value }
});

export const resetTransactionInfo = () => ({
  type: RESET_TRANSACTION_INFO
});

export const saveTransactionInfo = (data: any) => ({
  type: SAVE_TRANSACTION_INFO,
  payload: data
});

export const saveTransactionInfoSuccess = () => ({
  type: SAVE_TRANSACTION_INFO_SUCCESS
});

export const saveTransactionInfoFailure = (err: string) => ({
  type: SAVE_TRANSACTION_INFO_FAILURE,
  payload: err
});
