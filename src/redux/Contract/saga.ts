import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  ACTION_DELETE_CONTRACT_BY_ID,
  ACTION_FETCH_CONTRACT_BY_ID,
  ACTION_FETCH_LIST_CONTRACT_LIST,
  ACTION_UPDATE_CONTRACT_BY_ID,
  actionSetContract,
  actionSetListContract,
  actionSetMetaContract,
  SAVE_WEIGHING_SLIP,
  saveWeighingInfoFailure,
  saveWeighingInfoSuccess
} from './action';
import { createContractWeigingInfo, deleteContractByID, fetchContract, fetchContractByID, updateContractByID } from './service';
import { RFetchContract, RFetchContractByID, RUpdateContractByID } from './type';
import { handleError, handleSuccess } from './action';

function* saveWeighingSaga(action: any) {
  try {
    const result: { status: number } = yield call(createContractWeigingInfo, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(saveWeighingInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(saveWeighingInfoSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(saveWeighingInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* fetchContractAsync(action: any) {
  try {
    const result: RFetchContract = yield call(fetchContract, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(actionSetListContract(result.data));
      yield put(actionSetMetaContract(result.meta));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* fetchContractByIDAsync(action: any) {
  try {
    const result: RFetchContractByID = yield call(fetchContractByID, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(actionSetContract(result.data));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* updateContractByIDAsync(action: any) {
  try {
    const result: RUpdateContractByID = yield call(updateContractByID, action.payload.id, action.payload.data);

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

function* deleteContractByIDAsync(action: any) {
  try {
    const result: RUpdateContractByID = yield call(deleteContractByID, action.payload);

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

export default function* watchContractSaga() {
  yield takeLatest(SAVE_WEIGHING_SLIP, saveWeighingSaga);
  yield takeLatest(ACTION_FETCH_LIST_CONTRACT_LIST, fetchContractAsync);
  yield takeLatest(ACTION_FETCH_CONTRACT_BY_ID, fetchContractByIDAsync);
  yield takeLatest(ACTION_UPDATE_CONTRACT_BY_ID, updateContractByIDAsync);
  yield takeEvery(ACTION_DELETE_CONTRACT_BY_ID, deleteContractByIDAsync);
}
