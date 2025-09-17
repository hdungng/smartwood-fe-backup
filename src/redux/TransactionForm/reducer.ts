import {
  RESET_TRANSACTION_INFO,
  SAVE_TRANSACTION_INFO,
  SAVE_TRANSACTION_INFO_FAILURE,
  SAVE_TRANSACTION_INFO_SUCCESS,
  SET_TRANSACTION_INFO,
  UPDATE_TRANSACTION_FIELD
} from './action';

const initialState = {
  transactionInfo: {
    exchangeRateBuy: null,
    exchangeRateSell: null,
    shippingMethod: '',
    packingMethod: '',
    weightPerContainer: null,
    estimatedTotalContainers: null,
    estimatedTotalBookings: null
  },
  loading: false,
  success: false,
  error: null
};

export const transactionFormReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_TRANSACTION_INFO:
      const transactionInfoSet = {
        ...state.transactionInfo,
        ...action.payload
      };

      return {
        ...state,
        transactionInfo: transactionInfoSet
      };
    case UPDATE_TRANSACTION_FIELD:
      const transactionInfoUpdate = {
        ...state.transactionInfo,
        [action.payload.field]: action.payload.value
      };

      return {
        ...state,
        transactionInfo: transactionInfoUpdate
      };
    case RESET_TRANSACTION_INFO:
      return {
        ...initialState
      };
    // SAVE_TRANSACTION_INFO => SAGA
    case SAVE_TRANSACTION_INFO:
      return { ...state, loading: true, success: false, error: null };
    case SAVE_TRANSACTION_INFO_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case SAVE_TRANSACTION_INFO_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
