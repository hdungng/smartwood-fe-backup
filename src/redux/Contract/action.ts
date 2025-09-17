export const SAVE_WEIGHING_SLIP = 'SAVE_WEIGHING_SLIP';
export const SAVE_WEIGHING_INFO_SUCCESS = 'SAVE_WEIGHING_INFO_SUCCESS';
export const SAVE_WEIGHING_INFO_FAILURE = 'SAVE_WEIGHING_INFO_FAILURE';
export const GET_LIST_WEIGHING_SLIP = 'GET_LIST_WEIGHING_SLIP';
export const ACTION_SET_LIST_CONTRACT_LIST = 'ACTION_SET_LIST_CONTRACT_LIST';
export const ACTION_FETCH_LIST_CONTRACT_LIST = 'ACTION_FETCH_LIST_CONTRACT_LIST';
export const ACTION_SET_META_LIST_CONTRACT_LIST = 'ACTION_SET_META_LIST_CONTRACT_LIST';
export const ACTION_HANDLE_SUCCESS = 'ACTION_HANDLE_SUCCESS';
export const ACTION_HANDLE_ERROR = 'ACTION_HANDLE_ERROR';

export const ACTION_SET_CONTRACT = 'ACTION_SET_CONTRACT';
export const ACTION_UPDATE_FIELD_CONTRACT = 'ACTION_UPDATE_FIELD_CONTRACT';
export const ACTION_FETCH_CONTRACT_BY_ID = 'ACTION_FETCH_CONTRACT_BY_ID';
export const ACTION_UPDATE_CONTRACT_BY_ID = 'ACTION_UPDATE_CONTRACT_BY_ID';
export const ACTION_DELETE_CONTRACT_BY_ID = 'ACTION_DELETE_CONTRACT_BY_ID';

import { PaginationMeta, SaleContract, TActionFetchContract, WeighingInfo } from './type';

export const getLisTContractStaeSlip = (data: WeighingInfo[]) => ({
  type: GET_LIST_WEIGHING_SLIP
});

export const saveWeighingSlipInfo = (data: any) => ({
  type: SAVE_WEIGHING_SLIP,
  payload: data
});

export const saveWeighingInfoSuccess = () => ({
  type: SAVE_WEIGHING_INFO_SUCCESS
});

export const saveWeighingInfoFailure = (err: string) => ({
  type: SAVE_WEIGHING_INFO_FAILURE,
  payload: err
});

export const actionSetListContract = (list: SaleContract[]) => ({
  type: ACTION_SET_LIST_CONTRACT_LIST,
  payload: list
});

export const actionFetchContract = (query: Partial<TActionFetchContract>) => ({
  type: ACTION_FETCH_LIST_CONTRACT_LIST,
  payload: query
});

export const actionSetMetaContract = (meta: PaginationMeta) => ({
  type: ACTION_SET_META_LIST_CONTRACT_LIST,
  payload: meta
});

export const handleSuccess = () => ({
  type: ACTION_HANDLE_SUCCESS
});

export const handleError = (err: string) => ({
  type: ACTION_HANDLE_ERROR,
  payload: err
});

export const actionFetchContractByID = (id: number) => ({
  type: ACTION_FETCH_CONTRACT_BY_ID,
  payload: id
});

export const actionUpdateContractByID = (id: number, data: Partial<SaleContract>) => ({
  type: ACTION_UPDATE_CONTRACT_BY_ID,
  payload: { id, data }
});

export const actionDeleteContractByID = (id: number) => ({
  type: ACTION_DELETE_CONTRACT_BY_ID,
  payload: id
});

export const actionSetContract = (payload: SaleContract) => ({
  type: ACTION_SET_CONTRACT,
  payload
});

export const actionUpdateFieldContract = (field: string, value: any) => ({
  type: ACTION_UPDATE_FIELD_CONTRACT,
  payload: { field, value }
});
