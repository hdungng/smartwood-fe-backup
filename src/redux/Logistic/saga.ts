import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  createApproval,
  createPCPackingPlan,
  createPCPackingPlanGoodSupplier,
  deletePCPackingPlanGoodSupplierByID,
  fetchApprovalByPCPackingPlanID,
  fetchContract,
  fetchPCPackingPlanGoodSupplier,
  fetchPurchaseContractByID,
  updatePCPackingPlan,
  updatePCPackingPlanGoodSupplier
} from './service';
import { AxiosResponse } from 'axios';
import {
  actionCreatePCPackingPlanGoodSupplier,
  actionCreatePurchaseContractPackingPlan,
  actionDeletePCPackingPlanGoodSupplierByID,
  actionFetchApprovalByPCPackingPlanID,
  actionFetchContracts,
  actionFetchPCPackingPlanGoodSuppliers,
  actionFetchPurchaseContractByID,
  actionUpdatePCPackingPlanGoodSupplier,
  actionUpdatePurchaseContractPackingPlan,
  actionCreateApproval,
  handleError,
  handleSuccess,
  setApprovals,
  setContracts,
  setPCPackingPlanGoodSuppliers,
  setPurchaseContract,
  setPurchaseContractPackingPlan
} from './slice';
import { isEmpty } from 'lodash-es';

function* createPCPackingPlanGoodSupplierAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(createPCPackingPlanGoodSupplier, action.payload);

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

function* updatePCPackingPlanGoodSupplierAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(updatePCPackingPlanGoodSupplier, action.payload.id, action.payload.data);

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

function* createPCPackingPlanAsync(action: any) {
  try {
    const { pcPackingPlanGoodSuppliers, ...purchaseContractPackingPlan } = action.payload;
    const result: AxiosResponse<any, any> = yield call(createPCPackingPlan, purchaseContractPackingPlan);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPurchaseContractPackingPlan(result?.data?.data));
      if (!isEmpty(pcPackingPlanGoodSuppliers)) {
        const id = result?.data?.data?.id;
        for (const item of pcPackingPlanGoodSuppliers) {
          const itemCreate = {
            ...item,
            contractPlanId: id
          };

          yield call(createPCPackingPlanGoodSupplier, itemCreate);
        }
      }

      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* updatePCPackingPlanAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(updatePCPackingPlan, action.payload.id, action.payload.data);

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

function* fetchPCPackingPlanGoodSupplierAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(fetchPCPackingPlanGoodSupplier, action.payload?.contractPlanId);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPCPackingPlanGoodSuppliers(result?.data?.data ?? []));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* fetchContractAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(fetchContract);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setContracts(result?.data?.data ?? []));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* fetchPurchaseContractByIDAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(fetchPurchaseContractByID, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setPurchaseContract(result?.data?.data ?? {}));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* fetchApprovalByPCPackingPlanIDAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(fetchApprovalByPCPackingPlanID, action.payload);

    if (![200, 201].includes(result.status)) {
      yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
    } else {
      yield put(setApprovals(result?.data?.data ?? {}));
      yield put(handleSuccess());
    }
  } catch (error: any) {
    console.error(error?.message);
    yield put(handleError('Có lỗi khi xảy ra. Vui lòng thử lại sau!'));
  }
}

function* createApprovalAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(createApproval, action.payload);

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

function* deletePCPackingPlanGoodSupplierByIDAsync(action: any) {
  try {
    const result: AxiosResponse<any, any> = yield call(deletePCPackingPlanGoodSupplierByID, action.payload);

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

export default function* watchLogisticSaga() {
  yield takeEvery(actionCreatePCPackingPlanGoodSupplier.type, createPCPackingPlanGoodSupplierAsync);
  yield takeLatest(actionFetchPCPackingPlanGoodSuppliers.type, fetchPCPackingPlanGoodSupplierAsync);
  yield takeLatest(actionFetchContracts.type, fetchContractAsync);
  yield takeLatest(actionFetchPurchaseContractByID.type, fetchPurchaseContractByIDAsync);
  yield takeLatest(actionDeletePCPackingPlanGoodSupplierByID.type, deletePCPackingPlanGoodSupplierByIDAsync);
  yield takeLatest(actionUpdatePCPackingPlanGoodSupplier.type, updatePCPackingPlanGoodSupplierAsync);

  yield takeLatest(actionCreatePurchaseContractPackingPlan.type, createPCPackingPlanAsync);

  yield takeLatest(actionUpdatePurchaseContractPackingPlan.type, updatePCPackingPlanAsync);

  yield takeLatest(actionFetchApprovalByPCPackingPlanID.type, fetchApprovalByPCPackingPlanIDAsync);
  yield takeLatest(actionCreateApproval.type, createApprovalAsync);
}
