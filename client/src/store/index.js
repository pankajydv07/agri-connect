import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import authReducer from '../reducers/authReducer';
import productReducer from '../reducers/productReducer';
import orderReducer from '../reducers/orderReducer';
import alertReducer from '../reducers/alertReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  orders: orderReducer,
  alert: alertReducer
});

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
