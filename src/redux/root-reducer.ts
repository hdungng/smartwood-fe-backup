import { combineReducers } from 'redux';

import { supplierInfoReducer } from './SupplierInfo/reducer';
import { transactionFormReducer } from './TransactionForm';
import { costFormReducer } from './CostInfo';
import { businessPLanReducer } from './BusinessPLan';
import { contractReducer } from './Contract';
import { logisticReducer } from './Logistic';
import { weightTicketReducer } from './WeightSlip';
import { logisticTruckReducer } from './LogisticTruck';
import { purchaseContractReducer } from './PurchaseContract';
import { logisticShipReducer } from './LogisticShip';

const rootReducer = combineReducers({
  supplierInfo: supplierInfoReducer,
  transactionForm: transactionFormReducer,
  costForm: costFormReducer,
  businessPlan: businessPLanReducer,
  contract: contractReducer,
  logistic: logisticReducer,
  weightTicket: weightTicketReducer,
  logisticTruck: logisticTruckReducer,
  purchaseContract: purchaseContractReducer,
  logisticShip: logisticShipReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
