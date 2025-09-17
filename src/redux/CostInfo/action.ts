export const SET_COST_INFO = 'SET_COST_INFO';
export const UPDATE_COST_FIELD = 'UPDATE_COST_FIELD';
export const RESET_COST_INFO = 'RESET_COST_INFO';
export const SAVE_COST_INFO = 'SAVE_COST_INFO';
export const SAVE_COST_INFO_SUCCESS = 'SAVE_COST_INFO_SUCCESS';
export const SAVE_COST_INFO_FAILURE = 'SAVE_COST_INFO_FAILURE';
export const GET_COST_BY_ID = 'GET_COST_BY_ID';

export const setCostInfo = (data: any) => ({
  type: SET_COST_INFO,
  payload: data
});

export const updateCostField = (field: string, value: any) => ({
  type: UPDATE_COST_FIELD,
  payload: { field, value }
});

export const resetCostInfo = () => ({
  type: RESET_COST_INFO
});

export const saveCostInfo = (data: any) => ({
  type: SAVE_COST_INFO,
  payload: data
});

export const saveCostInfoSuccess = () => ({
  type: SAVE_COST_INFO_SUCCESS
});

export const saveCostInfoFailure = (err: string) => ({
  type: SAVE_COST_INFO_FAILURE,
  payload: err
});

export const getCostByID = (id: number) => ({
  type: GET_COST_BY_ID,
  payload: id
});
