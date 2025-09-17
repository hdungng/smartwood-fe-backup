import {
  GET_COST_BY_ID,
  RESET_COST_INFO,
  SAVE_COST_INFO,
  SAVE_COST_INFO_FAILURE,
  SAVE_COST_INFO_SUCCESS,
  SET_COST_INFO,
  UPDATE_COST_FIELD
} from './action';

const initialState = {
  costInfo: {
    code: '',
    status: 0,
    lastUpdatedProgram: '',
    businessPlanId: 1,
    totalFreightEbs: 0,
    factoryToPortCost: 0,
    warehouseRentalCost: 0,
    truckingCost: 0,
    localCharges: 0,
    earlyUnloadingFee: 0,
    thcFee: 0,
    sealFee: 0,
    infrastructureFee: 0,
    customsSupervisionFee: 0,
    fumigationPerContainer: 0,
    fumigationPerLot: 0,
    quarantineFee: 0,
    ttFee: 0,
    coFee: 0,
    doFee: 0,
    palletFee: 0,
    jumboBagFee: 0,
    amsFee: 0,
    customsTeamFee: 0,
    customsReceptionFee: 0,
    clearanceCost: 0,
    interestCost: 0,
    vatInterestCost: 0,
    exchangeRateCost: 0,
    dhlFee: 0,
    brokerageFee: 0,
    taxRefundCost: 0,
    qcCost: 0,
    generalManagementCost: 0,
    currency: 'VND'
  },
  loading: false,
  success: false,
  error: null
};

export const costFormReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_COST_INFO:
      const costInfoSet = {
        ...state.costInfo,
        ...action.payload
      };

      return {
        ...state,
        costInfo: costInfoSet
      };
    case UPDATE_COST_FIELD:
      const costInfoUpdate = {
        ...state.costInfo,
        [action.payload.field]: action.payload.value
      };

      return {
        ...state,
        costInfo: costInfoUpdate
      };
    case RESET_COST_INFO:
      return {
        ...state,
        costInfo: {
          code: '',
          status: 0,
          lastUpdatedProgram: '',
          businessPlanId: 1,
          totalFreightEbs: 0,
          factoryToPortCost: 0,
          warehouseRentalCost: 0,
          truckingCost: 0,
          localCharges: 0,
          earlyUnloadingFee: 0,
          thcFee: 0,
          sealFee: 0,
          infrastructureFee: 0,
          customsSupervisionFee: 0,
          fumigationPerContainer: 0,
          fumigationPerLot: 0,
          quarantineFee: 0,
          ttFee: 0,
          coFee: 0,
          doFee: 0,
          palletFee: 0,
          jumboBagFee: 0,
          amsFee: 0,
          customsTeamFee: 0,
          customsReceptionFee: 0,
          clearanceCost: 0,
          interestCost: 0,
          vatInterestCost: 0,
          exchangeRateCost: 0,
          dhlFee: 0,
          brokerageFee: 0,
          taxRefundCost: 0,
          qcCost: 0,
          generalManagementCost: 0,
          currency: 'VND'
        },
        loading: false,
        success: false,
        error: null
      };
    case GET_COST_BY_ID:
      return { ...state, loading: true, success: false, error: null };
    // SAVE_COST_INFO => SAGA
    case SAVE_COST_INFO:
      return { ...state, loading: true, success: false, error: null };
    case SAVE_COST_INFO_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case SAVE_COST_INFO_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
