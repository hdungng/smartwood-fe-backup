import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { handleError, handleSuccess, setPurchaseContracts, actionGetPurchaseContracts } from './slice';
import { AxiosResponse } from 'axios';
import { getPurchaseContract } from './service';

function* getPurchaseContractAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(getPurchaseContract);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPurchaseContracts(result?.data?.data ?? []));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

export default function* watchPurchaseContract() {
  yield takeLatest(actionGetPurchaseContracts.type, getPurchaseContractAsync);
}
