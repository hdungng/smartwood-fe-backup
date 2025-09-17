import { all } from 'redux-saga/effects';
import watchTransactionFormSaga from './TransactionForm/saga';
import watchCostFormSaga from './CostInfo/saga';
import watchBusinessPlanSaga from './BusinessPLan/saga';
import watchContractSaga from './Contract/saga';
import watchLogisticSaga from './Logistic/saga';
import watchWeightTicketSaga from './WeightSlip/saga';
import watchPCTruck from './LogisticTruck/saga';
import watchPurchaseContract from './PurchaseContract/saga';
import watchPCShip from './LogisticShip/saga';

export function* rootSaga() {
  yield all([
    watchTransactionFormSaga(),
    watchCostFormSaga(),
    watchBusinessPlanSaga(),
    watchContractSaga(),
    watchLogisticSaga(),
    watchWeightTicketSaga(),
    watchPCTruck(),
    watchPurchaseContract(),
    watchPCShip()
  ]);
}
