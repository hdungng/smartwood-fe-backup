import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  actionCreatePCTruckSchedule,
  actionDeletePCTruckSchedule,
  actionFetchPCTruckSchedules,
  actionUpdatePCTruckSchedule,
  handleError,
  handleSuccess,
  logisticTruckPaginationSelector,
  setPCTruckSchedules,
  setPCTruckSchedulesMeta
} from './slice';
import { AxiosResponse } from 'axios';
import { createPCTruckSchedule, deletePCTruckSchedule, getPCTruckSchedule, updatePCTruckSchedule } from './service';
import { select } from 'redux-saga/effects';
import { TPagination } from './type';
import { TRANSPORT_TYPE } from 'utils';

function* getPCTruckScheduleAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(getPCTruckSchedule, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPCTruckSchedulesMeta(result?.data?.meta));
      yield put(
        setPCTruckSchedules(
          (result?.data?.data ?? []).map((item: any) => ({
            ...item,
            transportType: TRANSPORT_TYPE.TRUCK
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

function* createPCTruckScheduleAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(createPCTruckSchedule, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      const pagination: TPagination = yield select(logisticTruckPaginationSelector);
      yield call(getPCTruckScheduleAsync, { payload: pagination });
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* updatePCTruckScheduleAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(updatePCTruckSchedule, action.payload.id, action.payload.data);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      const pagination: TPagination = yield select(logisticTruckPaginationSelector);
      yield call(getPCTruckScheduleAsync, { payload: pagination });
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* deletePCWeightTicketDetailAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(deletePCTruckSchedule, action.payload);

    if (![200, 204].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      const pagination: TPagination = yield select(logisticTruckPaginationSelector);
      yield call(getPCTruckScheduleAsync, { payload: pagination });
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

export default function* watchPCTruck() {
  yield takeLatest(actionFetchPCTruckSchedules.type, getPCTruckScheduleAsync);
  yield takeLatest(actionCreatePCTruckSchedule.type, createPCTruckScheduleAsync);
  yield takeLatest(actionUpdatePCTruckSchedule.type, updatePCTruckScheduleAsync);
  yield takeEvery(actionDeletePCTruckSchedule.type, deletePCWeightTicketDetailAsync);
}
