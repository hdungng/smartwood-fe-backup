import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  actionFetchPCShipSchedules,
  actionUpdatePCShipSchedule,
  handleError,
  handleSuccess,
  logisticShipPaginationSelector,
  setPCShipSchedules,
  setPCShipSchedulesMeta
} from './slice';
import { AxiosResponse } from 'axios';
import { select } from 'redux-saga/effects';
import { TPagination } from './type';
import { getPCShipSchedule, updatePCShipSchedule } from './service';
import { TRANSPORT_TYPE } from 'utils';

function* getPCShipScheduleAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(getPCShipSchedule, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPCShipSchedulesMeta(result?.data?.meta));
      yield put(
        setPCShipSchedules(
          (result?.data?.data ?? []).map((item: any) => ({
            ...item,
            transportType: TRANSPORT_TYPE.SHIP
          }))
        )
      );
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* updatePCShipScheduleAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(updatePCShipSchedule, action.payload.id, action.payload.data);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      const pagination: TPagination = yield select(logisticShipPaginationSelector);
      yield call(getPCShipScheduleAsync, { payload: pagination });
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

export default function* watchPCShip() {
  yield takeLatest(actionFetchPCShipSchedules.type, getPCShipScheduleAsync);
  yield takeLatest(actionUpdatePCShipSchedule.type, updatePCShipScheduleAsync);
}
