import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  createPCWeightTicket,
  updatePCWeightTicketDetail,
  updatePCWeightTicket,
  fetchPCWeightTicketDetailByPCWeightTicketID,
  fetchPCWeightTicketByID,
  deletePCWeightTicketDetail,
  createPCWeightTicketDetail,
  updatePurchaseContractByID
} from './service';

import {
  setPCWeightTicket,
  setPCWeightTicketItems,
  actionCreatePCWeightTicket,
  actionCreatePCWeightTicketDetail,
  actionDeletePCWeightTicketDetail,
  actionFetchPCWeightTicketByID,
  actionFetchPCWeightTicketDetailByPCWeightTicketID,
  actionUpdatePCWeightTicket,
  actionUpdatePCWeightTicketDetail,
  handleError,
  handleSuccess,
  actionUpdatePurchaseContractByID
} from './slice';
import { AxiosResponse } from 'axios';
import { isEmpty } from 'lodash-es';
import { PCWeightTicketItem } from 'types/contracts/purchase/weight-slip';

function* createPCWeightTicketAsync(action: any) {
  try {
    const { weightTicketItems, ...PCWeightTicket } = action.payload;
    const result: AxiosResponse<any> = yield call(createPCWeightTicket, PCWeightTicket);
    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      if (!isEmpty(weightTicketItems)) {
        for (const item of weightTicketItems) {
          const itemCreate: PCWeightTicketItem = {
            ...item,
            weightTicketId: result?.data?.data?.id
          };

          yield call(createPCWeightTicketDetail, itemCreate);
        }
      }
      yield put(actionFetchPCWeightTicketByID(result?.data?.data?.id));
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* updatePCWeightTicketDetailAsync(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(updatePCWeightTicketDetail, action.payload.id, action.payload.data);
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

function* updatePCWeightTicketAsync(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(updatePCWeightTicket, action.payload.id, action.payload.data);

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

function* fetchPCWeightTicketDetailByPCWeightTicketIDAsync(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(fetchPCWeightTicketDetailByPCWeightTicketID, action.payload?.PCWeightTicketID);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPCWeightTicketItems(result?.data?.data));

      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* fetchPCWeightTicketByIDAsync(action: any) {
  const result: AxiosResponse<any> = yield call(fetchPCWeightTicketByID, action.payload);

  try {
    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPCWeightTicket(result?.data?.data));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* deletePCWeightTicketDetailAsync(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(deletePCWeightTicketDetail, action.payload);
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

function* createPCWeightTicketDetailAsync(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(createPCWeightTicketDetail, action.payload);

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

function* updatePurchaseContractByIDAsync(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(updatePurchaseContractByID, action.payload.id, action.payload.data);

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

export default function* watchWeightTicketSaga() {
  yield takeLatest(actionCreatePCWeightTicket.type, createPCWeightTicketAsync);

  yield takeLatest(actionUpdatePCWeightTicketDetail.type, updatePCWeightTicketDetailAsync);

  yield takeLatest(actionUpdatePCWeightTicket.type, updatePCWeightTicketAsync);

  yield takeLatest(actionFetchPCWeightTicketDetailByPCWeightTicketID.type, fetchPCWeightTicketDetailByPCWeightTicketIDAsync);

  yield takeLatest(actionFetchPCWeightTicketByID.type, fetchPCWeightTicketByIDAsync);

  yield takeLatest(actionCreatePCWeightTicketDetail.type, createPCWeightTicketDetailAsync);
  yield takeLatest(actionDeletePCWeightTicketDetail.type, deletePCWeightTicketDetailAsync);
  yield takeLatest(actionUpdatePurchaseContractByID.type, updatePurchaseContractByIDAsync);
}
