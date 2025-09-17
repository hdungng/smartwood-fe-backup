import { createStore, applyMiddleware, Middleware, Store } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from './root-reducer';
import { rootSaga } from './root-saga';

const persistConfig = {
  key: 'root',
  storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the saga middleware
const sagaMiddleware: SagaMiddleware<object> = createSagaMiddleware();
// Explicitly assert the type to Middleware<unknown, any, any>
const middleware: Middleware<unknown, any, any> = sagaMiddleware as Middleware<unknown, any, any>;

// Mount it on the Store
const store = createStore(persistedReducer, applyMiddleware(middleware));
const persist = persistStore(store as Store);

// Run the saga
sagaMiddleware.run(rootSaga);

export { persist };
export default store;
