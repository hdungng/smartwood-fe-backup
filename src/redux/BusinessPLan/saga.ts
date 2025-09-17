import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  ACTION_DELETE_BUSINESS_PLAN_BY_ID,
  ACTION_FETCH_BUSINESS_PLAN_BY_ID,
  ACTION_FETCH_LIST_BUSINESS_PLAN,
  ACTION_UPDATE_BUSINESS_PLAN_BY_ID,
  actionSetBusinessPlan,
  actionSetListBusinessPlan,
  actionSetMetaBusinessPlan,
  handleError,
  handleSuccess
} from './action';
import { RFetchBusinessPlan, RFetchBusinessPlanByID, RUpdateBusinessPlanByID } from './type';
import { deleteBusinessPlanByID, fetchBusinessPlan, fetchBusinessPlanByID, updateBusinessPlanByID } from './service';

function* fetchBusinessPlanAsync(action: any) {
  try {
    const result: RFetchBusinessPlan = yield call(fetchBusinessPlan, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(actionSetListBusinessPlan(result.data));
      yield put(actionSetMetaBusinessPlan(result.meta));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* fetchBusinessPlanByIDAsync(action: any) {
  try {
    const result: RFetchBusinessPlanByID = yield call(fetchBusinessPlanByID, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(actionSetBusinessPlan(result.data));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* updateBusinessPlanByIDAsync(action: any) {
  try {
    const result: RUpdateBusinessPlanByID = yield call(updateBusinessPlanByID, action.payload.id, action.payload.data);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* deleteBusinessPlanByIDAsync(action: any) {
  try {
    const result: RUpdateBusinessPlanByID = yield call(deleteBusinessPlanByID, action.payload);

    if (![200, 201, 204].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

export default function* watchBusinessPlanSaga() {
  yield takeLatest(ACTION_FETCH_LIST_BUSINESS_PLAN, fetchBusinessPlanAsync);
  yield takeLatest(ACTION_FETCH_BUSINESS_PLAN_BY_ID, fetchBusinessPlanByIDAsync);
  yield takeLatest(ACTION_UPDATE_BUSINESS_PLAN_BY_ID, updateBusinessPlanByIDAsync);
  yield takeEvery(ACTION_DELETE_BUSINESS_PLAN_BY_ID, deleteBusinessPlanByIDAsync);
}
