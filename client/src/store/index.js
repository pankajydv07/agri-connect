import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import authReducer from '../reducers/authReducer';
import productReducer from '../reducers/productReducer';
import orderReducer from '../reducers/orderReducer';
import alertReducer from '../reducers/alertReducer';
import adminReducer from '../reducers/adminReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  orders: orderReducer,
  alert: alertReducer,
  // AdminDashboard reads state.admin.users / state.admin.stats; without this
  // key registered the dashboard threw on every visit.
  admin: adminReducer
});

const initialState = {};

const middleware = [thunk];

// Only wire up the Redux DevTools bridge outside production.
const composeEnhancers =
  process.env.NODE_ENV !== 'production' ? composeWithDevTools : compose;

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;
