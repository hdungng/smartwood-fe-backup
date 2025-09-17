import { call, put, takeLatest } from 'redux-saga/effects';
import { GET_COST_BY_ID, resetCostInfo, SAVE_COST_INFO, saveCostInfoFailure, saveCostInfoSuccess, setCostInfo } from './action';
import { createCostInfo, getCostByID } from './service';
import { AxiosResponse } from 'axios';

function* saveCostSaga(action: any) {
  try {
    const result: { status: number } = yield call(createCostInfo, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(saveCostInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(saveCostInfoSuccess());
      yield put(resetCostInfo());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(saveCostInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* getCostByIDAsync(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(getCostByID, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(saveCostInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(saveCostInfoSuccess());
      yield put(setCostInfo(result?.data?.data));
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(saveCostInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

export default function* watchCostFormSaga() {
  yield takeLatest(SAVE_COST_INFO, saveCostSaga);
  yield takeLatest(GET_COST_BY_ID, getCostByIDAsync);
}
