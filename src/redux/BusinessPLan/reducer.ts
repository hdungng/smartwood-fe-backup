import {
  ACTION_DELETE_BUSINESS_PLAN_BY_ID,
  ACTION_FETCH_BUSINESS_PLAN_BY_ID,
  ACTION_FETCH_LIST_BUSINESS_PLAN,
  ACTION_HANDLE_ERROR,
  ACTION_HANDLE_SUCCESS,
  ACTION_SET_BUSINESS_PLAN,
  ACTION_SET_LIST_BUSINESS_PLAN,
  ACTION_SET_META_LIST_BUSINESS_PLAN,
  ACTION_UPDATE_BUSINESS_PLAN_BY_ID,
  ACTION_UPDATE_FIELD_BUSINESS_PLAN
} from './action';
import { defaultBusinessPlan } from './constant';
import { BusinessPlan, TBusinessPlanState } from './type';

const initialState: TBusinessPlanState = {
  businessPlans: [] as BusinessPlan[],
  businessPlan: defaultBusinessPlan,
  meta: {
    page: 0,
    size: 0,
    total: 0,
    totalPages: 0,
    canNext: true,
    canPrevious: true,
    count: {}
  },
  loading: false,
  success: false,
  error: ''
};

export const businessPLanReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ACTION_SET_LIST_BUSINESS_PLAN:
      return {
        ...state,
        businessPlans: action.payload
      };
    // SAVE_COST_INFO => SAGA
    case ACTION_FETCH_LIST_BUSINESS_PLAN:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_FETCH_BUSINESS_PLAN_BY_ID:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_UPDATE_BUSINESS_PLAN_BY_ID:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_DELETE_BUSINESS_PLAN_BY_ID:
      return { ...state, loading: true, success: false, error: null };
    case ACTION_SET_META_LIST_BUSINESS_PLAN:
      return { ...state, meta: action.payload };
    case ACTION_SET_BUSINESS_PLAN:
      return { ...state, businessPlan: action.payload };
    case ACTION_UPDATE_FIELD_BUSINESS_PLAN:
      const newBusinessPlan = {
        ...state.businessPlan,
        [action.payload.field]: action.payload.value
      };
      return { ...state, businessPlan: newBusinessPlan };
    case ACTION_HANDLE_SUCCESS:
      return { ...state, loading: false, success: true, error: '' };
    case ACTION_HANDLE_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
