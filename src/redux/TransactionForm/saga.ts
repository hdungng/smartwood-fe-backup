import { call, put, takeLatest } from 'redux-saga/effects';
import { SAVE_TRANSACTION_INFO, saveTransactionInfoFailure, saveTransactionInfoSuccess } from './action';
import { createTransactionInfo } from './service';

function* saveTransactionSaga(action: any) {
  try {
    const result: { status: number } = yield call(createTransactionInfo, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(saveTransactionInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(saveTransactionInfoSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(saveTransactionInfoFailure('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

export default function* watchTransactionFormSaga() {
  yield takeLatest(SAVE_TRANSACTION_INFO, saveTransactionSaga);
}
