import { BusinessPlan, PaginationMeta, TActionFetchBusinessPlan } from './type';

export const ACTION_SET_LIST_BUSINESS_PLAN = 'ACTION_SET_LIST_BUSINESS_PLAN';
export const ACTION_FETCH_LIST_BUSINESS_PLAN = 'ACTION_FETCH_LIST_BUSINESS_PLAN';
export const ACTION_SET_META_LIST_BUSINESS_PLAN = 'ACTION_SET_META_LIST_BUSINESS_PLAN';
export const ACTION_SET_BUSINESS_PLAN = 'ACTION_SET_BUSINESS_PLAN';
export const ACTION_UPDATE_FIELD_BUSINESS_PLAN = 'ACTION_UPDATE_FIELD_BUSINESS_PLAN';
export const ACTION_FETCH_BUSINESS_PLAN_BY_ID = 'ACTION_FETCH_BUSINESS_PLAN_BY_ID';
export const ACTION_UPDATE_BUSINESS_PLAN_BY_ID = 'ACTION_UPDATE_BUSINESS_PLAN_BY_ID';
export const ACTION_DELETE_BUSINESS_PLAN_BY_ID = 'ACTION_DELETE_BUSINESS_PLAN_BY_ID';

export const ACTION_HANDLE_SUCCESS = 'ACTION_HANDLE_SUCCESS';
export const ACTION_HANDLE_ERROR = 'ACTION_HANDLE_ERROR';

export const actionSetListBusinessPlan = (list: BusinessPlan[]) => ({
  type: ACTION_SET_LIST_BUSINESS_PLAN,
  payload: list
});

export const actionSetBusinessPlan = (payload: BusinessPlan) => ({
  type: ACTION_SET_BUSINESS_PLAN,
  payload
});

export const actionUpdateFieldBusinessPlan = (field: string, value: any) => ({
  type: ACTION_UPDATE_FIELD_BUSINESS_PLAN,
  payload: { field, value }
});

export const actionFetchBusinessPlan = (query: Partial<TActionFetchBusinessPlan>) => ({
  type: ACTION_FETCH_LIST_BUSINESS_PLAN,
  payload: query
});

export const actionFetchBusinessPlanByID = (id: number) => ({
  type: ACTION_FETCH_BUSINESS_PLAN_BY_ID,
  payload: id
});

export const actionUpdateBusinessPlanByID = (id: number, data: Partial<BusinessPlan>) => ({
  type: ACTION_UPDATE_BUSINESS_PLAN_BY_ID,
  payload: { id, data }
});

export const actionDeleteBusinessPlanByID = (id: number) => ({
  type: ACTION_DELETE_BUSINESS_PLAN_BY_ID,
  payload: id
});

export const actionSetMetaBusinessPlan = (meta: PaginationMeta) => ({
  type: ACTION_SET_META_LIST_BUSINESS_PLAN,
  payload: meta
});

export const handleSuccess = () => ({
  type: ACTION_HANDLE_SUCCESS
});

export const handleError = (err: string) => ({
  type: ACTION_HANDLE_ERROR,
  payload: err
});
