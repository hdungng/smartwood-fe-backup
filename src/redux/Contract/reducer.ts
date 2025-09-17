import {
  ACTION_DELETE_CONTRACT_BY_ID,
  ACTION_FETCH_CONTRACT_BY_ID,
  ACTION_HANDLE_ERROR,
  ACTION_HANDLE_SUCCESS,
  ACTION_SET_CONTRACT,
  ACTION_UPDATE_CONTRACT_BY_ID,
  ACTION_UPDATE_FIELD_CONTRACT
} from './action';
import {
  SAVE_WEIGHING_SLIP,
  SAVE_WEIGHING_INFO_FAILURE,
  SAVE_WEIGHING_INFO_SUCCESS,
  ACTION_SET_META_LIST_CONTRACT_LIST,
  ACTION_FETCH_LIST_CONTRACT_LIST,
  ACTION_SET_LIST_CONTRACT_LIST
} from './action';
import { WeighingInfo, TContractStae, SaleContract } from './type';

const initialState: TContractStae = {
  weighingInfo: {
    saleContractId: 3,
    contNo: '123',
    sealNo: '234',
    weightNet: 23,
    weightGross: 4577,
    weighingDate: '2025-06-29'
  },
  contracts: [] as SaleContract[],
  contract: {
    id: 0,
    createdAt: '',
    lastUpdatedAt: '',
    createdBy: 0,
    lastUpdatedBy: 0,
    lastProgramUpdate: '',
    code: '',
    status: 0,
    lastUpdatedProgram: '',
    contractId: 0,
    customerId: 0,
    codeBooking: 0,
    notes: '',
    buyerName: '',
    contractDate: '',
    goodDescription: '',
    paymentTerms: '',
    tolerancePercentage: 0,
    endUserThermalPower: '',
    weightPerContainer: 0,
    lcNumber: '',
    lcDate: '',
    paymentDeadline: '',
    issuingBankId: 0,
    advisingBankId: 0,
    lcAmount: 0,
    currency: '',
    lcStatus: '',
    transportInfo: [],
    contractCode: '',
    saleContractCode: ''
  },
  meta: {
    page: 0,
    size: 0,
    total: 0,
    totalPages: 0,
    canNext: true,
    canPrevious: true
  },
  loading: false,
  success: false,
  error: null
};

export const contractReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SAVE_WEIGHING_SLIP:
      return {
        ...state,
        loading: true,
        success: false,
        error: null
      };
    case SAVE_WEIGHING_INFO_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case SAVE_WEIGHING_INFO_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ACTION_SET_LIST_CONTRACT_LIST:
      return {
        ...state,
        contracts: action.payload
      };
    // SAVE_COST_INFO => SAGA
    case ACTION_FETCH_LIST_CONTRACT_LIST:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_SET_META_LIST_CONTRACT_LIST:
      return { ...state, meta: action.payload };

    case ACTION_FETCH_CONTRACT_BY_ID:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_UPDATE_CONTRACT_BY_ID:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_DELETE_CONTRACT_BY_ID:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_SET_CONTRACT:
      return { ...state, contract: action.payload };
    case ACTION_UPDATE_FIELD_CONTRACT:
      const newContract = {
        ...state.contract,
        [action.payload.field]: action.payload.value
      };
      return { ...state, contract: newContract };

    case ACTION_HANDLE_SUCCESS:
      return { ...state, loading: false, success: true, error: '' };
    case ACTION_HANDLE_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
